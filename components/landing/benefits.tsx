import Image from 'next/image'
import { ShieldCheck } from 'lucide-react'
import { siteConfig } from '@/config/site'

const items: Array<{ text: string; highlight?: string }> = [
  { text: 'Mais de 28 anos de atuação.', highlight: '28 anos' },
  { text: 'Experiência em publicidade legal.' },
  { text: 'Atendimento para diferentes tipos de publicação.' },
  { text: 'Publicações em diferentes veículos.' },
  { text: 'Atendimento humano.' },
  { text: 'Orientação durante o processo.' },
  { text: 'Atendimento a empresas, instituições e órgãos.' },
]

function Item({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight || !text.includes(highlight)) return <>{text}</>
  const [before, after] = text.split(highlight)
  return (
    <>
      {before}
      <strong className="font-semibold text-brand-red">{highlight}</strong>
      {after}
    </>
  )
}

export function Benefits() {
  const { trust } = siteConfig

  return (
    <section className="bg-brand-green-light py-14 sm:py-20">
      <div className="container-page grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">
            Experiência que sustenta cada publicação
          </h2>
          <p className="text-sm leading-relaxed text-ink-700 sm:text-base">
            Com mais de {trust.yearsOfExperience} anos de atuação, a Central de Publicações já apoiou mais
            de {trust.clientsServed} clientes na publicação de {trust.editionsPublished} edições em diários
            oficiais e jornais privados, sempre com orientação humana em cada etapa do processo.
          </p>
          <div className="relative mt-2 aspect-square w-full max-w-md overflow-hidden rounded-2xl shadow-card-hover lg:aspect-video">
            <Image
              src="/equipe.png"
              alt="Equipe da Central de Publicações"
              fill
              sizes="(min-width: 1024px) 448px, 100vw"
              className="object-cover object-[center_30%]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={item.text}
              className="flex items-start gap-3 rounded-xl border border-surface-200 bg-white p-4 shadow-card"
            >
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-green" aria-hidden="true" />
              <span className="text-sm text-ink-700">
                <Item text={item.text} highlight={item.highlight} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
