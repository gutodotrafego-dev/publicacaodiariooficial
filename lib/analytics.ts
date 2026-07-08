declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
    gtag?: (...args: unknown[]) => void
  }
}

export type AnalyticsParams = {
  page_path?: string
  landing_page_type?: string
  publication_need?: string
  button_location?: string
  traffic_source?: string
  campaign?: string
  review_position?: number
}

/**
 * Envio centralizado de eventos para o Google Tag Manager (dataLayer).
 * Nunca envie dados pessoais (nome, telefone, e-mail, texto de avaliação etc.).
 */
export function trackEvent(eventName: string, params: AnalyticsParams = {}): void {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event: eventName, ...params })
}

const GOOGLE_ADS_EVENT_TIMEOUT_MS = 1500

function createOnceCallback(fn: () => void): () => void {
  let called = false
  return () => {
    if (called) return
    called = true
    fn()
  }
}

/**
 * Dispara a conversão do Google Ads (gtag.js) referente ao envio bem-sucedido
 * do formulário de orçamento e garante a execução de `onComplete` (o
 * redirecionamento ao WhatsApp) exatamente uma vez: via `event_callback` do
 * gtag assim que a conversão for registrada, ou via timeout de segurança
 * (mesmo prazo do `event_timeout`) caso o gtag.js esteja bloqueado (ex.:
 * bloqueadores de anúncio) ou a chamada não complete a tempo. Não envia
 * nome, telefone ou e-mail — apenas o evento de conversão.
 */
export function trackGoogleAdsConversion(onComplete: () => void): void {
  const redirectOnce = createOnceCallback(onComplete)

  if (typeof window === 'undefined') {
    redirectOnce()
    return
  }

  const conversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID
  const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL

  if (typeof window.gtag !== 'function' || !conversionId || !conversionLabel) {
    redirectOnce()
    return
  }

  window.gtag('event', 'conversion', {
    send_to: `${conversionId}/${conversionLabel}`,
    event_callback: redirectOnce,
    event_timeout: GOOGLE_ADS_EVENT_TIMEOUT_MS,
  })

  window.setTimeout(redirectOnce, GOOGLE_ADS_EVENT_TIMEOUT_MS)
}
