'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { trackEvent, trackGoogleAdsConversion } from '@/lib/analytics'

type ViewState = 'invalid' | 'valid'

const REDIRECT_DELAY_MS = 3000
const LEAD_SUBMITTED_KEY = 'central_lead_submitted'
const WHATSAPP_URL_KEY = 'central_whatsapp_url'

export function ThankYouConversion() {
  const [view, setView] = useState<ViewState | null>(null)
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null)
  const hasRedirectedRef = useRef(false)

  useEffect(() => {
    const submitted = sessionStorage.getItem(LEAD_SUBMITTED_KEY)
    const storedUrl = sessionStorage.getItem(WHATSAPP_URL_KEY)

    if (submitted !== 'true' || !storedUrl) {
      setView('invalid')
      return
    }

    const url: string = storedUrl

    setWhatsappUrl(url)
    setView('valid')

    // Consome a flag imediatamente — antes de disparar a conversão — para
    // que um reload de /obrigado durante a espera de ~3s não dispare uma
    // nova conversão (a flag só existe uma vez por lead enviado).
    sessionStorage.removeItem(LEAD_SUBMITTED_KEY)

    function redirectOnce() {
      if (hasRedirectedRef.current) return
      hasRedirectedRef.current = true
      trackEvent('whatsapp_redirect', { landing_page_type: 'obrigado' })
      sessionStorage.removeItem(WHATSAPP_URL_KEY)
      window.location.assign(url)
    }

    // Dispara a conversão do Google Ads uma única vez. `trackGoogleAdsConversion`
    // já lida com `window.gtag` ainda não disponível (aguarda brevemente e
    // segue em frente) e chama `redirectOnce` via `event_callback` ou timeout
    // de segurança interno — nunca bloqueia o redirecionamento.
    trackGoogleAdsConversion(redirectOnce)

    // Timeout de segurança adicional, conforme especificado: garante o
    // redirecionamento em até 3s mesmo se algo inesperado impedir o callback.
    const timeoutId = window.setTimeout(redirectOnce, REDIRECT_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [])

  function handleManualRedirect() {
    if (!whatsappUrl) return
    if (hasRedirectedRef.current) return
    hasRedirectedRef.current = true
    trackEvent('whatsapp_redirect', { landing_page_type: 'obrigado' })
    sessionStorage.removeItem(WHATSAPP_URL_KEY)
    window.location.assign(whatsappUrl)
  }

  if (view === null) return null

  if (view === 'invalid') {
    return (
      <div className="text-center">
        <p className="text-sm leading-relaxed text-ink-700">
          Para solicitar um orçamento, preencha o formulário na página inicial.
        </p>
        <Button href="/" variant="green" size="lg" className="mt-6">
          Voltar para o início
        </Button>
      </div>
    )
  }

  return (
    <div className="text-center">
      <h1 className="text-xl font-bold text-ink-900">Solicitação recebida com sucesso!</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-700">
        Estamos te encaminhando para o WhatsApp.
      </p>
      <p className="mt-1 text-xs text-ink-500">
        Se não abrir automaticamente, clique no botão abaixo.
      </p>
      <Button
        type="button"
        variant="whatsapp"
        size="lg"
        className="mt-6"
        onClick={handleManualRedirect}
      >
        Abrir WhatsApp
      </Button>
    </div>
  )
}
