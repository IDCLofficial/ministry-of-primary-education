import { NextResponse } from 'next/server'

interface OdooVerifyResponse {
    status: 'valid' | 'revoked' | 'invalid'
    name?: string
    card_id_number?: string
    position?: string
    lga?: string
    zone?: string
    school?: string
    date_of_employment?: string
    valid_until?: string
    issued_at?: string
    photo?: string
    reason?: string
}

/** Verify a teacher's QR code id against Odoo's card-verification endpoint. */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')?.trim()
        if (!id) {
            return NextResponse.json({ verified: false, error: 'id is required' }, { status: 400 })
        }

        const odooUrl = process.env.ODOO_URL
        if (!odooUrl) {
            return NextResponse.json({ verified: false, error: 'Verification not configured' }, { status: 503 })
        }

        const upstreamRes = await fetch(
            `${odooUrl.replace(/\/$/, '')}/imo_intake/api/verify?id=${encodeURIComponent(id)}`,
            { headers: { Accept: 'application/json' }, cache: 'no-store' }
        )

        if (!upstreamRes.ok) {
            return NextResponse.json({ verified: false, error: 'Verification service error' }, { status: 502 })
        }

        const data: OdooVerifyResponse = await upstreamRes.json()

        if (data.status === 'invalid') {
            return NextResponse.json({ verified: false, error: 'Teacher not found' }, { status: 404 })
        }

        if (data.status === 'revoked') {
            return NextResponse.json(
                { verified: false, error: data.reason || 'This teacher ID is not currently valid' },
                { status: 410 }
            )
        }

        return NextResponse.json({
            verified: true,
            teacher: {
                name: data.name,
                staffId: data.card_id_number,
                school: data.school,
                position: data.position,
                lga: data.lga,
                zone: data.zone,
                validUntil: data.valid_until,
                photoUrl: data.photo,
            },
        })
    } catch (e) {
        console.error('Teacher verify error:', e)
        return NextResponse.json({ verified: false, error: 'Verification service unavailable' }, { status: 502 })
    }
}
