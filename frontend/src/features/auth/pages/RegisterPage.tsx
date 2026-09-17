import { RegisterForm } from '@/features/auth/components/RegisterForm'

export function RegisterPage() {
  return (
    <section aria-labelledby="register-title">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-foreground">Votre espace conducteur</p>
        <h1 id="register-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Créer votre compte</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Planifiez vos recharges en quelques secondes.</p>
      </div>
      <RegisterForm />
    </section>
  )
}

export default RegisterPage

