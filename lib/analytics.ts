declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
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
