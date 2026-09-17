import { LoginForm } from '@/features/auth/components/LoginForm'

export function LoginPage() {
  return (
    <section aria-labelledby="login-title">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-foreground">Votre espace conducteur</p>
        <h1 id="login-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Bon retour parmi nous</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Connectez-vous pour retrouver vos trajets et vos bornes favorites.</p>
      </div>
      <LoginForm />
    </section>
  )
}

export default LoginPage
