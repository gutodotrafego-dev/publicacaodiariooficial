import Link from 'next/link'
import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'green' | 'whatsapp' | 'outline' | 'ghost'
type Size = 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand-red text-white hover:bg-brand-red-dark shadow-card hover:shadow-card-hover',
  green:
    'bg-brand-green text-white hover:bg-brand-green-dark shadow-card hover:shadow-card-hover',
  whatsapp: 'bg-whatsapp text-white hover:bg-whatsapp-dark shadow-card hover:shadow-card-hover',
  outline: 'bg-white text-ink-900 border border-surface-200 hover:border-brand-red/40',
  ghost: 'bg-transparent text-ink-900 hover:bg-surface-100',
}

const sizeClasses: Record<Size, string> = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-14 px-7 text-base',
}

const baseClasses =
  'inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2'

type CommonProps = {
  variant?: Variant
  size?: Size
  className?: string
  children: React.ReactNode
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined
  }

type ButtonAsLink = CommonProps & {
  href: string
  target?: string
  rel?: string
  onClick?: () => void
}

type ButtonProps = ButtonAsButton | ButtonAsLink

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, children, ...props },
  ref
) {
  const classes = cn(baseClasses, variantClasses[variant], sizeClasses[size], className)

  if ('href' in props && props.href) {
    const { href, target, rel, onClick } = props
    return (
      <Link href={href} target={target} rel={rel} onClick={onClick} className={classes}>
        {children}
      </Link>
    )
  }

  const buttonProps = props as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button ref={ref} className={classes} {...buttonProps}>
      {children}
    </button>
  )
})
