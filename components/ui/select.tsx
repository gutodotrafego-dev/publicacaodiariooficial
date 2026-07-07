import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

type Option = { value: string; label: string }

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string
  label: string
  options: Option[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { error, label, options, placeholder, id, className, ...props },
  ref
) {
  const selectId = id ?? props.name
  const errorId = error ? `${selectId}-error` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-ink-900">
        {label}
      </label>
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={cn(
            'h-12 w-full appearance-none rounded-xl border bg-white px-4 pr-10 text-ink-900 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red',
            error ? 'border-red-500' : 'border-surface-200',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500"
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  )
})
