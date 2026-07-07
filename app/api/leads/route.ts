import { NextRequest, NextResponse } from 'next/server'
import { leadApiSchema } from '@/lib/validations'
import { isRateLimited } from '@/lib/rate-limit'
import { forwardLeadToWebhook, LeadWebhookNotConfiguredError } from '@/lib/lead-service'
import { getPublicationNeedLabel } from '@/config/landing-pages'
import type { LeadPayload } from '@/types/lead'
import type { PublicationNeed } from '@/types/lead'

// Tempo mínimo plausível (ms) entre a montagem do formulário e o envio.
const MIN_FILL_TIME_MS = 2000

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return NextResponse.json(
      { error: { code: 'invalid_content_type', message: 'Content-Type inválido.' } },
      { status: 415 }
    )
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: { code: 'rate_limited', message: 'Muitas solicitações. Tente novamente em instantes.' } },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: { code: 'invalid_json', message: 'Corpo da requisição inválido.' } },
      { status: 400 }
    )
  }

  const parsed = leadApiSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'validation_error',
          message: 'Dados inválidos.',
          details: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 422 }
    )
  }

  const data = parsed.data

  // Honeypot preenchido → tráfego automatizado. Responde sucesso genérico
  // sem encaminhar ao webhook, para não revelar a proteção a bots.
  if (data.company) {
    return NextResponse.json({ data: { received: true } }, { status: 200 })
  }

  const elapsedMs = Date.now() - data.formStartedAt
  if (!Number.isFinite(elapsedMs) || elapsedMs < MIN_FILL_TIME_MS) {
    return NextResponse.json(
      { error: { code: 'suspicious_submission', message: 'Não foi possível processar sua solicitação.' } },
      { status: 400 }
    )
  }

  const publicationNeed = data.publicationNeed as PublicationNeed

  const payload: LeadPayload = {
    name: data.name,
    phone: `55${data.phone}`,
    email: data.email || null,
    publicationNeed,
    publicationNeedLabel: getPublicationNeedLabel(publicationNeed),
    landingPage: data.landingPage,
    pageTitle: data.pageTitle,
    referrer: data.referrer,
    entryUrl: data.entryUrl,
    utmSource: data.utmSource,
    utmMedium: data.utmMedium,
    utmCampaign: data.utmCampaign,
    utmContent: data.utmContent,
    utmTerm: data.utmTerm,
    gclid: data.gclid,
    fbclid: data.fbclid,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent'),
    company: data.company,
    formStartedAt: data.formStartedAt,
  }

  try {
    await forwardLeadToWebhook(payload)
  } catch (error) {
    if (error instanceof LeadWebhookNotConfiguredError) {
      console.error('[api/leads] LEAD_WEBHOOK_URL não configurada.')
      return NextResponse.json(
        {
          error: {
            code: 'webhook_not_configured',
            message: 'Serviço de recebimento de solicitações está indisponível no momento.',
          },
        },
        { status: 503 }
      )
    }
    console.error('[api/leads] Falha ao encaminhar lead ao webhook.')
    return NextResponse.json(
      { error: { code: 'webhook_error', message: 'Não foi possível registrar sua solicitação.' } },
      { status: 502 }
    )
  }

  return NextResponse.json({ data: { received: true } }, { status: 200 })
}

export async function GET() {
  return NextResponse.json(
    { error: { code: 'method_not_allowed', message: 'Método não permitido.' } },
    { status: 405 }
  )
}
