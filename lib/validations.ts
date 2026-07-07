import { z } from 'zod'
import { PUBLICATION_NEED_OPTIONS } from '@/config/landing-pages'
import { onlyDigits } from '@/lib/phone'

const publicationNeedValues = PUBLICATION_NEED_OPTIONS.map((o) => o.value)

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Schema client-side (React Hook Form). Mantém o tipo de saída como `string`
 * simples em todos os campos para casar 1:1 com o estado do formulário.
 */
export const leadFormSchema = z.object({
  name: z
    .string()
    .transform((v) => v.trim().replace(/\s+/g, ' '))
    .refine((v) => v.length >= 2, { message: 'Informe seu nome completo.' })
    .refine((v) => v.length <= 100, { message: 'Nome muito longo.' })
    .refine((v) => !/^\d+$/.test(v), { message: 'Informe um nome válido.' }),
  phone: z
    .string()
    .refine((v) => {
      const digits = onlyDigits(v)
      return digits.length === 10 || digits.length === 11
    }, { message: 'Informe um WhatsApp válido com DDD.' }),
  email: z
    .string()
    .refine((v) => v.trim() === '' || EMAIL_REGEX.test(v.trim()), {
      message: 'Informe um e-mail válido.',
    }),
  publicationNeed: z
    .string()
    .min(1, { message: 'Selecione uma opção.' })
    .refine((v) => (publicationNeedValues as string[]).includes(v), {
      message: 'Selecione uma opção válida.',
    }),
  company: z.string().max(0, { message: 'Campo inválido.' }),
})

export type LeadFormSchema = z.infer<typeof leadFormSchema>

/**
 * Schema server-side (/api/leads). Mais estrito: normaliza, sanitiza e
 * limita o tamanho de todos os campos, incluindo os de atribuição.
 */
const optionalText = (max: number) =>
  z.preprocess(
    (v) => (v === undefined || v === null || v === '' ? null : String(v).trim().slice(0, max)),
    z.string().max(max).nullable()
  )

export const leadApiSchema = z.object({
  name: z
    .string()
    .transform((v) => v.trim().replace(/\s+/g, ' '))
    .refine((v) => v.length >= 2 && v.length <= 100, { message: 'Nome inválido.' })
    .refine((v) => !/^\d+$/.test(v), { message: 'Nome inválido.' }),
  phone: z
    .string()
    .transform((v) => onlyDigits(v))
    .refine((v) => v.length === 10 || v.length === 11, { message: 'WhatsApp inválido.' }),
  email: z
    .string()
    .optional()
    .transform((v) => (v ? v.trim().toLowerCase() : ''))
    .refine((v) => v === '' || EMAIL_REGEX.test(v), { message: 'E-mail inválido.' }),
  publicationNeed: z.enum(publicationNeedValues as [string, ...string[]], {
    errorMap: () => ({ message: 'Necessidade de publicação inválida.' }),
  }),
  landingPage: z.string().max(200),
  pageTitle: z.string().max(200),
  referrer: optionalText(500),
  entryUrl: optionalText(500),
  utmSource: optionalText(150),
  utmMedium: optionalText(150),
  utmCampaign: optionalText(150),
  utmContent: optionalText(150),
  utmTerm: optionalText(150),
  gclid: optionalText(200),
  fbclid: optionalText(200),
  // Honeypot: deve chegar vazio. Preenchido = bot.
  company: z.string().max(200).optional().default(''),
  // Timestamp (ms) de quando o formulário foi montado no cliente.
  formStartedAt: z.number().int().positive(),
})

export type LeadApiSchema = z.infer<typeof leadApiSchema>
