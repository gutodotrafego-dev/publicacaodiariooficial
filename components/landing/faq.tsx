'use client'

import { Accordion } from '@/components/ui/accordion'
import { trackEvent } from '@/lib/analytics'
import type { FaqItem } from '@/config/landing-pages'

export function Faq({ items, landingPageType }: { items: FaqItem[]; landingPageType: string }) {
  return (
    <section className="py-14 sm:py-20">
      <div className="container-page mx-auto max-w-[880px]">
        <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">Perguntas frequentes</h2>
        <div className="mt-8">
          <Accordion
            items={items}
            onItemOpen={(index) =>
              trackEvent('faq_open', {
                landing_page_type: landingPageType,
                button_location: `faq_${index}`,
              })
            }
          />
        </div>
      </div>
    </section>
  )
}
