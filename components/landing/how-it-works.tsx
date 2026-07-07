const steps = [
  {
    number: '01',
    title: 'Preencha seus dados',
    description: 'Informe seus dados e selecione o tipo de publicação que você precisa.',
    accent: 'red',
  },
  {
    number: '02',
    title: 'Continue pelo WhatsApp',
    description:
      'Após o envio, você será direcionado automaticamente para conversar com nossa equipe.',
    accent: 'green',
  },
  {
    number: '03',
    title: 'Receba orientação e orçamento',
    description:
      'Nossa equipe entenderá sua necessidade e apresentará as opções adequadas para a publicação.',
    accent: 'red',
  },
] as const

const accentClasses = {
  red: { circle: 'bg-brand-red-light text-brand-red', line: 'bg-brand-red/20' },
  green: { circle: 'bg-brand-green-light text-brand-green', line: 'bg-brand-green/20' },
}

export function HowItWorks() {
  return (
    <section className="py-14 sm:py-20">
      <div className="container-page">
        <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">Sua solicitação em três passos</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-4">
          {steps.map((step, index) => (
            <div key={step.number} className="relative flex flex-col items-start sm:items-center sm:text-center">
              {index < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`absolute left-6 top-12 hidden h-0.5 w-full sm:block ${accentClasses[step.accent].line}`}
                />
              )}
              <div
                className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-mono text-lg font-bold ${accentClasses[step.accent].circle}`}
              >
                {step.number}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink-900">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-700">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
