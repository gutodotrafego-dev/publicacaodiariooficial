import { siteConfig } from '@/config/site'

export function TrustBar() {
  const { trust } = siteConfig
  const items = [
    { value: `+${trust.yearsOfExperience} anos`, label: 'de experiência no mercado' },
    { value: `+${trust.editionsPublished}`, label: 'edições publicadas' },
    { value: `+${trust.clientsServed}`, label: 'clientes atendidos' },
  ]

  return (
    <section aria-label="Números da Central de Publicações" className="bg-brand-red py-7 sm:py-8">
      <div className="container-page grid grid-cols-1 divide-y divide-white/20 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-1 px-2 py-3 text-center sm:py-0">
            <p className="font-mono text-2xl font-bold text-white sm:text-3xl">{item.value}</p>
            <p className="text-sm text-white/90">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
