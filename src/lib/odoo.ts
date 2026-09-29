/** Minimal JSON-RPC client for the Odoo external API (server-side only). */

let cachedUid: number | null = null

function requireEnv(name: string): string {
    const value = process.env[name]
    if (!value) throw new Error(`Missing required env var: ${name}`)
    return value
}

async function callRpc<T>(service: string, method: string, args: unknown[]): Promise<T> {
    const url = `${requireEnv('ODOO_URL').replace(/\/$/, '')}/jsonrpc`
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: { service, method, args },
            id: Date.now(),
        }),
        cache: 'no-store',
    })

    const json = await res.json()
    if (json.error) {
        throw new Error(json.error.data?.message || json.error.message || 'Odoo RPC error')
    }
    return json.result as T
}

async function getUid(): Promise<number> {
    if (cachedUid) return cachedUid
    const uid = await callRpc<number | false>('common', 'authenticate', [
        requireEnv('ODOO_DB'),
        requireEnv('ODOO_LOGIN'),
        requireEnv('ODOO_API_KEY'),
        {},
    ])
    if (!uid) throw new Error('Odoo authentication failed')
    cachedUid = uid
    return uid
}

/** Call a model method via Odoo's execute_kw, authenticating (and re-authenticating once on auth failure) as needed. */
export async function odooExecuteKw<T>(
    model: string,
    method: string,
    args: unknown[],
    kwargs: Record<string, unknown> = {}
): Promise<T> {
    const uid = await getUid()
    try {
        return await callRpc<T>('object', 'execute_kw', [
            requireEnv('ODOO_DB'),
            uid,
            requireEnv('ODOO_API_KEY'),
            model,
            method,
            args,
            kwargs,
        ])
    } catch (e) {
        cachedUid = null
        throw e
    }
}
