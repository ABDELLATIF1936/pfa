import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const describedBy = error ? `${id}-error` : props['aria-describedby']

    return (
      <label className="flex w-full flex-col gap-1 text-sm font-medium text-slate-700" htmlFor={id}>
        {label ? <span>{label}</span> : null}
        <input
          id={id}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`rounded-md border bg-white px-3 py-2 text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
              : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
          } ${className}`}
          {...props}
        />
        {error ? (
          <span id={`${id}-error`} className="text-xs text-red-600" aria-live="polite">
            {error}
          </span>
        ) : null}
      </label>
    )
  },
)

Input.displayName = 'Input'
