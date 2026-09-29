import { NextResponse } from 'next/server'

/** Verify a teacher by ID/staff number against the external verification API. */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')?.trim()
        if (!id) {
            return NextResponse.json(
                { verified: false, error: 'id is required' },
                { status: 400 }
            )
        }

        const apiUrl = process.env.TEACHER_VERIFY_API_URL
        if (!apiUrl) {
            return NextResponse.json(
                { verified: false, error: 'Verification not configured' },
                { status: 503 }
            )
        }

        const upstreamUrl = `${apiUrl.replace(/\/$/, '')}/${encodeURIComponent(id)}`
        const upstreamRes = await fetch(upstreamUrl, {
            method: 'GET',
            headers: { Accept: 'application/json' },
            cache: 'no-store',
        })

        if (upstreamRes.status === 404) {
            return NextResponse.json(
                { verified: false, error: 'Teacher not found' },
                { status: 404 }
            )
        }

        if (!upstreamRes.ok) {
            return NextResponse.json(
                { verified: false, error: 'Verification service error' },
                { status: 502 }
            )
        }

        const teacher = await upstreamRes.json()
        return NextResponse.json({ verified: true, teacher })
    } catch (e) {
        console.error('Teacher verify error:', e)
        return NextResponse.json(
            { verified: false, error: 'Verification service unavailable' },
            { status: 502 }
        )
    }
}
