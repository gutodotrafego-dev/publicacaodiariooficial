export const siteConfig = {
  name: 'Central de Publicações',
  shortName: 'Central de Publicações',
  // [CONFIRMAR COM A EMPRESA] — descrição institucional oficial, se houver texto padrão preferido.
  description:
    'Publicação legal e oficial no Diário Oficial da União, Diários Oficiais dos Estados e jornais privados. Mais de 28 anos de experiência.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.centraldepublicacoes.com.br',
  logo: {
    src: '/logo-central.png',
    alt: 'Central de Publicações',
    width: 300,
    height: 200,
  },
  locale: 'pt_BR',
  trust: {
    yearsOfExperience: 28,
    editionsPublished: '12 mil',
    clientsServed: '9 mil',
  },
} as const
