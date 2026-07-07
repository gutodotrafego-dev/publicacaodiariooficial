export type GoogleReview = {
  id: string
  authorName: string
  authorPhotoUrl?: string
  rating: number
  text: string
  dateLabel?: string
  sourceUrl?: string
}

// Resumo real de avaliações: nota média e quantidade total, sempre calculados
// a partir de dados reais (API oficial do Google ou avaliações estáticas
// cadastradas) — nunca valores inventados.
export type GoogleReviewsSummary = {
  reviews: GoogleReview[]
  averageRating: number
  totalCount: number
}
