import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string
  label: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { error, label, hint, id, className, ...props },
  ref
) {
  const inputId = id ?? props.name
  const errorId = error ? `${inputId}-error` : undefined
  const hintId = hint ? `${inputId}-hint` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-ink-900">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={cn(errorId, hintId) || undefined}
        className={cn(
          'h-12 w-full rounded-xl border bg-white px-4 text-ink-900 placeholder:text-ink-500 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green',
          error ? 'border-red-500' : 'border-surface-200',
          className
        )}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="text-xs text-ink-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  )
})
