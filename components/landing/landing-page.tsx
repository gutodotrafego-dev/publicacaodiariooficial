import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PageViewTracker } from './page-view-tracker'
import { Hero } from './hero'
import { TrustBar } from './trust-bar'
import { HowItWorks } from './how-it-works'
import { PublicationChannels } from './publication-channels'
import { PublicationTypes } from './publication-types'
import { Benefits } from './benefits'
import { GoogleReviews } from './google-reviews'
import { UrgencySection } from './urgency-section'
import { Faq } from './faq'
import { FinalCta } from './final-cta'
import { getOfficialGoogleReviews } from '@/lib/google-places'
import { googleReviews as staticGoogleReviews, showGoogleReviews } from '@/config/google-reviews'
import { contactConfig } from '@/config/contact'
import type { LandingPageConfig } from '@/config/landing-pages'

export async function LandingPage({ config }: { config: LandingPageConfig }) {
  const officialReviews = await getOfficialGoogleReviews()
  const reviews = officialReviews?.reviews ?? staticGoogleReviews
  const isOfficialSource = Boolean(officialReviews)
  // Nota média e quantidade sempre reais: da API oficial quando configurada,
  // ou calculadas a partir das avaliações estáticas cadastradas (nunca inventadas).
  const averageRating =
    officialReviews?.averageRating ??
    (staticGoogleReviews.length > 0
      ? staticGoogleReviews.reduce((sum, review) => sum + review.rating, 0) / staticGoogleReviews.length
      : 0)
  const totalCount = officialReviews?.totalCount ?? staticGoogleReviews.length

  return (
    <>
      <PageViewTracker landingPageType={config.analyticsLandingPageType} />
      <Header />
      <main>
        <Hero config={config} />
        <TrustBar />
        <GoogleReviews
          reviews={reviews}
          averageRating={averageRating}
          totalCount={totalCount}
          show={showGoogleReviews}
          isOfficialSource={isOfficialSource}
          googleMapsProfileUrl={contactConfig.googleMapsProfileUrl}
          googleReviewUrl={contactConfig.googleReviewUrl}
          landingPageType={config.analyticsLandingPageType}
        />
        <PublicationChannels />
        <HowItWorks />
        <PublicationTypes />
        <Benefits />
        <UrgencySection />
        <Faq items={config.faqs} landingPageType={config.analyticsLandingPageType} />
        <FinalCta ctaLabel={config.ctaLabel} landingPageType={config.analyticsLandingPageType} />
      </main>
      <Footer />
    </>
  )
}
