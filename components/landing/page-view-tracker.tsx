'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackEvent } from '@/lib/analytics'
import { captureAttribution } from '@/lib/attribution'

export function PageViewTracker({ landingPageType }: { landingPageType: string }) {
  const pathname = usePathname()

  useEffect(() => {
    captureAttribution()
    trackEvent('landing_page_view', { page_path: pathname, landing_page_type: landingPageType })
    // Executa apenas na montagem — captura de atribuição e o view devem
    // ocorrer uma única vez por carregamento de página.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
