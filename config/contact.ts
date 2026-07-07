// Centraliza todos os dados de contato. Nenhum componente deve hardcodar
// número de WhatsApp, telefone ou e-mail — sempre importar deste arquivo.

const PENDING_MARKER = '[CONFIRMAR COM A EMPRESA]'

// Usado para evitar renderizar dados institucionais ainda não confirmados
// (ex.: um <a href="tel:[CONFIRMAR COM A EMPRESA]"> quebrado em produção).
export function isPendingConfirmation(value: string): boolean {
  return value === PENDING_MARKER
}

export const contactConfig = {
  // Normalizado apenas com dígitos, com código do país (ex.: 5548999999999).
  // Configurado em NEXT_PUBLIC_WHATSAPP_NUMBER.
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',

  // [CONFIRMAR COM A EMPRESA] — dados institucionais para o rodapé.
  legalName: '[CONFIRMAR COM A EMPRESA]',
  cnpj: '[CONFIRMAR COM A EMPRESA]',

  // Linhas do endereço, na ordem de exibição (uma por linha, para leitura
  // confortável em desktop e mobile).
  address: [
    'Rua Vereador Arthur Manoel Mariano, nº 362',
    'Comercial Vitória Center, Sala 312',
    'Forquilhinhas — São José/SC',
    'CEP: 88106-500',
  ],

  // O primeiro telefone é usado como contato principal (ex.: topbar do header).
  phones: [
    { display: '(48) 3257-3200', href: 'tel:+554832573200' },
    { display: '(48) 3257-3500', href: 'tel:+554832573500' },
    { display: '(48) 3257-0020', href: 'tel:+554832570020' },
  ],

  emails: [
    { label: 'Comercial', address: 'comercial@centraldiariooficial.com.br' },
    { label: 'Prefeituras', address: 'prefeitura@centraldiariooficial.com.br' },
    { label: 'Financeiro', address: 'financeiro@centraldiariooficial.com.br' },
  ],

  // [CONFIRMAR COM A EMPRESA] — horário de atendimento (ex.: "Seg a sex, 8h às 18h").
  businessHours: '[CONFIRMAR COM A EMPRESA]',

  socialLinks: {
    // [CONFIRMAR COM A EMPRESA]
    instagram: '',
    facebook: '',
    linkedin: '',
  },

  // Link fixo fornecido para deixar avaliação — usar apenas no CTA "Deixar uma avaliação no Google".
  googleReviewUrl:
    process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || 'https://g.page/r/Ce8evMwiD456EBM/review',

  // URL pública do perfil no Google Maps — usar no CTA "Ver todas as avaliações no Google".
  // Se vazio, o CTA correspondente deve ficar oculto.
  googleMapsProfileUrl:
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_PROFILE_URL || 'https://maps.app.goo.gl/dWEhvonwia8HTWV86',

  privacyPolicyUrl: '/politica-de-privacidade',
  termsOfUseUrl: '/termos-de-uso',
} as const
