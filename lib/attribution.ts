const STORAGE_KEY = 'cdp_attribution_v1'

export type AttributionData = {
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
  utmTerm: string | null
  gclid: string | null
  fbclid: string | null
  referrer: string | null
  entryUrl: string | null
  firstVisitAt: string
}

/**
 * Captura os parâmetros de campanha na primeira entrada do visitante na sessão
 * e preserva em sessionStorage. Não sobrescreve uma atribuição já existente.
 */
export function captureAttribution(): void {
  if (typeof window === 'undefined') return
  try {
    if (window.sessionStorage.getItem(STORAGE_KEY)) return

    const params = new URLSearchParams(window.location.search)
    const data: AttributionData = {
      utmSource: params.get('utm_source'),
      utmMedium: params.get('utm_medium'),
      utmCampaign: params.get('utm_campaign'),
      utmContent: params.get('utm_content'),
      utmTerm: params.get('utm_term'),
      gclid: params.get('gclid'),
      fbclid: params.get('fbclid'),
      referrer: document.referrer || null,
      entryUrl: window.location.href,
      firstVisitAt: new Date().toISOString(),
    }
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // sessionStorage indisponível (ex.: navegação privada) — segue sem atribuição.
  }
}

export function getAttribution(): AttributionData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AttributionData) : null
  } catch {
    return null
  }
}
