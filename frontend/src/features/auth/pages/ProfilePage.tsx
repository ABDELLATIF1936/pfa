import { ArrowLeft, LogOut, PlugZap } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { PhotoUpload } from '@/features/auth/components/PhotoUpload'
import { ProfileForm } from '@/features/auth/components/ProfileForm'
import { WalletInfoCard } from '@/features/auth/components/WalletInfoCard'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useProfile } from '@/features/auth/hooks/useProfile'
import { ROUTES } from '@/routes/routes.config'

function ProfileLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50" aria-live="polite">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
      <span className="sr-only">Chargement du profil...</span>
    </main>
  )
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { profile, isLoading, error, updateProfile, uploadPhoto } = useProfile()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  if (isLoading) return <ProfileLoading />
  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6 text-center text-foreground">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
          <p className="text-sm text-red-600">{error ?? 'Profil indisponible.'}</p>
          <button type="button" className="mt-5 text-sm font-semibold text-accent-foreground hover:underline" onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <Link to={ROUTES.DASHBOARD_CLIENT} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" aria-hidden="true" /> Retour à l’accueil</Link>
          <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><LogOut className="size-4" aria-hidden="true" /> Déconnexion</button>
        </header>
        <div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground"><PlugZap className="size-5" aria-hidden="true" /></span><div><p className="font-mono text-xs uppercase tracking-[0.22em] text-accent-foreground">Espace conducteur</p><h1 className="text-3xl font-semibold tracking-tight">Mon profil</h1></div></div>
        <section className="flex flex-col gap-8 rounded-3xl border border-border bg-card p-6 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.18)] sm:p-10">
          <PhotoUpload profile={profile} uploadPhoto={uploadPhoto} />
          <div className="h-px bg-border" />
          <div className="flex flex-col gap-5"><div><h2 className="text-xl font-semibold">Informations personnelles</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Gardez vos informations à jour pour faciliter vos trajets.</p></div>
            <ProfileForm profile={profile} updateProfile={updateProfile} error={error} />
          </div>
        </section>
        <WalletInfoCard profile={profile} />
        <Link to={ROUTES.WALLET} className="inline-flex w-fit items-center text-sm font-semibold text-accent-foreground hover:underline">Gérer mon mode de paiement</Link>
      </div>
    </main>
  )
}