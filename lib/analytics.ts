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

/**
 * Dispara a conversão do Google Ads (gtag.js) referente ao envio bem-sucedido
 * do formulário de orçamento. Não envia dados pessoais — apenas o evento de
 * conversão configurado na conta do Google Ads.
 */
export function trackGoogleAdsConversion(): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return

  const conversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID
  const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL
  if (!conversionId || !conversionLabel) return

  window.gtag('event', 'conversion', { send_to: `${conversionId}/${conversionLabel}` })
}
