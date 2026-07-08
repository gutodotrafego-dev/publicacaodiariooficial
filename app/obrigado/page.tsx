import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ThankYouConversion } from '@/components/landing/thank-you-conversion'

export const metadata: Metadata = {
  title: 'Obrigado',
  description: 'Sua solicitação de orçamento foi recebida.',
  robots: { index: false, follow: false },
}

export default function ObrigadoPage() {
  return (
    <>
      <Header />
      <main className="container-page py-14">
        <div className="relative mx-auto max-w-md overflow-hidden rounded-[20px] border border-surface-200 bg-white p-6 shadow-lg sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-brand-green" aria-hidden="true" />
          <ThankYouConversion />
        </div>
      </main>
      <Footer />
    </>
  )
}
