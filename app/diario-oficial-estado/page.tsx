import type { Metadata } from 'next'
import { LandingPage } from '@/components/landing/landing-page'
import { landingPages, buildPageMetadata } from '@/config/landing-pages'

const config = landingPages['diario-oficial-estado']

export const metadata: Metadata = buildPageMetadata(config)

export default function DiarioOficialEstadoPage() {
  return <LandingPage config={config} />
}
