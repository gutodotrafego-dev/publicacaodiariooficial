import 'server-only'
import type { LeadPayload } from '@/types/lead'

const WEBHOOK_TIMEOUT_MS = 8000

export class LeadWebhookError extends Error {}
export class LeadWebhookNotConfiguredError extends LeadWebhookError {}

/**
 * Encaminha o lead validado para o webhook configurado em LEAD_WEBHOOK_URL.
 * Nunca é chamado no client — apenas dentro da API route /api/leads.
 */
export async function forwardLeadToWebhook(payload: LeadPayload): Promise<void> {
  const webhookUrl = process.env.LEAD_WEBHOOK_URL
  if (!webhookUrl) {
    throw new LeadWebhookNotConfiguredError('LEAD_WEBHOOK_URL não configurada.')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS)

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (process.env.LEAD_WEBHOOK_SECRET) {
      headers['X-Webhook-Secret'] = process.env.LEAD_WEBHOOK_SECRET
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new LeadWebhookError(`Webhook respondeu com status ${response.status}`)
    }
  } catch (error) {
    if (error instanceof LeadWebhookError) throw error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new LeadWebhookError('Tempo limite excedido ao registrar o lead.')
    }
    throw new LeadWebhookError('Falha de rede ao registrar o lead.')
  } finally {
    clearTimeout(timeoutId)
  }
}
