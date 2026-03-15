'use client'

/**
 * Encrypted localStorage for BECE & UBEAT dashboards.
 * Uses Web Crypto API (AES-GCM) so stored values are not plain readable text.
 * Supports migration: existing plain values are read as-is and re-encrypted on next set.
 */

import { useState, useCallback, useEffect } from 'react'

const ENC_PREFIX = 'enc:'
const SALT = 'mope-student-portal-v1'
const KEY_ALG = { name: 'PBKDF2', hash: 'SHA-256', iterations: 120_000 }
const AES_ALG = { name: 'AES-GCM', length: 256 }
const IV_BYTES = 12
const GCM_TAG_BITS = 128

function getSecret(): string {
    if (typeof process !== 'undefined' && process.env?.STORAGE_SECRET) {
        return process.env.STORAGE_SECRET
    }
    return 'mope-student-portal-default-secret'
}

async function deriveKey(secret: string): Promise<CryptoKey> {
    const enc = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(secret),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    )
    return crypto.subtle.deriveKey(
        {
            ...KEY_ALG,
            salt: enc.encode(SALT),
        },
        keyMaterial,
        AES_ALG,
        false,
        ['encrypt', 'decrypt']
    )
}

async function encrypt(plain: string): Promise<string> {
    const key = await deriveKey(getSecret())
    const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
    const enc = new TextEncoder()
    const cipher = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv, tagLength: GCM_TAG_BITS },
        key,
        enc.encode(plain)
    )
    const combined = new Uint8Array(iv.length + cipher.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(cipher), iv.length)
    return btoa(String.fromCharCode(...combined))
}

async function decrypt(b64: string): Promise<string | null> {
    try {
        const combined = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
        if (combined.length < IV_BYTES + 16) return null
        const iv = combined.slice(0, IV_BYTES)
        const cipher = combined.slice(IV_BYTES)
        const key = await deriveKey(getSecret())
        const dec = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv, tagLength: GCM_TAG_BITS },
            key,
            cipher
        )
        return new TextDecoder().decode(dec)
    } catch {
        return null
    }
}

function isEncrypted(value: string): boolean {
    return value.startsWith(ENC_PREFIX)
}

/** Get item: decrypt if stored as encrypted, else return raw (legacy migration). */
export async function getSecureItem(key: string): Promise<string | null> {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(key)
    if (raw == null) return null
    if (isEncrypted(raw)) {
        const dec = await decrypt(raw.slice(ENC_PREFIX.length))
        return dec
    }
    return raw
}

/** Set item: encrypt and store with prefix so we can detect encrypted values. */
export async function setSecureItem(key: string, value: string): Promise<void> {
    if (typeof localStorage === 'undefined') return
    const cipher = await encrypt(value)
    localStorage.setItem(key, ENC_PREFIX + cipher)
}

/** Remove item (no encryption needed). */
export function removeSecureItem(key: string): void {
    if (typeof localStorage === 'undefined') return
    localStorage.removeItem(key)
}

/** Encrypted localStorage hook for JSON (e.g. bece_recent_accounts, ubeat_recent_accounts). */
export function useSecureLocalStorage<T>(key: string, initialValue: T): [T, (update: T | ((prev: T) => T)) => void] {
    const [value, setValueState] = useState<T>(initialValue)

    useEffect(() => {
        let cancelled = false
        getSecureItem(key).then((raw) => {
            if (cancelled) return
            if (raw != null && raw !== '') {
                try {
                    setValueState(JSON.parse(raw) as T)
                } catch {
                    // keep initial on parse error
                }
            }
        })
        return () => { cancelled = true }
    }, [key])

    const setValue = useCallback(
        (update: T | ((prev: T) => T)) => {
            setValueState((prev) => {
                const next = typeof update === 'function' ? (update as (prev: T) => T)(prev) : update
                setSecureItem(key, JSON.stringify(next)).then(() => {})
                return next
            })
        },
        [key]
    )
    return [value, setValue]
}

// ---------------------------------------------------------------------------
// Exam portal: sync token access for prepareHeaders (encrypted at rest)
// ---------------------------------------------------------------------------

let examPortalToken: string | null = null

export function setExamPortalToken(token: string | null): void {
    examPortalToken = token
}

export function getExamPortalToken(): string | null {
    return examPortalToken
}

// ---------------------------------------------------------------------------
// Portal (school): sync token access for prepareHeaders / authApi (encrypted at rest)
// ---------------------------------------------------------------------------

let portalToken: string | null = null

export function setPortalToken(token: string | null): void {
    portalToken = token
}

export function getPortalToken(): string | null {
    return portalToken
}
