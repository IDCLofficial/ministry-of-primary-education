'use client'

import type { VoucherResponse } from '@/app/result-checking/store/api/studentApi'

const STORAGE_KEY_PREFIX = 'bulk-voucher-'

let cachedKey: Promise<CryptoKey> | null = null

async function getKey(): Promise<CryptoKey> {
    if (cachedKey) return cachedKey
    cachedKey = (async () => {
        const salt = new TextEncoder().encode('moe-voucher-v1')
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode('moe-bulk-download-key-2026'),
            'PBKDF2',
            false,
            ['deriveKey'],
        )
        return crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt'],
        )
    })()
    return cachedKey
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    return btoa(binary)
}

function base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
}

export async function saveVoucherToStorage(examType: string, voucher: VoucherResponse): Promise<void> {
    try {
        const key = await getKey()
        const iv = crypto.getRandomValues(new Uint8Array(12))
        const data = new TextEncoder().encode(JSON.stringify(voucher))
        const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)
        const combined = new Uint8Array(iv.length + ciphertext.byteLength)
        combined.set(iv)
        combined.set(new Uint8Array(ciphertext), iv.length)
        localStorage.setItem(STORAGE_KEY_PREFIX + examType, uint8ArrayToBase64(combined))
    } catch (e) {
        console.error('Failed to save voucher', e)
    }
}

export async function loadVoucherFromStorage(examType: string): Promise<VoucherResponse | null> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_PREFIX + examType)
        if (!raw) return null
        const key = await getKey()
        const combined = base64ToUint8Array(raw)
        const iv = combined.slice(0, 12)
        const ciphertext = combined.slice(12)
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
        return JSON.parse(new TextDecoder().decode(decrypted)) as VoucherResponse
    } catch (e) {
        console.error('Failed to load voucher', e)
        localStorage.removeItem(STORAGE_KEY_PREFIX + examType)
        return null
    }
}

export function hasVoucherInStorage(examType: string): boolean {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem(STORAGE_KEY_PREFIX + examType)
}

export function clearVoucherFromStorage(examType: string): void {
    localStorage.removeItem(STORAGE_KEY_PREFIX + examType)
}
