'use client'

import { Button } from '@/components/ui/button'
import { emitLeadFormPrefill } from '@/lib/form-bus'
import { trackEvent } from '@/lib/analytics'

export function UrgencySection() {
  function handleClick() {
    trackEvent('service_card_click', { button_location: 'urgency_section' })
    // Só pré-seleciona "preciso de orientação" se nada tiver sido escolhido ainda.
    emitLeadFormPrefill({ publicationNeed: 'preciso_orientacao', force: false })
  }

  return (
    <section className="relative overflow-hidden bg-brand-green-dark py-14 text-white sm:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #FFFFFF 0, #FFFFFF 1px, transparent 1px, transparent 12px)',
        }}
      />
      <div className="container-page relative text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Tem prazo para realizar sua publicação?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/80">
          Envie seus dados e continue pelo WhatsApp para informar a data necessária e encaminhar os
          documentos para análise.
        </p>
        <Button type="button" size="lg" className="mt-6" onClick={handleClick}>
          Solicitar análise da publicação
        </Button>
      </div>
    </section>
  )
}
