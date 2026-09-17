'use client'

import { useState } from 'react'
import { Check, MapPin, PlugZap } from 'lucide-react'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import type { AuthMode } from '@/features/auth/types/auth.types'

interface AuthShellProps {
  initialMode?: AuthMode
}

export function AuthShell({ initialMode = 'login' }: AuthShellProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const isRegister = mode === 'register'

  return (
    <main className="light flex min-h-screen items-center justify-center bg-background px-3 py-3 text-foreground sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_24px_70px_-35px_rgba(15,23,42,0.18)] sm:min-h-[calc(100vh-4rem)]">
        <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex xl:p-14">
          <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full border border-primary-foreground/10" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 size-80 rounded-full border border-primary-foreground/10" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground text-primary"><PlugZap className="size-5" aria-hidden="true" /></span>
              <span className="font-mono text-sm font-bold tracking-[0.18em]">VOLTWAY</span>
            </div>
            <div className="mt-24 max-w-sm">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary-foreground/60">EV charging network</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold leading-tight xl:text-5xl">Rechargez votre trajet, pas votre agenda.</h2>
              <p className="mt-6 max-w-xs text-sm leading-6 text-primary-foreground/70">Un accès simple à des milliers de bornes fiables, partout où la route vous mène.</p>
            </div>
          </div>
          <div className="relative flex items-center gap-3 border-t border-primary-foreground/15 pt-5 text-sm text-primary-foreground/70"><MapPin className="size-4 text-accent" aria-hidden="true" /><span>Rabat · Casablanca · El jadida · et plus</span></div>
        </aside>

        <section className="flex w-full flex-col justify-center px-6 py-10 sm:px-12 lg:w-[56%] lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 lg:hidden"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><PlugZap className="size-5" aria-hidden="true" /></span><span className="font-mono text-sm font-bold tracking-[0.18em]">VOLTWAY</span></div></div>
            <div className="mb-8 grid grid-cols-2 rounded-xl bg-muted p-1" role="tablist" aria-label="Type d'accès">
              <button type="button" role="tab" aria-selected={!isRegister} onClick={() => setMode('login')} className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${!isRegister ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Connexion</button>
              <button type="button" role="tab" aria-selected={isRegister} onClick={() => setMode('register')} className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${isRegister ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Inscription</button>
            </div>
            {isRegister ? <RegisterPage /> : <LoginPage />}
            <p className="mt-8 text-center text-sm text-muted-foreground">{isRegister ? 'Vous avez déjà un compte ?' : 'Pas encore de compte ?'}{' '}<button type="button" onClick={() => setMode(isRegister ? 'login' : 'register')} className="font-semibold text-accent-foreground hover:underline">{isRegister ? 'Se connecter' : 'Créer un compte'}</button></p>
            <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground"><Check className="size-3.5 text-accent-foreground" aria-hidden="true" /> Vos données restent protégées</div>
          </div>
        </section>
      </div>
    </main>
  )
}
