// Server-only client for the "results playground" admin API that backs
// self-service name correction. Never import this from client code — it
// holds a service-account credential and an auth token in memory.
//
// Auth model: this is a dedicated service account (NOT a human admin's
// personal login) — its email/password live in env vars and the resulting
// JWT is cached in memory with its real expiry (decoded from the token
// itself, not assumed), refreshed transparently when stale or rejected.

const BASE_URL = process.env.NAME_CORRECTION_API_BASE_URL
const SERVICE_EMAIL = process.env.NAME_CORRECTION_SERVICE_EMAIL
const SERVICE_PASSWORD = process.env.NAME_CORRECTION_SERVICE_PASSWORD

interface CachedToken {
    token: string
    expiresAt: number // ms epoch
}

let cached: CachedToken | null = null
// Serializes concurrent logins so a burst of requests on a cold cache
// doesn't fire multiple simultaneous login calls.
let loginInFlight: Promise<string> | null = null

/** Decode a JWT's `exp` claim (seconds since epoch) without verifying the signature — we trust it because we just received it directly from our own login call. */
function decodeJwtExpiryMs(token: string): number | null {
    try {
        const payloadB64 = token.split('.')[1]
        const json = Buffer.from(payloadB64, 'base64').toString('utf8')
        const payload = JSON.parse(json) as { exp?: number }
        return typeof payload.exp === 'number' ? payload.exp * 1000 : null
    } catch {
        return null
    }
}

async function login(): Promise<string> {
    if (!BASE_URL || !SERVICE_EMAIL || !SERVICE_PASSWORD) {
        throw new Error('Name correction is not configured (missing NAME_CORRECTION_API_BASE_URL / SERVICE_EMAIL / SERVICE_PASSWORD)')
    }

    const res = await fetch(`${BASE_URL}/results-playground/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: SERVICE_EMAIL, password: SERVICE_PASSWORD }),
    })

    if (!res.ok) {
        const detail = await res.text().catch(() => '')
        throw new Error(`Name correction login failed: ${res.status} ${detail}`)
    }

    const data = await res.json() as { access_token?: string }
    if (!data.access_token) throw new Error('Name correction login response had no access_token')

    const expiresAt = decodeJwtExpiryMs(data.access_token) ?? (Date.now() + 23 * 60 * 60 * 1000)
    cached = { token: data.access_token, expiresAt }
    return data.access_token
}

/** Returns a valid token, re-logging in if missing/near-expiry. Concurrent callers share one login call. */
async function getValidToken(forceRefresh = false): Promise<string> {
    const SAFETY_MARGIN_MS = 60_000
    if (!forceRefresh && cached && cached.expiresAt - Date.now() > SAFETY_MARGIN_MS) {
        return cached.token
    }
    if (!loginInFlight) {
        loginInFlight = login().finally(() => { loginInFlight = null })
    }
    return loginInFlight
}

/** Calls the playground API with a valid token, retrying once with a forced re-login on 401. */
async function authedFetch(path: string, init: RequestInit): Promise<Response> {
    let token = await getValidToken()
    let res = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers: { ...init.headers, Authorization: `Bearer ${token}` },
    })
    if (res.status === 401) {
        token = await getValidToken(true)
        res = await fetch(`${BASE_URL}${path}`, {
            ...init,
            headers: { ...init.headers, Authorization: `Bearer ${token}` },
        })
    }
    return res
}

export interface PlaygroundStudent {
    _id: string
    name: string
    examNo: string
    examYear: number
    school: string
    lga: string
    examType: string
}

export interface UpdateNameResult {
    message: string
    updatedName: string
}

/** Apply a name correction. This is a real write to the live student record — callers must have already confirmed the change with the user and classified it as a supported edit. */
export async function updateStudentName(examType: string, studentId: string, newName: string): Promise<UpdateNameResult> {
    const res = await authedFetch('/results-playground/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examType, studentId, newName }),
    })
    const rawText = await res.text()
    if (!res.ok) {
        throw new Error(`Name update failed: ${res.status} ${rawText}`)
    }
    // Defensive: log the raw shape once so a mismatch between what we expect
    // and what the backend actually returns is visible in the server
    // console instead of surfacing as an opaque failure.
    let parsed: unknown
    try {
        parsed = JSON.parse(rawText)
    } catch {
        console.error('name-correction: update-name returned non-JSON 2xx body:', rawText)
        // The write almost certainly went through (status was ok) even
        // though we can't confirm the backend's echoed name — report what
        // we sent rather than throwing away a successful write.
        return { message: 'ok', updatedName: newName }
    }
    const obj = parsed as { message?: string; updatedStudent?: { name?: string }; student?: { name?: string }; name?: string }
    const updatedName = obj.updatedStudent?.name ?? obj.student?.name ?? obj.name ?? newName
    if (!obj.updatedStudent?.name && !obj.student?.name && !obj.name) {
        console.error('name-correction: update-name 2xx body did not contain a recognizable name field, falling back to the submitted name:', rawText)
    }
    return { message: obj.message ?? 'ok', updatedName }
}
