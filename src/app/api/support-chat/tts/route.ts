import { NextRequest } from 'next/server'

const VOICE_NAME = 'en-NG-EzinneNeural'
const MAX_TEXT_LENGTH = 2000

// Same in-memory limiter pattern as /api/support-chat — resets on cold
// start / across instances, fine at this traffic level.
const RATE_LIMIT = 40
const RATE_WINDOW_MS = 10 * 60 * 1000
const hits = new Map<string, number[]>()

function isRateLimited(key: string): boolean {
    const now = Date.now()
    const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
    recent.push(now)
    hits.set(key, recent)
    return recent.length > RATE_LIMIT
}

function escapeSsml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

export async function POST(request: NextRequest) {
    const key = process.env.AZURE_SPEECH_KEY
    const region = process.env.AZURE_SPEECH_REGION
    if (!key || !region) {
        return Response.json({ error: 'Voice is not configured' }, { status: 503 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (isRateLimited(ip)) {
        return Response.json({ error: 'Too many voice requests, please slow down.' }, { status: 429 })
    }

    let text: string
    try {
        const body = await request.json()
        text = typeof body?.text === 'string' ? body.text : ''
    } catch {
        return Response.json({ error: 'Invalid request body' }, { status: 400 })
    }

    text = text.trim().slice(0, MAX_TEXT_LENGTH)
    if (!text) {
        return Response.json({ error: 'No text to speak' }, { status: 400 })
    }

    const ssml = `<speak version="1.0" xml:lang="en-NG"><voice xml:lang="en-NG" xml:gender="Female" name="${VOICE_NAME}">${escapeSsml(text)}</voice></speak>`

    try {
        const azureRes = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': key,
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
                'User-Agent': 'imo-result-checking-support-chat',
            },
            body: ssml,
        })

        if (!azureRes.ok || !azureRes.body) {
            const detail = await azureRes.text().catch(() => '')
            console.error('Azure TTS error:', azureRes.status, detail)
            return Response.json({ error: 'Could not generate voice audio' }, { status: 502 })
        }

        return new Response(azureRes.body, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'no-store',
            },
        })
    } catch (e) {
        console.error('TTS request failed:', e)
        return Response.json({ error: 'Could not generate voice audio' }, { status: 502 })
    }
}
