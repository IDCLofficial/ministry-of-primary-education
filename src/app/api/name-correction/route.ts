import { NextRequest } from 'next/server'
import { updateStudentName } from './nameCorrectionClient'
import { classifyNameEdit, isSimpleNameEdit } from '@/app/result-checking/data/nameEditClassifier'
import { SUPPORTED_EXAM_TYPE_VALUES } from '@/app/result-checking/data/supportChatPrompt'

// Deterministic, non-AI self-service name correction. The client (the
// "Fix my name" flow in DetailsCheckBanner) already ran the same classifier
// for instant feedback — this re-runs it server-side because a client-side
// check is advisory only, never enforcement, before performing the actual
// write to the student record.

const RATE_LIMIT = 10
const RATE_WINDOW_MS = 10 * 60 * 1000
const hits = new Map<string, number[]>()

function isRateLimited(key: string): boolean {
    const now = Date.now()
    const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
    recent.push(now)
    hits.set(key, recent)
    return recent.length > RATE_LIMIT
}

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/

export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (isRateLimited(ip)) {
        return Response.json({ error: 'Too many attempts, please try again shortly.' }, { status: 429 })
    }

    let body: { studentId?: string; examType?: string; currentName?: string; newName?: string }
    try {
        body = await request.json()
    } catch {
        return Response.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { studentId, examType, currentName, newName } = body
    if (!studentId || !OBJECT_ID_RE.test(studentId)) {
        return Response.json({ error: 'Invalid student reference' }, { status: 400 })
    }
    if (!examType || !SUPPORTED_EXAM_TYPE_VALUES.includes(examType as (typeof SUPPORTED_EXAM_TYPE_VALUES)[number])) {
        return Response.json({ error: 'Invalid exam type' }, { status: 400 })
    }
    if (typeof currentName !== 'string' || typeof newName !== 'string' || !newName.trim()) {
        return Response.json({ error: 'Invalid name' }, { status: 400 })
    }

    const classification = classifyNameEdit(currentName, newName)
    if (classification === 'identical') {
        return Response.json({ error: 'That matches the name already on record.' }, { status: 400 })
    }
    if (!isSimpleNameEdit(classification)) {
        return Response.json({ error: 'This change needs manual review and cannot be applied automatically.' }, { status: 422 })
    }

    try {
        const result = await updateStudentName(examType, studentId, newName.trim().toUpperCase())
        return Response.json({ success: true, updatedName: result.updatedName })
    } catch (e) {
        // Logged in full so the real cause (backend status + body) shows up
        // in the server console — the client only gets a generic message.
        console.error('name-correction apply failed:', e instanceof Error ? e.message : e)
        return Response.json({ error: 'That failed on our end. Please try again or contact support.' }, { status: 502 })
    }
}
