import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  isLoading?: boolean
}

export function Button({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variantClasses =
    variant === 'primary'
      ? 'bg-gradient-to-r from-primary-400 to-brand-blue text-slate-950 shadow-[0_0_28px_rgba(52,211,153,.22)] hover:shadow-[0_0_40px_rgba(52,211,153,.38)] hover:brightness-105 active:scale-[.98]'
      : 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-primary-300 hover:bg-primary-50 hover:shadow-md'

  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Chargement...</span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}
