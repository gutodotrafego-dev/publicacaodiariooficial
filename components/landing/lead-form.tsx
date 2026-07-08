'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { leadFormSchema, type LeadFormSchema } from '@/lib/validations'
import { PUBLICATION_NEED_OPTIONS, getPublicationNeedLabel } from '@/config/landing-pages'
import { maskBrazilianPhone, onlyDigits } from '@/lib/phone'
import {
  buildWhatsappSuccessMessage,
  buildWhatsappErrorMessage,
  getWhatsappRedirectUrl,
} from '@/lib/whatsapp'
import { getAttribution } from '@/lib/attribution'
import { trackEvent, trackGoogleAdsConversion } from '@/lib/analytics'
import { onLeadFormPrefill } from '@/lib/form-bus'
import { contactConfig } from '@/config/contact'
import { cn } from '@/lib/cn'
import type { PublicationNeed, LeadApiResponse } from '@/types/lead'

type Status = 'idle' | 'submitting' | 'success' | 'error'
type Step = 1 | 2

export function LeadForm({
  defaultPublicationNeed,
  landingPageType,
  ctaLabel,
}: {
  defaultPublicationNeed?: PublicationNeed
  landingPageType: string
  ctaLabel: string
}) {
  const [status, setStatus] = useState<Status>('idle')
  // Páginas com necessidade pré-definida pulam a etapa de seleção e exibem
  // os dados pessoais diretamente.
  const [step, setStep] = useState<Step>(defaultPublicationNeed ? 2 : 1)
  const formStartedAt = useRef(Date.now())
  const hasTrackedStart = useRef(false)
  const isSubmittingRef = useRef(false)
  const hasRedirectedRef = useRef(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setFocus,
    getValues,
    watch,
    trigger,
    formState: { errors },
  } = useForm<LeadFormSchema>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      publicationNeed: defaultPublicationNeed ?? '',
      company: '',
    },
  })

  useEffect(() => {
    return onLeadFormPrefill(({ publicationNeed, force = true }) => {
      if (publicationNeed) {
        const current = getValues('publicationNeed')
        if (force || !current) {
          setValue('publicationNeed', publicationNeed, { shouldValidate: true })
        }
      }
      // Só avança/foca a etapa de dados pessoais quando já existe (ou já
      // existia) uma necessidade selecionada — caso contrário permanece na
      // etapa de seleção de cards.
      if (defaultPublicationNeed || publicationNeed) {
        setStep(2)
        setFocus('name')
      }
    })
  }, [setValue, setFocus, getValues, defaultPublicationNeed])

  function trackFormStartOnce() {
    if (hasTrackedStart.current) return
    hasTrackedStart.current = true
    trackEvent('quote_form_start', { landing_page_type: landingPageType })
  }

  const isBusy = status === 'submitting' || status === 'success'
  const selectedPublicationNeed = watch('publicationNeed')

  async function handleContinue() {
    const valid = await trigger('publicationNeed')
    if (!valid) return
    setStep(2)
    setFocus('name')
  }

  function handleBack() {
    setStep(1)
  }

  const onSubmit = handleSubmit(async (values) => {
    // Guarda síncrona contra reenvio: o `disabled={isBusy}` do botão só surte
    // efeito após o próximo render do React, o que não impede cliques muito
    // rápidos (ou disparos duplicados de evento) na mesma tarefa síncrona.
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true

    const needValue = values.publicationNeed as PublicationNeed

    trackEvent('quote_form_submit', {
      landing_page_type: landingPageType,
      publication_need: needValue,
    })

    setStatus('submitting')

    const attribution = getAttribution()

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          phone: onlyDigits(values.phone),
          email: values.email.trim().toLowerCase(),
          publicationNeed: needValue,
          landingPage: window.location.pathname,
          pageTitle: document.title,
          referrer: attribution?.referrer ?? document.referrer ?? null,
          entryUrl: attribution?.entryUrl ?? window.location.href,
          utmSource: attribution?.utmSource ?? null,
          utmMedium: attribution?.utmMedium ?? null,
          utmCampaign: attribution?.utmCampaign ?? null,
          utmContent: attribution?.utmContent ?? null,
          utmTerm: attribution?.utmTerm ?? null,
          gclid: attribution?.gclid ?? null,
          fbclid: attribution?.fbclid ?? null,
          company: values.company,
          formStartedAt: formStartedAt.current,
        }),
      })

      const json = (await response.json().catch(() => null)) as LeadApiResponse | null

      if (!response.ok || !json || !('data' in json) || !json.data.received) {
        throw new Error('lead_submit_failed')
      }

      trackEvent('quote_form_success', {
        landing_page_type: landingPageType,
        publication_need: needValue,
      })

      const needLabel = getPublicationNeedLabel(needValue)
      const message = buildWhatsappSuccessMessage(values.name, needLabel)

      trackEvent('whatsapp_redirect', { landing_page_type: landingPageType })
      setStatus('success')

      // `trackGoogleAdsConversion` pode invocar este callback duas vezes
      // (event_callback do gtag + timeout de segurança), então protegemos o
      // redirecionamento em si contra execução duplicada com useRef.
      hasRedirectedRef.current = false
      function redirectOnce() {
        if (hasRedirectedRef.current) return
        hasRedirectedRef.current = true
        window.location.assign(getWhatsappRedirectUrl(message))
      }

      // Redireciona ao WhatsApp assim que a conversão do Google Ads for
      // registrada (ou após o timeout de segurança, caso o gtag.js esteja
      // bloqueado) — nunca antes da confirmação de sucesso do webhook.
      trackGoogleAdsConversion(redirectOnce)
    } catch {
      trackEvent('quote_form_error', {
        landing_page_type: landingPageType,
        publication_need: needValue,
      })
      setStatus('error')
      isSubmittingRef.current = false
    }
  })

  function handleAlternativeWhatsapp() {
    const values = getValues()
    const needLabel = values.publicationNeed
      ? getPublicationNeedLabel(values.publicationNeed as PublicationNeed)
      : 'uma publicação'
    const message = buildWhatsappErrorMessage(values.name || 'Visitante', needLabel)
    window.location.assign(getWhatsappRedirectUrl(message))
  }

  const whatsappConfigured = Boolean(onlyDigits(contactConfig.whatsappNumber))

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !whatsappConfigured) {
      // eslint-disable-next-line no-console
      console.warn(
        '[lead-form] NEXT_PUBLIC_WHATSAPP_NUMBER não configurado — o redirecionamento para o WhatsApp não funcionará.'
      )
    }
  }, [whatsappConfigured])

  const showSteps = !defaultPublicationNeed

  return (
    <div
      id="formulario"
      className="relative scroll-mt-24 overflow-hidden rounded-[20px] border border-surface-200 bg-white p-6 shadow-lg sm:p-8"
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-brand-red" aria-hidden="true" />
      <h2 className="flex items-center gap-2 text-xl font-bold text-ink-900">
        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-brand-green" aria-hidden="true" />
        Solicite seu orçamento
      </h2>
      <p className="mt-1 text-sm text-ink-700">
        {step === 1
          ? 'Selecione o que você precisa publicar para continuar.'
          : 'Preencha os dados abaixo e continue o atendimento diretamente pelo WhatsApp.'}
      </p>
      {showSteps && (
        <p className="mt-1 text-xs font-medium text-ink-500">Etapa {step} de 2</p>
      )}

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4">
        {/* Honeypot — invisível e inacessível por teclado/leitor de tela */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
          {...register('company')}
        />

        {defaultPublicationNeed && (
          <input type="hidden" defaultValue={defaultPublicationNeed} {...register('publicationNeed')} />
        )}

        {step === 1 && (
          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-medium text-ink-900">
              Com o que você precisa de ajuda?
            </legend>
            <div
              role="radiogroup"
              aria-label="Com o que você precisa de ajuda?"
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {PUBLICATION_NEED_OPTIONS.map((option) => {
                const isSelected = selectedPublicationNeed === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      setValue('publicationNeed', option.value, { shouldValidate: true })
                      trackFormStartOnce()
                    }}
                    className={cn(
                      'relative flex min-h-[64px] items-center rounded-xl border p-4 text-left text-sm font-medium text-ink-900 transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2',
                      isSelected
                        ? 'border-brand-green bg-brand-green-light ring-1 ring-brand-green/30'
                        : 'border-surface-200 hover:border-brand-green/40'
                    )}
                  >
                    <span className="pr-6">{option.label}</span>
                    {isSelected && (
                      <CheckCircle2
                        aria-hidden="true"
                        className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-green"
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {errors.publicationNeed && (
              <p role="alert" className="text-xs font-medium text-red-600">
                {errors.publicationNeed.message}
              </p>
            )}

            <Button type="button" variant="green" size="lg" className="mt-2" onClick={handleContinue}>
              Continuar
            </Button>
          </fieldset>
        )}

        {step === 2 && (
          <>
            <Input
              label="Seu nome"
              placeholder="Digite seu nome"
              autoComplete="name"
              maxLength={100}
              disabled={isBusy}
              error={errors.name?.message}
              onFocus={trackFormStartOnce}
              {...register('name')}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field, fieldState }) => (
                <Input
                  label="WhatsApp"
                  placeholder="(00) 00000-0000"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={16}
                  disabled={isBusy}
                  error={fieldState.error?.message}
                  name={field.name}
                  value={field.value}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  onChange={(e) => field.onChange(maskBrazilianPhone(e.target.value))}
                />
              )}
            />

            <Input
              label="E-mail"
              type="email"
              placeholder="seuemail@empresa.com.br"
              autoComplete="email"
              maxLength={150}
              disabled={isBusy}
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              {showSteps && (
                <Button type="button" variant="outline" size="lg" disabled={isBusy} onClick={handleBack}>
                  Voltar
                </Button>
              )}
              <Button
                type="submit"
                variant="green"
                size="lg"
                disabled={isBusy}
                className="sm:flex-1 whitespace-nowrap !text-sm sm:!text-base"
              >
                {status === 'submitting' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {status === 'submitting'
                  ? 'Enviando solicitação...'
                  : status === 'success'
                    ? 'Abrindo o WhatsApp...'
                    : ctaLabel}
              </Button>
            </div>

            <p aria-live="polite" className="sr-only">
              {status === 'submitting' && 'Enviando solicitação.'}
              {status === 'success' && 'Solicitação registrada. Abrindo o WhatsApp.'}
              {status === 'error' && 'Não foi possível registrar sua solicitação.'}
            </p>

            <p className="text-xs leading-relaxed text-ink-500">
              Após o envio, você será direcionado automaticamente para conversar com nossa equipe.
            </p>

            <p className="text-xs leading-relaxed text-ink-500">
              Ao enviar, você concorda com o contato da Central de Publicações sobre esta solicitação
              e declara estar de acordo com a{' '}
              <a href={contactConfig.privacyPolicyUrl} className="underline hover:text-brand-red">
                Política de Privacidade
              </a>
              .
            </p>

            {status === 'error' && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700">
                  Não foi possível registrar sua solicitação. Tente novamente ou continue diretamente
                  pelo WhatsApp.
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Button type="button" variant="outline" size="md" onClick={() => setStatus('idle')}>
                    Tentar novamente
                  </Button>
                  <Button type="button" variant="whatsapp" size="md" onClick={handleAlternativeWhatsapp}>
                    Continuar pelo WhatsApp
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </form>
    </div>
  )
}
