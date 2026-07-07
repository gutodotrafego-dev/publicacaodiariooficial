'use client'

import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'
import { LeadForm } from './lead-form'
import type { LandingPageConfig } from '@/config/landing-pages'

function HighlightBlock({ color, children }: { color: 'red' | 'green'; children: string }) {
  return (
    <span
      className={
        color === 'red'
          ? 'inline-block whitespace-nowrap rounded-lg bg-brand-red px-2 py-0.5 text-white'
          : 'inline-block whitespace-nowrap rounded-lg bg-brand-green px-2 py-0.5 text-white'
      }
    >
      {children}
    </span>
  )
}

function Headline({
  headline,
  highlightRed,
  highlightGreen,
}: {
  headline: string
  highlightRed?: string
  highlightGreen?: string
}) {
  if (highlightRed && headline.includes(highlightRed)) {
    const [before, afterRed] = headline.split(highlightRed)

    if (highlightGreen && afterRed.includes(highlightGreen)) {
      const [middle, after] = afterRed.split(highlightGreen)
      return (
        <>
          {before}
          <HighlightBlock color="red">{highlightRed}</HighlightBlock>
          {middle}
          <HighlightBlock color="green">{highlightGreen}</HighlightBlock>
          {after}
        </>
      )
    }

    return (
      <>
        {before}
        <HighlightBlock color="red">{highlightRed}</HighlightBlock>
        {afterRed}
      </>
    )
  }

  return <>{headline}</>
}

// Composição decorativa (páginas de jornal sobrepostas, puramente CSS/JSX —
// sem imagens externas, sem brasões). Apenas ilustrativa, atrás do card do
// formulário, oculta em telas menores para não competir com o conteúdo.
function EditorialComposition() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute -inset-5 hidden lg:block">
      <div className="absolute inset-4 rotate-[7deg] rounded-2xl border border-surface-200 bg-white shadow-card" />
      <div className="absolute inset-4 -rotate-[5deg] rounded-2xl border border-surface-200 bg-white shadow-card-hover">
        <div className="flex h-full flex-col gap-2.5 p-6">
          <div className="h-2 w-1/3 rounded-full bg-brand-red" />
          <div className="h-1.5 w-full rounded-full bg-surface-200" />
          <div className="h-1.5 w-5/6 rounded-full bg-surface-200" />
          <div className="h-1.5 w-full rounded-full bg-surface-200" />
          <div className="mt-2 h-2 w-1/4 rounded-full bg-brand-green" />
          <div className="h-1.5 w-4/6 rounded-full bg-surface-200" />
          <div className="h-1.5 w-full rounded-full bg-surface-200" />
        </div>
      </div>
    </div>
  )
}

export function Hero({ config }: { config: LandingPageConfig }) {
  return (
    <section className="relative overflow-hidden bg-surface-50 pb-12 pt-10 sm:pb-16 sm:pt-14">
      <Image
        src="/hero-bg.png"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center lg:hidden"
      />
      <Image
        src="/hero-bg-desktop.png"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="hidden object-cover object-center lg:block"
      />
      {/* Detalhes editoriais discretos: linhas verticais lembrando colunas de jornal */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden opacity-[0.05] lg:block"
        style={{
          backgroundImage: 'repeating-linear-gradient(to right, #18181B 0, #18181B 1px, transparent 1px, transparent 33.33%)',
        }}
      />

      <div className="container-page relative grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
        <div className="flex flex-col gap-5 lg:pt-6">
          <span className="w-fit rounded-full bg-brand-green-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-green">
            {config.eyebrow}
          </span>
          <h1 className="text-3xl font-bold leading-tight text-ink-900 sm:text-4xl lg:text-5xl">
            <Headline
              headline={config.headline}
              highlightRed={config.headlineHighlight}
              highlightGreen={config.headlineHighlightGreen}
            />
          </h1>
          <p className="text-base leading-relaxed text-ink-700 sm:text-lg">{config.subheadline}</p>

          <ul className="flex flex-col gap-2.5">
            {config.benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5 text-sm text-ink-700 sm:text-base">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-green" aria-hidden="true" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <EditorialComposition />
          <LeadForm
            defaultPublicationNeed={config.defaultPublicationNeed}
            landingPageType={config.analyticsLandingPageType}
            ctaLabel={config.ctaLabel}
          />
          <p className="mt-3 text-center text-xs text-ink-500">Solicitação sem compromisso.</p>
        </div>
      </div>
    </section>
  )
}
