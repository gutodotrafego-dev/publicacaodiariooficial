import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

// noindex: o conteúdo abaixo é um placeholder. Remover "robots" assim que o
// texto oficial (fornecido pela empresa) substituir o placeholder.
export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Política de Privacidade da Central de Publicações.',
  robots: { index: false, follow: true },
}

export default function PoliticaDePrivacidadePage() {
  return (
    <>
      <Header />
      <main className="container-page py-14">
        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Política de Privacidade</h1>
        <div className="mt-6 max-w-2xl text-sm leading-relaxed text-ink-700">
          <p>
            [CONFIRMAR COM A EMPRESA] — Este texto é um placeholder. O conteúdo oficial da Política de
            Privacidade, incluindo hipóteses de tratamento de dados pessoais, finalidades, prazos de
            retenção, direitos do titular (LGPD) e canal de contato do encarregado (DPO), deve ser
            fornecido ou revisado pela empresa antes da publicação em produção.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
