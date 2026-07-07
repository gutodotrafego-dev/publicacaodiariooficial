import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'
import { landingPages } from '@/config/landing-pages'

export default function sitemap(): MetadataRoute.Sitemap {
  // Páginas legais (política de privacidade e termos de uso) ficam de fora
  // do sitemap enquanto o conteúdo for placeholder e estiver marcado como
  // noindex — ver app/politica-de-privacidade e app/termos-de-uso.
  return Object.values(landingPages).map((page) => ({
    url: `${siteConfig.url}${page.slug === '/' ? '' : page.slug}`,
    lastModified: new Date(),
  }))
}
