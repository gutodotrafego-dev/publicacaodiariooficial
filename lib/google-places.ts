import 'server-only'
import type { GoogleReviewsSummary } from '@/types/google-review'

/**
 * Integração opcional e oficial com a Google Places API (Place Details),
 * executada exclusivamente no servidor. A chave nunca é exposta ao navegador
 * e nenhuma requisição é feita a cada visualização (usa cache/revalidação
 * do fetch do Next.js).
 *
 * Estratégia de fallback: se a integração não estiver habilitada ou falhar,
 * retorna null e o chamador deve recair sobre as avaliações estáticas
 * cadastradas em src/config/google-reviews.ts.
 */
export async function getOfficialGoogleReviews(): Promise<GoogleReviewsSummary | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID

  if (!apiKey || !placeId) {
    return null
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    url.searchParams.set('place_id', placeId)
    url.searchParams.set('fields', 'reviews,rating,user_ratings_total')
    url.searchParams.set('key', apiKey)
    url.searchParams.set('language', 'pt-BR')

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // 1h — evita chamada externa a cada visualização
    })

    if (!response.ok) return null

    const json = (await response.json()) as {
      result?: {
        rating?: number
        user_ratings_total?: number
        reviews?: Array<{
          author_name: string
          profile_photo_url?: string
          rating: number
          text: string
          relative_time_description?: string
          author_url?: string
        }>
      }
    }

    const reviews = json.result?.reviews
    if (!reviews || reviews.length === 0) return null

    return {
      reviews: reviews.map((review, index) => ({
        id: `google-places-${index}`,
        authorName: review.author_name,
        authorPhotoUrl: review.profile_photo_url,
        rating: review.rating,
        text: review.text,
        dateLabel: review.relative_time_description,
        sourceUrl: review.author_url,
      })),
      // Nota média e total reais retornados pela própria API do Google (nível
      // do local, não apenas das avaliações incluídas na resposta).
      averageRating: json.result?.rating ?? 0,
      totalCount: json.result?.user_ratings_total ?? reviews.length,
    }
  } catch {
    // Indisponibilidade da API não deve quebrar a landing page.
    return null
  }
}
