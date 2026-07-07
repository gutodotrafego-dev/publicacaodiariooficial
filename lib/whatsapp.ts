import { contactConfig } from '@/config/contact'
import { onlyDigits } from '@/lib/phone'

export function buildWhatsappSuccessMessage(name: string, publicationNeedLabel: string): string {
  return [
    'Olá! Acabei de solicitar um orçamento pelo site da Central de Publicações.',
    '',
    `Meu nome é ${name} e preciso de ajuda com ${publicationNeedLabel}.`,
    '',
    'Gostaria de receber orientação e orçamento.',
  ].join('\n')
}

export function buildWhatsappErrorMessage(name: string, publicationNeedLabel: string): string {
  return [
    'Olá! Tentei solicitar um orçamento pelo site da Central de Publicações.',
    '',
    `Meu nome é ${name} e preciso de ajuda com ${publicationNeedLabel}.`,
    '',
    'Gostaria de receber orientação e orçamento.',
  ].join('\n')
}

export function getWhatsappRedirectUrl(message: string): string {
  const digits = onlyDigits(contactConfig.whatsappNumber)
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
