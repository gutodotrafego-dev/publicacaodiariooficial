'use client'

import { Landmark, Building2, Newspaper } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { emitLeadFormPrefill } from '@/lib/form-bus'
import { trackEvent } from '@/lib/analytics'
import type { PublicationNeed } from '@/types/lead'

const channels: Array<{
  icon: LucideIcon
  title: string
  description: string
  cta: string
  need: PublicationNeed
  accent: 'red' | 'green'
}> = [
  {
    icon: Landmark,
    title: 'Diário Oficial da União',
    description:
      'Solicite orientação e orçamento para publicações destinadas ao Diário Oficial da União.',
    cta: 'Orçar publicação no DOU',
    need: 'dou',
    accent: 'red',
  },
  {
    icon: Building2,
    title: 'Diários Oficiais dos Estados',
    description:
      'Publicações nos Diários Oficiais Estaduais, conforme a necessidade da empresa, instituição ou órgão.',
    cta: 'Orçar publicação estadual',
    need: 'diario_oficial_estado',
    accent: 'green',
  },
  {
    icon: Newspaper,
    title: 'Jornais privados',
    description: 'Publicações em jornais regionais, estaduais e nacionais.',
    cta: 'Orçar publicação em jornal',
    need: 'jornal_privado',
    accent: 'red',
  },
]

const accentClasses = {
  red: { icon: 'bg-brand-red-light text-brand-red', hover: 'hover:border-brand-red/40' },
  green: { icon: 'bg-brand-green-light text-brand-green', hover: 'hover:border-brand-green/40' },
}

export function PublicationChannels() {
  function handleClick(need: PublicationNeed) {
    trackEvent('service_card_click', { publication_need: need })
    emitLeadFormPrefill({ publicationNeed: need, force: true })
  }

  return (
    <section className="bg-surface-50 py-14 sm:py-20">
      <div className="container-page">
        <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">
          Publicações nos principais veículos
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {channels.map((channel) => (
            <div
              key={channel.title}
              className={`flex flex-col rounded-xl border border-surface-200 bg-white p-6 shadow-card transition-colors hover:shadow-card-hover ${accentClasses[channel.accent].hover}`}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentClasses[channel.accent].icon}`}>
                <channel.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink-900">{channel.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-700">{channel.description}</p>
              <Button
                type="button"
                variant="outline"
                size="md"
                className="mt-4"
                onClick={() => handleClick(channel.need)}
              >
                {channel.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
