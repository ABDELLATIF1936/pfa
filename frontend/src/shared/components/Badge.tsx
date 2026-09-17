import type { ReactNode } from 'react'

export type BadgeVariant = 'default' | 'success' | 'info' | 'danger' | 'warning'

export function Badge({ children, className = '', variant = 'default' }: { children: ReactNode; className?: string; variant?: BadgeVariant }) {
  const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-50 text-emerald-700',
    info: 'bg-blue-50 text-blue-700',
    danger: 'bg-red-50 text-red-700',
    warning: 'bg-orange-50 text-orange-700',
  }

  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${variantClasses[variant]} ${className}`}>{children}</span>
}
