'use client'

/**
 * Encrypted localStorage for BECE & UBEAT dashboards.
 * Encryption/decryption run on the server via server actions so the secret
 * (STORAGE_SECRET) never reaches the client. Client stores ciphertext in
 * localStorage. Supports migration: existing plain values are read as-is
 * and re-encrypted on next set.
 */

import { useState, useCallback, useEffect } from 'react'
import { encryptForStorage, decryptFromStorage } from './secureStorageServer'

const ENC_PREFIX = 'enc:'

function isEncrypted(value: string): boolean {
    return value.startsWith(ENC_PREFIX)
}

/** Get item: decrypt if stored as encrypted, else return raw (legacy migration). */
export async function getSecureItem(key: string): Promise<string | null> {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(key)
    if (raw == null) return null
    if (isEncrypted(raw)) {
        const dec = await decryptFromStorage(raw.slice(ENC_PREFIX.length))
        return dec
    }
    return raw
}

/** Set item: encrypt on server and store with prefix so we can detect encrypted values. */
export async function setSecureItem(key: string, value: string): Promise<void> {
    if (typeof localStorage === 'undefined') return
    const cipher = await encryptForStorage(value)
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
        // Defer so server action (decryptFromStorage) isn't invoked in same tick as commit — avoids "Cannot update Router while rendering"
        const id = setTimeout(() => {
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
        }, 0)
        return () => {
            cancelled = true
            clearTimeout(id)
        }
    }, [key])

    const setValue = useCallback(
        (update: T | ((prev: T) => T)) => {
            setValueState((prev) => {
                const next = typeof update === 'function' ? (update as (prev: T) => T)(prev) : update
                setSecureItem(key, JSON.stringify(next)).then(() => { })
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
