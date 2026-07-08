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
const GOOGLE_ADS_GTAG_WAIT_MS = 1500
const GOOGLE_ADS_GTAG_POLL_INTERVAL_MS = 50

/**
 * Dispara manualmente a conversão do Google Ads referente ao envio
 * bem-sucedido do formulário de orçamento. A Google Tag (gtag.js) é
 * instalada uma única vez, globalmente, pelo `app/layout.tsx` — esta função
 * nunca carrega uma segunda cópia do script, apenas usa o `window.gtag` já
 * inicializado lá. Chama `onComplete` (o redirecionamento ao WhatsApp) via
 * `event_callback` do gtag assim que a conversão for registrada, ou via
 * timeout de segurança (mesmo prazo do `event_timeout`) caso a chamada não
 * complete a tempo. Se `window.gtag` ainda não estiver disponível (script
 * ainda carregando), aguarda brevemente antes de desistir e redirecionar
 * mesmo assim (ex.: bloqueadores de anúncio impedindo o gtag.js de
 * carregar) — nunca bloqueia o atendimento. `onComplete` deve ser
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

  const sendTo = `${conversionId}/${conversionLabel}`
  const waitDeadline = Date.now() + GOOGLE_ADS_GTAG_WAIT_MS

  function attempt(): void {
    if (typeof window.gtag === 'function') {
      window.gtag!('event', 'conversion', {
        send_to: sendTo,
        event_callback: onComplete,
        event_timeout: GOOGLE_ADS_EVENT_TIMEOUT_MS,
      })
      window.setTimeout(onComplete, GOOGLE_ADS_EVENT_TIMEOUT_MS)
      return
    }

    if (Date.now() >= waitDeadline) {
      onComplete()
      return
    }

    window.setTimeout(attempt, GOOGLE_ADS_GTAG_POLL_INTERVAL_MS)
  }

  attempt()
}
