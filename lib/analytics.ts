declare global {
  interface Window {
    dataLayer?: unknown[]
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
const GOOGLE_ADS_SCRIPT_ID = 'google-ads-gtag-lazy'

let googleAdsScriptRequested = false

/**
 * Carrega o gtag.js do Google Ads sob demanda — nunca no layout/head da
 * página. Só é chamado no momento em que uma conversão real precisa ser
 * enviada (envio bem-sucedido do formulário), nunca no carregamento da
 * página. Não chama `gtag('config', ...)` propositalmente: isso evita
 * inicializar a detecção automática de formulário/engajamento da tag do
 * Google Ads (recurso da conta, não do nosso código) — enviamos apenas o
 * evento de conversão manual, com destino explícito via `send_to`.
 */
function ensureGoogleAdsGtagLoaded(conversionId: string): void {
  window.dataLayer = window.dataLayer || []

  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args)
    }
  }

  if (googleAdsScriptRequested || document.getElementById(GOOGLE_ADS_SCRIPT_ID)) return
  googleAdsScriptRequested = true

  const script = document.createElement('script')
  script.id = GOOGLE_ADS_SCRIPT_ID
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${conversionId}`
  document.head.appendChild(script)

  window.gtag('js', new Date())
}

/**
 * Dispara manualmente a conversão do Google Ads referente ao envio
 * bem-sucedido do formulário de orçamento. Chama `onComplete` (o
 * redirecionamento ao WhatsApp) via `event_callback` do gtag assim que a
 * conversão for registrada, ou via timeout de segurança (mesmo prazo do
 * `event_timeout`) caso o gtag.js esteja bloqueado (ex.: bloqueadores de
 * anúncio) ou a chamada não complete a tempo. `onComplete` deve ser
 * idempotente (protegido contra dupla execução pelo chamador, ex.: via
 * `useRef`) pois pode ser invocado tanto pelo callback quanto pelo timeout.
 * Não envia nome, telefone, e-mail ou qualquer outro dado pessoal.
 */
export function trackGoogleAdsConversion(onComplete: () => void): void {
  if (typeof window === 'undefined') {
    onComplete()
    return
  }

  const conversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID
  const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL

  if (!conversionId || !conversionLabel) {
    onComplete()
    return
  }

  ensureGoogleAdsGtagLoaded(conversionId)

  window.gtag!('event', 'conversion', {
    send_to: `${conversionId}/${conversionLabel}`,
    event_callback: onComplete,
    event_timeout: GOOGLE_ADS_EVENT_TIMEOUT_MS,
  })

  window.setTimeout(onComplete, GOOGLE_ADS_EVENT_TIMEOUT_MS)
}
