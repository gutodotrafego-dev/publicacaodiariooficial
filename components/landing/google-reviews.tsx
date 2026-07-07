'use client'

import { useEffect, useRef, useState } from 'react'
import { Star } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import type { GoogleReview } from '@/types/google-review'

const TRUNCATE_LENGTH = 220
const MAX_DISPLAYED_REVIEWS = 6

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const starClass = size === 'md' ? 'h-5 w-5' : 'h-4 w-4'
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`Nota ${rating} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < Math.round(rating)
              ? `${starClass} fill-amber-400 text-amber-400`
              : `${starClass} text-surface-200`
          }
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

function ReviewCard({
  review,
  index,
  landingPageType,
}: {
  review: GoogleReview
  index: number
  landingPageType: string
}) {
  const [expanded, setExpanded] = useState(false)
  const isLong = review.text.length > TRUNCATE_LENGTH
  const displayText = expanded || !isLong ? review.text : `${review.text.slice(0, TRUNCATE_LENGTH).trim()}...`

  function handleToggle() {
    const next = !expanded
    setExpanded(next)
    if (next) {
      trackEvent('google_review_expand', { landing_page_type: landingPageType, review_position: index })
    }
  }

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-surface-200 border-t-2 border-t-brand-red/30 bg-white p-6 shadow-card">
      <div className="flex items-center gap-3">
        {review.authorPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.authorPhotoUrl}
            alt=""
            aria-hidden="true"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-red/10 text-sm font-semibold text-brand-red"
            aria-hidden="true"
          >
            {review.authorName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-ink-900">{review.authorName}</p>
          {review.dateLabel ? <p className="text-xs text-ink-500">{review.dateLabel}</p> : null}
        </div>
      </div>

      <StarRating rating={review.rating} />

      <p className="flex-1 text-sm leading-relaxed text-ink-700">{displayText}</p>

      {isLong ? (
        <button
          type="button"
          onClick={handleToggle}
          className="w-fit text-sm font-medium text-brand-red underline-offset-2 hover:underline"
        >
          {expanded ? 'Ver menos' : 'Ler avaliação completa'}
        </button>
      ) : null}

      <div className="flex items-center gap-1.5 border-t border-surface-200 pt-3 text-xs text-ink-500">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-green" aria-hidden="true" />
        Avaliação no Google
      </div>
    </div>
  )
}

type GoogleReviewsProps = {
  reviews: GoogleReview[]
  averageRating: number
  totalCount: number
  show: boolean
  isOfficialSource: boolean
  googleMapsProfileUrl: string
  googleReviewUrl: string
  landingPageType: string
}

export function GoogleReviews({
  reviews,
  averageRating,
  totalCount,
  show,
  isOfficialSource,
  googleMapsProfileUrl,
  googleReviewUrl,
  landingPageType,
}: GoogleReviewsProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const trackedRef = useRef(false)
  const displayedReviews = reviews.slice(0, MAX_DISPLAYED_REVIEWS)

  useEffect(() => {
    if (!show || displayedReviews.length === 0) return
    const node = sectionRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !trackedRef.current) {
            trackedRef.current = true
            trackEvent('google_reviews_section_view', { landing_page_type: landingPageType })
            observer.disconnect()
          }
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [show, displayedReviews.length, landingPageType])

  if (!show || displayedReviews.length === 0) return null

  return (
    <section ref={sectionRef} className="border-t border-surface-200 bg-surface-50 py-16">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">
            Quem publica com a Central recomenda
          </h2>
          <p className="mt-2 text-sm text-ink-500">
            Veja as experiências compartilhadas por nossos clientes.
          </p>

          {averageRating > 0 ? (
            <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xl font-bold text-ink-900">
                  {averageRating.toFixed(1)}
                </span>
                <StarRating rating={averageRating} size="md" />
              </div>
              <span className="text-sm text-ink-500">
                {totalCount} {totalCount === 1 ? 'avaliação' : 'avaliações'} no Google
              </span>
            </div>
          ) : null}

          {isOfficialSource ? (
            <p className="mt-2 text-xs text-ink-500">
              Avaliações reais exibidas a partir do perfil do Google da Central de Publicações.
            </p>
          ) : null}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedReviews.map((review, index) => (
            <ReviewCard key={review.id} review={review} index={index} landingPageType={landingPageType} />
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {googleMapsProfileUrl ? (
            <a
              href={googleMapsProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('google_reviews_profile_click', { landing_page_type: landingPageType })}
              className="text-sm font-medium text-brand-red underline-offset-2 hover:underline"
            >
              Ver todas as avaliações no Google
            </a>
          ) : null}
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('google_review_submission_click', { landing_page_type: landingPageType })}
            className="text-sm font-medium text-brand-green underline-offset-2 hover:underline"
          >
            Deixar uma avaliação no Google
          </a>
        </div>
      </div>
    </section>
  )
}
