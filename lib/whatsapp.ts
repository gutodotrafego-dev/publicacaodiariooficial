import { contactConfig } from '@/config/contact'
import { onlyDigits } from '@/lib/phone'

// Mensagem genérica, sem nome/telefone/e-mail ou qualquer dado do formulário —
// usada na URL do WhatsApp que é salva no sessionStorage (etapa /obrigado). O
// lead já foi enviado ao backend em /api/leads antes deste ponto, então a
// mensagem não precisa (e não deve) repetir dados pessoais.
export function buildWhatsappGenericMessage(): string {
  return 'Olá, acabei de solicitar um orçamento pelo site da Central de Publicações.'
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
