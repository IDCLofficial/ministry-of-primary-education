/**
 * API response funnel: receive encrypted API responses and decrypt into typed data.
 * Uses a dedicated env key (not the storage secret). Not applied anywhere by default.
 *
 * Env: API_RESPONSE_DECRYPT_SECRET (server) or NEXT_PUBLIC_API_RESPONSE_SECRET (client).
 * Same secret must be used by the backend when encrypting responses.
 */

const SALT = 'mope-api-response-funnel-v1'
const KEY_ALG = { name: 'PBKDF2', hash: 'SHA-256', iterations: 120_000 }
const AES_ALG = { name: 'AES-GCM', length: 256 }
const IV_BYTES = 12
const GCM_TAG_BITS = 128

function getApiResponseSecret(): string {
  if (typeof process !== 'undefined') {
    const server = process.env?.API_RESPONSE_DECRYPT_SECRET
    const client = process.env?.NEXT_PUBLIC_API_RESPONSE_SECRET
    const secret = server ?? client
    if (secret && String(secret).length >= 8) return secret
  }
  return ''
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
    { ...KEY_ALG, salt: enc.encode(SALT) },
    keyMaterial,
    AES_ALG,
    false,
    ['decrypt']
  )
}

/**
 * Decrypt an encrypted API response payload (base64 IV||ciphertext) and parse as JSON.
 * Returns typed data or throws if secret missing, decrypt fails, or JSON is invalid.
 */
export async function decryptApiResponse<T>(encryptedPayload: string): Promise<T> {
  const secret = getApiResponseSecret()
  if (!secret) {
    throw new Error('API_RESPONSE_DECRYPT_SECRET or NEXT_PUBLIC_API_RESPONSE_SECRET is not set or too short (min 8 chars)')
  }

  let combined: Uint8Array
  try {
    combined = Uint8Array.from(atob(encryptedPayload.trim()), (c) => c.charCodeAt(0))
  } catch {
    throw new Error('apiResponseFunnel: invalid base64 in encrypted payload')
  }
  if (combined.length < IV_BYTES + 16) {
    throw new Error('apiResponseFunnel: payload too short to be valid')
  }

  const iv = combined.slice(0, IV_BYTES)
  const cipher = combined.slice(IV_BYTES)
  const key = await deriveKey(secret)

  let plain: ArrayBuffer
  try {
    plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv, tagLength: GCM_TAG_BITS },
      key,
      cipher
    )
  } catch (e) {
    throw new Error(`apiResponseFunnel: decryption failed (wrong key or corrupted payload): ${e instanceof Error ? e.message : String(e)}`)
  }

  const text = new TextDecoder().decode(plain)
  try {
    return JSON.parse(text) as T
  } catch (e) {
    throw new Error(`apiResponseFunnel: decrypted payload is not valid JSON: ${e instanceof Error ? e.message : String(e)}`)
  }
}

/**
 * Check if the env key is configured (for guards before calling APIs that return encrypted responses).
 */
export function isApiResponseDecryptConfigured(): boolean {
  const secret = getApiResponseSecret()
  return secret.length >= 8
}

/**
 * Decrypt when the API returns an object with an encrypted field (e.g. { data: "<base64>" } or { encrypted: "<base64>" }).
 * Pass the key that holds the base64 payload.
 */
export async function decryptApiResponseFrom<T>(
  response: Record<string, unknown>,
  payloadKey: string = 'data'
): Promise<T> {
  const raw = response[payloadKey]
  if (typeof raw !== 'string') {
    throw new Error(`apiResponseFunnel: expected string at response.${payloadKey}`)
  }
  return decryptApiResponse<T>(raw)
}
