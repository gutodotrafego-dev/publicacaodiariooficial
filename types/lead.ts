export type PublicationNeed =
  | 'dou'
  | 'diario_oficial_estado'
  | 'jornal_privado'
  | 'edital_licitacao'
  | 'balanco_ata_convocacao'
  | 'outra_publicacao'
  | 'preciso_orientacao'

export type LeadFormValues = {
  name: string
  phone: string
  email: string
  publicationNeed: string
  // Honeypot: deve permanecer vazio. Campo invisível para humanos, não acessível por teclado/leitor de tela.
  company: string
}

export type LeadPayload = {
  name: string
  phone: string
  email: string | null
  publicationNeed: PublicationNeed
  publicationNeedLabel: string
  landingPage: string
  pageTitle: string
  referrer: string | null
  entryUrl: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
  utmTerm: string | null
  gclid: string | null
  fbclid: string | null
  timestamp: string
  userAgent: string | null
  // Anti-spam
  company: string
  formStartedAt: number
}

export type LeadApiResponse =
  | { data: { received: true } }
  | { error: { code: string; message: string; details?: Record<string, string[]> } }
