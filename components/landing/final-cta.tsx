'use client'

import { Button } from '@/components/ui/button'
import { emitLeadFormPrefill } from '@/lib/form-bus'
import { trackEvent } from '@/lib/analytics'
import { siteConfig } from '@/config/site'

export function FinalCta({
  ctaLabel,
  landingPageType,
}: {
  ctaLabel: string
  landingPageType: string
}) {
  function handleClick() {
    trackEvent('service_card_click', { landing_page_type: landingPageType, button_location: 'final_cta' })
    emitLeadFormPrefill()
  }

  const { trust } = siteConfig

  return (
    <section className="py-14 text-white sm:py-20" style={{ backgroundColor: '#045615' }}>
      <div className="container-page text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Precisa realizar uma publicação?</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/80">
          Envie seus dados e continue o atendimento diretamente pelo WhatsApp.
        </p>
        <Button size="lg" className="mt-6" onClick={handleClick}>
          {ctaLabel}
        </Button>

        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-6 border-t border-white/10 pt-8 sm:grid-cols-3">
          <div>
            <p className="flex items-center justify-center gap-2 font-mono text-xl font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-red" aria-hidden="true" />
              +{trust.yearsOfExperience} anos
            </p>
            <p className="mt-1 text-sm text-white/70">de experiência</p>
          </div>
          <div>
            <p className="flex items-center justify-center gap-2 font-mono text-xl font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-green" aria-hidden="true" />
              +{trust.editionsPublished}
            </p>
            <p className="mt-1 text-sm text-white/70">edições publicadas</p>
          </div>
          <div>
            <p className="flex items-center justify-center gap-2 font-mono text-xl font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-red" aria-hidden="true" />
              +{trust.clientsServed}
            </p>
            <p className="mt-1 text-sm text-white/70">clientes atendidos</p>
          </div>
        </div>
      </div>
    </section>
  )
}
