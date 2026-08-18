import { authFetch } from './auth'
import { fetchWithTimeout } from './fetchWithTimeout'
import { parseError } from './apiError'

export class HttpError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

export interface HttpOptions extends Omit<RequestInit, 'body'> {
  auth?: boolean
  timeout?: number
  query?: Record<string, string | number | undefined>
  body?: unknown
}

function toUrl(url: string, query?: HttpOptions['query']): string {
  if (!query) return url
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `${url}${url.includes('?') ? '&' : '?'}${qs}` : url
}

function toBody(body: unknown, headers: HeadersInit = {}): { body: BodyInit | undefined; headers: HeadersInit } {
  if (body === undefined || body === null) return { body: undefined, headers }
  if (
    typeof body === 'string' ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof ArrayBuffer
  ) {
    return { body: body as BodyInit, headers }
  }
  return {
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', ...headers },
  }
}

export async function request<T = void>(
  url: string,
  options: HttpOptions = {},
): Promise<T> {
  const { auth = true, timeout, query, headers, body, ...rest } = options
  const { body: resolvedBody, headers: resolvedHeaders } = toBody(body, headers)
  const fetcher = auth ? authFetch : fetchWithTimeout
  const res = await fetcher(toUrl(url, query), { ...rest, headers: resolvedHeaders, body: resolvedBody, timeout })

  if (!res.ok) {
    const err = await parseError(res)
    throw new HttpError(err.message, err.status)
  }

  try {
    if ((res.headers.get('content-type') ?? '').includes('application/json')) {
      return (await res.json()) as T
    }
  } catch {
    /* ignore empty/invalid bodies */
  }
  return undefined as T
}
