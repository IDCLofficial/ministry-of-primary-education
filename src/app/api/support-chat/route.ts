import { NextRequest } from 'next/server'
import { FunctionDeclaration, GoogleGenAI, Type } from '@google/genai'
import {
    SUPPORT_CHAT_SYSTEM_PROMPT,
    SUPPORTED_EXAM_TYPE_VALUES,
    SUPPORT_REASON_VALUES,
    LGA_VALUES,
} from '@/app/result-checking/data/supportChatPrompt'

const MODEL = 'gemini-3.1-flash-lite'

const submitTicketDeclaration: FunctionDeclaration = {
    name: 'submit_ticket',
    description:
        'File a support ticket once full name, LGA, school name, exam year, exam type, reason for contact, email, and phone number have all been collected and confirmed with the user.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            fullName: { type: Type.STRING, description: "The student/contact's full name." },
            lga: { type: Type.STRING, enum: LGA_VALUES, description: 'One of the 27 Imo State LGAs.' },
            schoolName: { type: Type.STRING },
            year: { type: Type.INTEGER, description: 'Exam year, e.g. 2025.' },
            exam: { type: Type.STRING, enum: SUPPORTED_EXAM_TYPE_VALUES },
            examNo: { type: Type.STRING, description: 'Optional exam number, if the user has it.' },
            reasonForContact: { type: Type.STRING, enum: SUPPORT_REASON_VALUES },
            other: {
                type: Type.STRING,
                description: 'Free-text description, required when reasonForContact is "other".',
            },
            email: { type: Type.STRING },
            phone: { type: Type.STRING, description: '11-digit Nigerian phone number starting with 0.' },
        },
        required: ['fullName', 'lga', 'schoolName', 'year', 'exam', 'reasonForContact', 'email', 'phone'],
    },
}

// In-memory sliding-window limiter. Resets on cold start / across server
// instances — acceptable at this traffic level, not a substitute for an
// edge/WAF-level limiter if abuse becomes a real problem.
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 10 * 60 * 1000
const hits = new Map<string, number[]>()

function isRateLimited(key: string): boolean {
    const now = Date.now()
    const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
    recent.push(now)
    hits.set(key, recent)
    return recent.length > RATE_LIMIT
}

interface ChatMessage {
    role: 'user' | 'assistant'
    text: string
}

const MAX_MESSAGES = 40
const MAX_MESSAGE_LENGTH = 2000

export async function POST(request: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        return Response.json({ error: 'Chat is not configured' }, { status: 503 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (isRateLimited(ip)) {
        return Response.json({ error: 'Too many messages, please slow down and try again shortly.' }, { status: 429 })
    }

    let messages: ChatMessage[]
    try {
        const body = await request.json()
        messages = Array.isArray(body?.messages) ? body.messages : []
    } catch {
        return Response.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (!messages.length || messages.length > MAX_MESSAGES) {
        return Response.json({ error: 'Invalid message history' }, { status: 400 })
    }
    if (messages.some((m) => typeof m.text !== 'string' || m.text.length > MAX_MESSAGE_LENGTH)) {
        return Response.json({ error: 'Message too long' }, { status: 400 })
    }

    const ai = new GoogleGenAI({ apiKey })

    const contents = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }],
    }))

    const encoder = new TextEncoder()

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            const send = (line: object) => controller.enqueue(encoder.encode(JSON.stringify(line) + '\n'))

            try {
                const responseStream = await ai.models.generateContentStream({
                    model: MODEL,
                    contents,
                    config: {
                        systemInstruction: SUPPORT_CHAT_SYSTEM_PROMPT,
                        tools: [{ functionDeclarations: [submitTicketDeclaration] }],
                        maxOutputTokens: 1024,
                    },
                })

                for await (const chunk of responseStream) {
                    if (chunk.text) {
                        send({ type: 'text', value: chunk.text })
                    }
                    const calls = chunk.functionCalls
                    if (calls?.length) {
                        for (const call of calls) {
                            send({ type: 'function_call', value: { name: call.name, args: call.args } })
                        }
                    }
                }
            } catch (e) {
                console.error('support-chat stream error:', e)
                send({ type: 'error', value: 'The assistant hit an error. Please try again.' })
            } finally {
                controller.close()
            }
        },
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'application/x-ndjson; charset=utf-8',
            'Cache-Control': 'no-store',
        },
    })
}
