// Rate limiting simples em memória. Suficiente para uma primeira versão sem
// CAPTCHA. Caso o tráfego cresça ou surja spam real, considerar um store
// compartilhado (ex.: Redis/Upstash) — o processo Node pode ter memória
// isolada por instância em ambientes serverless.

const WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 5

const hits = new Map<string, number[]>()

export function isRateLimited(key: string): boolean {
  const now = Date.now()
  const previous = hits.get(key) ?? []
  const withinWindow = previous.filter((timestamp) => now - timestamp < WINDOW_MS)
  withinWindow.push(now)
  hits.set(key, withinWindow)
  return withinWindow.length > MAX_REQUESTS_PER_WINDOW
}
