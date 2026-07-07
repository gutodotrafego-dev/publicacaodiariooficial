import Image from 'next/image'
import { Phone, Mail, MapPin, Clock, Instagram, Facebook, Linkedin } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { contactConfig, isPendingConfirmation } from '@/config/contact'

export function Footer() {
  const hasAddress = contactConfig.address.length > 0
  const hasHours = !isPendingConfirmation(contactConfig.businessHours)
  const { instagram, facebook, linkedin } = contactConfig.socialLinks
  const hasSocial = Boolean(instagram || facebook || linkedin)

  return (
    <footer className="bg-ink-900 py-12 text-sm text-white/70">
      <div className="container-page grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-[1.1fr_0.9fr_1.1fr_1.1fr] lg:gap-x-8">
        <div className="flex flex-col gap-3">
          <Image
            src={siteConfig.logo.src}
            alt={siteConfig.logo.alt}
            width={siteConfig.logo.width}
            height={siteConfig.logo.height}
            style={{ width: 'auto' }}
            className="h-12 self-start"
          />
          <p className="leading-relaxed text-white/60">{siteConfig.description}</p>
        </div>

        <div className="flex flex-col gap-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-white/90">Contato</h3>
          {contactConfig.phones.map((phone) => (
            <a key={phone.href} href={phone.href} className="flex items-center gap-2 hover:text-brand-red">
              <Phone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {phone.display}
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-white/90">E-mails</h3>
          {contactConfig.emails.map((email) => (
            <a
              key={email.address}
              href={`mailto:${email.address}`}
              className="flex items-center gap-2 hover:text-brand-red"
            >
              <Mail className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>
                <span className="text-white/50">{email.label}: </span>
                {email.address}
              </span>
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-white/90">Endereço</h3>
          {hasAddress && (
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>
                {contactConfig.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </p>
          )}
          {hasHours && (
            <p className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {contactConfig.businessHours}
            </p>
          )}
          {!isPendingConfirmation(contactConfig.legalName) && <p>{contactConfig.legalName}</p>}
          {!isPendingConfirmation(contactConfig.cnpj) && <p>CNPJ: {contactConfig.cnpj}</p>}
          {hasSocial && (
            <div className="mt-1 flex items-center gap-3">
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="h-4 w-4 hover:text-white" aria-hidden="true" />
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Facebook className="h-4 w-4 hover:text-white" aria-hidden="true" />
                </a>
              )}
              {linkedin && (
                <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4 hover:text-white" aria-hidden="true" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="container-page mt-10 border-t border-white/10 pt-6 text-xs text-white/50">
        © {new Date().getFullYear()} {siteConfig.name}. Todos os direitos reservados.
      </p>
    </footer>
  )
}
