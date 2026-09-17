import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return <div className={`rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_-28px_rgba(15,23,42,.32)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-28px_rgba(15,23,42,.4)] ${className}`} {...props}>{children}</div>
}
