import type { GoogleReview } from '@/types/google-review'

// Cadastre aqui SOMENTE avaliações reais e verificadas, copiadas literalmente
// do perfil do Google da Central de Publicações (sem reescrever o texto).
// Enquanto este array estiver vazio, a seção de avaliações fica automaticamente oculta.
export const googleReviews: GoogleReview[] = [
  // {
  //   id: 'review-1',
  //   authorName: 'Nome público do autor',
  //   rating: 5,
  //   text: 'Texto real da avaliação, sem alterações.',
  //   dateLabel: 'há 2 meses',
  //   sourceUrl: undefined,
  // },
]

// Controle manual adicional: mesmo com avaliações cadastradas, permite
// desligar a seção rapidamente sem apagar os dados.
export const showGoogleReviews = true
