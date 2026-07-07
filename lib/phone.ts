export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function isValidBrazilianPhone(value: string): boolean {
  const digits = onlyDigits(value)
  return digits.length === 10 || digits.length === 11
}

/**
 * Aplica máscara brasileira de telefone/WhatsApp enquanto o usuário digita.
 * 10 dígitos → (00) 0000-0000 | 11 dígitos → (00) 00000-0000
 */
export function maskBrazilianPhone(rawValue: string): string {
  const digits = onlyDigits(rawValue).slice(0, 11)

  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

/**
 * Normaliza um telefone brasileiro para o formato E.164 sem o "+"
 * (ex.: 5548999999999), usado no payload enviado ao webhook.
 */
export function toWhatsappE164(value: string): string {
  const digits = onlyDigits(value)
  return `55${digits}`
}
