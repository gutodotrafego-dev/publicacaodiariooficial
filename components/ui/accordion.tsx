'use client'

import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

export type AccordionItemData = {
  question: string
  answer: string
}

export function Accordion({
  items,
  onItemOpen,
}: {
  items: AccordionItemData[]
  onItemOpen?: (index: number, item: AccordionItemData) => void
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const baseId = useId()

  return (
    <div className="divide-y divide-surface-200 rounded-xl border border-surface-200 bg-white">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        const buttonId = `${baseId}-button-${index}`
        const panelId = `${baseId}-panel-${index}`

        return (
          <div key={item.question} className={cn(isOpen && 'bg-surface-50')}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => {
                  const nextIndex = isOpen ? null : index
                  setOpenIndex(nextIndex)
                  if (nextIndex !== null) onItemOpen?.(index, item)
                }}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-green"
              >
                <span className={cn('font-medium', isOpen ? 'text-brand-red' : 'text-ink-900')}>
                  {item.question}
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-transform',
                    isOpen ? 'rotate-180 text-brand-red' : 'text-ink-500'
                  )}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="px-5 pb-5 text-sm leading-relaxed text-ink-700"
            >
              {item.answer}
            </div>
          </div>
        )
      })}
    </div>
  )
}
