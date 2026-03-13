import { NextResponse } from 'next/server'

const ALG = { name: 'HMAC', hash: 'SHA-256' } as const

/** Sign a certificate payload with HMAC for tamper detection. Server-side only. */
export async function POST(request: Request) {
    try {
        const secret = process.env.CERT_SIGNING_SECRET
        if (!secret || secret.length < 16) {
            return NextResponse.json(
                { error: 'Certificate signing not configured. Set CERT_SIGNING_SECRET (min 8 chars, 16+ recommended for production).' },
                { status: 503 }
            )
        }

        const body = await request.json()
        const { name, examNo, serial, year, issueDate } = body as {
            name?: string
            examNo?: string
            serial?: string
            year?: number | string
            issueDate?: string
        }
        if (!name || !examNo) {
            return NextResponse.json(
                { error: 'name and examNo required' },
                { status: 400 }
            )
        }

        const payload = {
            name,
            examNo,
            serial: serial ?? '',
            year: year ?? '',
            issueDate: issueDate ?? new Date().toISOString().slice(0, 10),
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
        const signature = await crypto.subtle.sign(ALG, key, msgBuffer)
        const sigBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))

        return NextResponse.json({ sig: sigBase64 })
    } catch (e) {
        console.error('Certificate sign error:', e)
        return NextResponse.json({ error: 'Signing failed' }, { status: 500 })
    }
}