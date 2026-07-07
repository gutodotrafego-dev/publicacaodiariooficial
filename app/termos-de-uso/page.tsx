import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

// noindex: o conteúdo abaixo é um placeholder. Remover "robots" assim que o
// texto oficial (fornecido pela empresa) substituir o placeholder.
export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Termos de Uso da Central de Publicações.',
  robots: { index: false, follow: true },
}

export default function TermosDeUsoPage() {
  return (
    <>
      <Header />
      <main className="container-page py-14">
        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Termos de Uso</h1>
        <div className="mt-6 max-w-2xl text-sm leading-relaxed text-ink-700">
          <p>
            [CONFIRMAR COM A EMPRESA] — Este texto é um placeholder. O conteúdo oficial dos Termos de
            Uso, incluindo condições de utilização do site, responsabilidades e limitações, deve ser
            fornecido ou revisado pela empresa antes da publicação em produção.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
