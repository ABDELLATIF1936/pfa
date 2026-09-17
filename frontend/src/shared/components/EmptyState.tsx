import type { ReactNode } from 'react'

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><h2 className="text-lg font-semibold text-slate-900">{title}</h2>{description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}{action ? <div className="mt-5">{action}</div> : null}</div>
}
