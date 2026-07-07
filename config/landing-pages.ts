import type { Metadata } from 'next'
import type { PublicationNeed } from '@/types/lead'
import { siteConfig } from '@/config/site'

export type PublicationNeedOption = {
  value: PublicationNeed
  label: string
}

export const PUBLICATION_NEED_OPTIONS: PublicationNeedOption[] = [
  { value: 'dou', label: 'Publicação no Diário Oficial da União' },
  { value: 'diario_oficial_estado', label: 'Publicação no Diário Oficial do Estado' },
  { value: 'jornal_privado', label: 'Publicação em jornal privado' },
  { value: 'edital_licitacao', label: 'Edital ou licitação' },
  { value: 'balanco_ata_convocacao', label: 'Balanço, ata ou convocação' },
  { value: 'outra_publicacao', label: 'Outra publicação' },
  { value: 'preciso_orientacao', label: 'Ainda não sei, preciso de orientação' },
]

export function getPublicationNeedLabel(value: PublicationNeed): string {
  return PUBLICATION_NEED_OPTIONS.find((o) => o.value === value)?.label ?? value
}

export type FaqItem = {
  question: string
  answer: string
}

// FAQ padrão (seção 21). Respostas ainda pendentes de confirmação usam placeholder explícito.
export const defaultFaqs: FaqItem[] = [
  {
    question: 'Como é calculado o valor da publicação?',
    answer:
      'O orçamento pode variar conforme o veículo, o tipo de publicação, o tamanho do conteúdo, o formato e a data necessária. Nossa equipe solicitará as informações necessárias durante o atendimento.',
  },
  {
    question: 'Preciso saber onde a publicação deve ser feita?',
    answer:
      'Não. Se você ainda não sabe qual veículo utilizar, selecione a opção "Ainda não sei, preciso de orientação".',
  },
  {
    question: 'Posso solicitar apenas um orçamento?',
    answer:
      'Sim. O preenchimento do formulário representa uma solicitação de contato e orçamento, sem obrigatoriedade de contratação.',
  },
  {
    question: 'Como envio o documento da publicação?',
    answer:
      'Após preencher o formulário, você será direcionado para o WhatsApp e poderá enviar o documento diretamente para a equipe.',
  },
  {
    question: 'Quanto tempo leva para publicar?',
    answer:
      'O prazo pode variar conforme o veículo, a data de fechamento e o tipo de publicação. A equipe confirmará as possibilidades após analisar sua solicitação.',
  },
]

export type LandingPageConfig = {
  slug: string
  metadata: {
    title: string
    description: string
  }
  eyebrow: string
  headline: string
  // Trecho exato do headline a destacar em vermelho (opcional). Deve ser um
  // substring literal de `headline`.
  headlineHighlight?: string
  // Segundo trecho do headline, destacado em verde (opcional). Deve ser um
  // substring literal de `headline`, distinto de `headlineHighlight`.
  headlineHighlightGreen?: string
  subheadline: string
  benefits: string[]
  ctaLabel: string
  defaultPublicationNeed?: PublicationNeed
  whatsappContext: string
  faqs: FaqItem[]
  // Identificador usado apenas em analytics (nunca dados pessoais).
  analyticsLandingPageType: string
}

const baseBenefits = [
  'Diário Oficial da União e Diários Estaduais.',
  'Jornais regionais, estaduais e nacionais.',
  'Atendimento humano durante o processo.',
  'Mais de 28 anos de experiência.',
]

