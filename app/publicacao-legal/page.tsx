import type { Metadata } from 'next'
import { LandingPage } from '@/components/landing/landing-page'
import { landingPages, buildPageMetadata } from '@/config/landing-pages'

const config = landingPages['publicacao-legal']

export const metadata: Metadata = buildPageMetadata(config)

export default function PublicacaoLegalPage() {
  return <LandingPage config={config} />
}
