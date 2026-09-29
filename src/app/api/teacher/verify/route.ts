import { NextResponse } from 'next/server'
import { importSPKI, jwtVerify } from 'jose'
import { odooExecuteKw } from '@/lib/odoo'

interface OdooVerificationToken {
    jti: string
    teacher_id: [number, string] | false
    expires_at: string | false
    revoked_at: string | false
}

interface OdooTeacherIntake {
    name: string
    card_id_number: string | false
    school_of_posting: string | false
    card_position: string | false
    intake_stage: string
    on_hold_reason: string | false
    photograph: string | false
}

const STAGE_LABELS: Record<string, string> = {
    complete: 'Active',
    desk3_complete: 'Active',
    desk4_active: 'Active',
    on_hold: 'On hold',
}

let cachedPublicKey: Promise<CryptoKey> | null = null

function getPublicKey() {
    if (!cachedPublicKey) {
        const pem = process.env.TEACHER_JWT_PUBLIC_KEY?.replace(/\\n/g, '\n')
        if (!pem) throw new Error('Missing TEACHER_JWT_PUBLIC_KEY')
        cachedPublicKey = importSPKI(pem, 'ES256')
    }
    return cachedPublicKey
}

/** Verify a teacher by the signed QR token against Odoo. */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')?.trim()
        if (!id) {
            return NextResponse.json({ verified: false, error: 'id is required' }, { status: 400 })
        }

        if (!process.env.ODOO_URL || !process.env.ODOO_DB || !process.env.ODOO_LOGIN || !process.env.ODOO_API_KEY || !process.env.TEACHER_JWT_PUBLIC_KEY) {
            return NextResponse.json({ verified: false, error: 'Verification not configured' }, { status: 503 })
        }

        let jti: string
        try {
            const { payload } = await jwtVerify(id, await getPublicKey(), { algorithms: ['ES256'] })
            if (!payload.jti) throw new Error('Token missing jti claim')
            jti = payload.jti
        } catch {
            return NextResponse.json({ verified: false, error: 'Invalid or tampered verification code' }, { status: 404 })
        }

        const tokens = await odooExecuteKw<OdooVerificationToken[]>(
            'imo.verification.token',
            'search_read',
            [[['jti', '=', jti]]],
            { fields: ['jti', 'teacher_id', 'expires_at', 'revoked_at'], limit: 1 }
        )
        const token = tokens[0]

        if (!token || !token.teacher_id) {
            return NextResponse.json({ verified: false, error: 'Teacher not found' }, { status: 404 })
        }
        if (token.revoked_at) {
            return NextResponse.json({ verified: false, error: 'This teacher ID has been revoked' }, { status: 410 })
        }
        if (token.expires_at && new Date(token.expires_at) < new Date()) {
            return NextResponse.json({ verified: false, error: 'This verification code has expired' }, { status: 410 })
        }

        const teachers = await odooExecuteKw<OdooTeacherIntake[]>(
            'imo.teacher.intake',
            'read',
            [[token.teacher_id[0]]],
            { fields: ['name', 'card_id_number', 'school_of_posting', 'card_position', 'intake_stage', 'on_hold_reason', 'photograph'] }
        )
        const teacher = teachers[0]
        if (!teacher) {
            return NextResponse.json({ verified: false, error: 'Teacher not found' }, { status: 404 })
        }

        const status = teacher.on_hold_reason
            ? 'On hold'
            : STAGE_LABELS[teacher.intake_stage] || teacher.intake_stage

        return NextResponse.json({
            verified: true,
            teacher: {
                name: teacher.name || undefined,
                staffId: teacher.card_id_number || undefined,
                school: teacher.school_of_posting || undefined,
                position: teacher.card_position || undefined,
                status,
                photoUrl: teacher.photograph ? `data:image/jpeg;base64,${teacher.photograph}` : undefined,
            },
        })
    } catch (e) {
        console.error('Teacher verify error:', e)
        return NextResponse.json({ verified: false, error: 'Verification service unavailable' }, { status: 502 })
    }
}