export const landingPages: Record<string, LandingPageConfig> = {
  home: {
    slug: '/',
    metadata: {
      title: 'Central de Publicações — Publicação Legal e Oficial',
      description:
        'Publique seu edital, ata ou comunicado oficial com orientação especializada. Diário Oficial da União, Diários Oficiais dos Estados e jornais privados.',
    },
    eyebrow: 'PUBLICAÇÃO LEGAL COM ATENDIMENTO ESPECIALIZADO',
    headline: 'Publique no Diário Oficial e em jornais sem complicação',
    headlineHighlight: 'Diário Oficial',
    headlineHighlightGreen: 'sem complicação',
    subheadline:
      'Informe o que precisa publicar e receba orientação e orçamento para realizar sua publicação.',
    benefits: baseBenefits,
    ctaLabel: 'Receber orçamento no WhatsApp',
    whatsappContext: 'uma publicação',
    faqs: defaultFaqs,
    analyticsLandingPageType: 'home',
  },
  'diario-oficial-uniao': {
    slug: '/diario-oficial-uniao',
    metadata: {
      title: 'Publicação no Diário Oficial da União (DOU) — Central de Publicações',
      description:
        'Solicite orientação e orçamento para publicar no Diário Oficial da União com a Central de Publicações.',
    },
    eyebrow: 'PUBLICAÇÃO NO DOU',
    headline: 'Publique no Diário Oficial da União sem complicação',
    subheadline:
      'Preencha seus dados e receba orientação para solicitar sua publicação no Diário Oficial da União.',
    benefits: baseBenefits,
    ctaLabel: 'Receber orçamento no WhatsApp',
    defaultPublicationNeed: 'dou',
    whatsappContext: 'uma publicação no Diário Oficial da União',
    faqs: defaultFaqs,
    analyticsLandingPageType: 'dou',
  },
  'diario-oficial-estado': {
    slug: '/diario-oficial-estado',
    metadata: {
      title: 'Publicação no Diário Oficial do Estado — Central de Publicações',
      description:
        'Solicite orientação e orçamento para publicar no Diário Oficial do seu Estado com a Central de Publicações.',
    },
    eyebrow: 'PUBLICAÇÃO ESTADUAL',
    headline: 'Faça sua publicação no Diário Oficial do Estado',
    subheadline:
      'Informe seus dados e continue pelo WhatsApp para receber orientação sobre sua publicação estadual.',
    benefits: baseBenefits,
    ctaLabel: 'Receber orçamento no WhatsApp',
    defaultPublicationNeed: 'diario_oficial_estado',
    whatsappContext: 'uma publicação no Diário Oficial do Estado',
    faqs: defaultFaqs,
    analyticsLandingPageType: 'diario_oficial_estado',
  },
  'publicar-edital': {
    slug: '/publicar-edital',
    metadata: {
      title: 'Publicação de Edital e Licitação — Central de Publicações',
      description:
        'Solicite a publicação do seu edital ou licitação com orientação especializada da Central de Publicações.',
    },
    eyebrow: 'EDITAIS E LICITAÇÕES',
    headline: 'Solicite a publicação do seu edital ou licitação',
    subheadline:
      'Preencha seus dados e converse com a equipe para informar o documento, o veículo e a data necessária.',
    benefits: baseBenefits,
    ctaLabel: 'Receber orçamento no WhatsApp',
    defaultPublicationNeed: 'edital_licitacao',
    whatsappContext: 'a publicação de um edital ou licitação',
    faqs: defaultFaqs,
    analyticsLandingPageType: 'edital_licitacao',
  },
  'publicacao-legal': {
    slug: '/publicacao-legal',
    metadata: {
      title: 'Publicação Legal e Oficial — Central de Publicações',
      description:
        'Orientação especializada para publicações legais e oficiais em diários oficiais e jornais privados.',
    },
    eyebrow: 'PUBLICAÇÃO LEGAL',
    headline: 'Orientação especializada para sua publicação legal',
    subheadline:
      'Informe o que você precisa publicar e receba orientação da nossa equipe para realizar sua publicação.',
    benefits: baseBenefits,
    ctaLabel: 'Receber orçamento no WhatsApp',
    whatsappContext: 'uma publicação legal',
    faqs: defaultFaqs,
    analyticsLandingPageType: 'publicacao_legal',
  },
  'orcamento-publicacao': {
    slug: '/orcamento-publicacao',
    metadata: {
      title: 'Orçamento de Publicação — Central de Publicações',
      description:
        'Solicite seu orçamento de publicação legal e continue o atendimento diretamente pelo WhatsApp.',
    },
    eyebrow: 'SOLICITAR ORÇAMENTO',
    headline: 'Solicite seu orçamento de publicação',
    subheadline:
      'Preencha os dados abaixo e continue o atendimento diretamente pelo WhatsApp para receber seu orçamento.',
    benefits: baseBenefits,
    ctaLabel: 'Receber orçamento no WhatsApp',
    whatsappContext: 'um orçamento de publicação',
    faqs: defaultFaqs,
    analyticsLandingPageType: 'orcamento',
  },
}

export function getLandingPageConfig(slug: keyof typeof landingPages): LandingPageConfig {
  return landingPages[slug]
}

// Metadata compartilhada (canonical + Open Graph específico da rota) para
// evitar que todas as landing pages exibam o mesmo preview social genérico.
export function buildPageMetadata(config: LandingPageConfig): Metadata {
  const canonicalUrl = `${siteConfig.url}${config.slug === '/' ? '' : config.slug}`

  return {
    title: config.metadata.title,
    description: config.metadata.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: config.metadata.title,
      description: config.metadata.description,
      url: canonicalUrl,
    },
  }
}
