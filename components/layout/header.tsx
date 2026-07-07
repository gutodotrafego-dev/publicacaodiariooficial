'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Phone, Clock, Instagram, Facebook, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { emitLeadFormPrefill } from '@/lib/form-bus'
import { trackEvent } from '@/lib/analytics'
import { siteConfig } from '@/config/site'
import { contactConfig, isPendingConfirmation } from '@/config/contact'

function TopBar() {
  const phone = contactConfig.phones[0]
  const hours = !isPendingConfirmation(contactConfig.businessHours) ? contactConfig.businessHours : null
  const { instagram, facebook, linkedin } = contactConfig.socialLinks

  return (
    <div className="bg-brand-red text-white">
      <div className="container-page flex h-8 items-center justify-between gap-4 text-xs sm:h-9">
        <p className="truncate font-medium">Atendimento humano e especializado</p>
        <div className="hidden items-center gap-4 sm:flex">
          {phone && (
            <a href={phone.href} className="flex items-center gap-1.5 hover:text-white/80">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {phone.display}
            </a>
          )}
          {hours && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {hours}
            </span>
          )}
        </div>
        {(instagram || facebook || linkedin) && (
          <div className="flex flex-shrink-0 items-center gap-3">
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="h-3.5 w-3.5 hover:text-white/80" aria-hidden="true" />
              </a>
            )}
            {facebook && (
              <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook className="h-3.5 w-3.5 hover:text-white/80" aria-hidden="true" />
              </a>
            )}
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin className="h-3.5 w-3.5 hover:text-white/80" aria-hidden="true" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function Header() {
  function handleClick() {
    trackEvent('service_card_click', { button_location: 'header' })
    emitLeadFormPrefill()
  }

  return (
    <div className="sticky top-0 z-30">
      <TopBar />
      <header className="border-b border-surface-200 bg-white/95 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4 sm:h-20">
          <Link href="/" className="flex flex-shrink-0 items-center gap-2" aria-label={siteConfig.name}>
            <Image
              src={siteConfig.logo.src}
              alt={siteConfig.logo.alt}
              width={siteConfig.logo.width}
              height={siteConfig.logo.height}
              priority
              style={{ width: 'auto' }}
              className="h-8 sm:h-10 lg:h-16"
            />
          </Link>
          <Button
            type="button"
            variant="green"
            size="lg"
            onClick={handleClick}
            className="flex-shrink-0 !w-auto"
          >
            <span className="sm:hidden">Orçamento</span>
            <span className="hidden sm:inline">Solicitar orçamento</span>
          </Button>
        </div>
      </header>
    </div>
  )
}
