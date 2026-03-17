'use server'

/**
 * Server-only encrypt/decrypt for student portal secure storage.
 * The secret is read from STORAGE_SECRET (server-only env, no NEXT_PUBLIC_)
 * so it never reaches the client. Set STORAGE_SECRET in .env; if you
 * previously used NEXT_PUBLIC_STORAGE_SECRET, use the same value so
 * existing encrypted localStorage entries can be decrypted.
 */

import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from 'crypto'

const SALT = 'mope-student-portal-v1'
const IV_BYTES = 12
const TAG_BYTES = 16
const KEY_LEN = 32
const PBKDF2_ITERATIONS = 120_000

function getSecret(): string {
    if (process.env.STORAGE_SECRET) {
        return process.env.STORAGE_SECRET
    }
    return 'mope-student-portal-default-secret'
}

function deriveKey(secret: string): Buffer {
    return pbkdf2Sync(
        secret,
        Buffer.from(SALT, 'utf8'),
        PBKDF2_ITERATIONS,
        KEY_LEN,
        'sha256'
    )
}

/** Encrypt plaintext on the server; returns base64(IV || ciphertext || tag). */
export async function encryptForStorage(plainText: string): Promise<string> {
    const key = deriveKey(getSecret())
    const iv = randomBytes(IV_BYTES)
    const cipher = createCipheriv('aes-256-gcm', key, iv)
    const encrypted = Buffer.concat([
        cipher.update(plainText, 'utf8'),
        cipher.final(),
    ])
    const tag = cipher.getAuthTag()
    const combined = Buffer.concat([iv, encrypted, tag])
    return combined.toString('base64')
}

/** Decrypt base64(IV || ciphertext || tag) on the server; returns plaintext or null. */
export async function decryptFromStorage(cipherB64: string): Promise<string | null> {
    try {
        const combined = Buffer.from(cipherB64, 'base64')
        if (combined.length < IV_BYTES + TAG_BYTES) return null
        const iv = combined.subarray(0, IV_BYTES)
        const tag = combined.subarray(combined.length - TAG_BYTES)
        const encrypted = combined.subarray(IV_BYTES, combined.length - TAG_BYTES)
        const key = deriveKey(getSecret())
        const decipher = createDecipheriv('aes-256-gcm', key, iv)
        decipher.setAuthTag(tag)
        return decipher.update(encrypted).toString('utf8') + decipher.final('utf8')
    } catch {
        return null
    }
}
