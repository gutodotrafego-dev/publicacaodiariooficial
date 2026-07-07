'use client'

import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { emitLeadFormPrefill } from '@/lib/form-bus'
import { trackEvent } from '@/lib/analytics'

const categories = [
  {
    title: 'Editais e processos públicos',
    items: ['Editais', 'Licitações', 'Dispensas de licitação', 'Homologações', 'Extratos de contratos'],
    accent: 'border-t-brand-red',
  },
  {
    title: 'Atos empresariais',
    items: ['Balanços patrimoniais', 'Assembleias', 'Convocações', 'Atas', 'Comunicados societários'],
    accent: 'border-t-brand-green',
  },
  {
    title: 'Licenças e comunicados',
    items: ['Licenças ambientais', 'Perda de documentos', 'Comunicados oficiais', 'Termos', 'Resoluções'],
    accent: 'border-t-brand-red',
  },
]

export function PublicationTypes() {
  function handleCta() {
    trackEvent('service_card_click', { button_location: 'publication_types_cta' })
    emitLeadFormPrefill({ publicationNeed: 'preciso_orientacao', force: true })
  }

  return (
    <section className="py-14 sm:py-20">
      <div className="container-page">
        <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">
          Conte com orientação para diferentes tipos de publicação
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.title}
              className={`rounded-xl border border-t-4 border-surface-200 bg-white p-6 ${category.accent}`}
            >
              <h3 className="text-lg font-semibold text-ink-900">{category.title}</h3>
              <ul className="mt-4 flex flex-col divide-y divide-surface-100">
                {category.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 py-2 text-sm text-ink-700 first:pt-0 last:pb-0">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-green" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-dashed border-surface-200 bg-surface-50 p-6 text-center">
          <h3 className="text-lg font-semibold text-ink-900">
            Não encontrou o tipo de publicação que precisa?
          </h3>
          <p className="mt-2 text-sm text-ink-700">
            Selecione &quot;Outra publicação&quot; ou &quot;Preciso de orientação&quot; no formulário
            para conversar com nossa equipe.
          </p>
          <Button type="button" size="md" className="mt-4" onClick={handleCta}>
            Solicitar orientação
          </Button>
        </div>
      </div>
    </section>
  )
}
