// Pequeno barramento de eventos, sem dependências externas, usado para que
// cards de serviço, FAQ e blocos de urgência possam "rolar até o formulário",
// pré-selecionar a necessidade de publicação e focar o campo de nome —
// sem acoplar esses componentes irmãos entre si.

const PREFILL_EVENT = 'cdp:lead-form-prefill'
const FORM_ANCHOR_ID = 'formulario'

export type PrefillDetail = {
  publicationNeed?: string
  // Quando true (padrão), sobrescreve a necessidade já selecionada.
  // Quando false, só preenche se o campo ainda estiver vazio.
  force?: boolean
}

export function emitLeadFormPrefill(detail: PrefillDetail = {}): void {
  if (typeof window === 'undefined') return

  window.dispatchEvent(new CustomEvent<PrefillDetail>(PREFILL_EVENT, { detail }))

  const formEl = document.getElementById(FORM_ANCHOR_ID)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  formEl?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' })
}

export function onLeadFormPrefill(handler: (detail: PrefillDetail) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const listener = (event: Event) => handler((event as CustomEvent<PrefillDetail>).detail)
  window.addEventListener(PREFILL_EVENT, listener)
  return () => window.removeEventListener(PREFILL_EVENT, listener)
}
