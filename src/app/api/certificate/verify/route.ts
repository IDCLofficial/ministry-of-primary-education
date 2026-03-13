import { NextResponse } from 'next/server'

const ALG = { name: 'HMAC', hash: 'SHA-256' } as const

/** Verify a certificate payload signature. */
export async function POST(request: Request) {
    try {
        const secret = process.env.CERT_SIGNING_SECRET
        if (!secret || secret.length < 16) {
            return NextResponse.json(
                { valid: false, error: 'Verification not configured' },
                { status: 503 }
            )
        }

        const body = await request.json()
        const { payload, sig } = body as { payload: Record<string, unknown>; sig: string }
        if (!payload || typeof sig !== 'string') {
            return NextResponse.json(
                { valid: false, error: 'payload and sig required' },
                { status: 400 }
            )
        }

        const msgBuffer = new TextEncoder().encode(JSON.stringify(payload))
        const keyBuffer = new TextEncoder().encode(secret)

        const key = await crypto.subtle.importKey(
            'raw',
            keyBuffer,
            ALG,
            false,
            ['sign']
        )
        const expectedSig = await crypto.subtle.sign(ALG, key, msgBuffer)
        const expectedBase64 = btoa(String.fromCharCode(...new Uint8Array(expectedSig)))

        const valid = sig.length > 0 && sig === expectedBase64
        return NextResponse.json({ valid })
    } catch (e) {
        console.error('Certificate verify error:', e)
        return NextResponse.json({ valid: false, error: 'Verification failed' }, { status: 500 })
    }
}
