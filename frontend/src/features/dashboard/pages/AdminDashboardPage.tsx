import { Activity, Radio } from 'lucide-react';
import { useMemo } from 'react';

import { BornesGrid } from '@/features/dashboard/components/BornesGrid';
import { AlertesPanel } from '@/features/dashboard/components/AlertesPanel';
import { AdminNavbar } from '@/features/dashboard/components/AdminNavbar';
import { StatsSummaryCards } from '@/features/dashboard/components/StatsSummaryCards';
import { useBornesRealtime } from '@/features/dashboard/hooks/useBornesRealtime';
import { PageTransition } from '@/shared/components/PageTransition';
import { Skeleton } from '@/shared/components/Skeleton';

export function AdminDashboardPage() {
  const { bornes, isConnected } = useBornesRealtime();
  const summary = useMemo(
    () => ({
      disponible: bornes.filter((borne) => borne.statut === 'disponible')
        .length,
      en_charge: bornes.filter((borne) => borne.statut === 'en_charge').length,
      en_panne: bornes.filter((borne) => borne.statut === 'en_panne').length,
      hors_service: bornes.filter((borne) => borne.statut === 'hors_service')
        .length,
      total: bornes.length,
    }),
    [bornes],
  );

  return (
    <>
      <AdminNavbar />
      <PageTransition>
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-700">
                Supervision réseau
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Dashboard admin
              </h1>
              <p className="mt-2 text-slate-500">
                L’état des bornes en un coup d’œil.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 sm:self-auto">
              <Radio
                className={`size-4 ${isConnected ? 'text-emerald-600' : 'text-red-500'}`}
                aria-hidden="true"
              />
              <span>{isConnected ? 'Temps réel actif' : 'Reconnexion...'}</span>
            </div>
          </header>
          {bornes.length === 0 ? (
            <Skeleton className="h-36" />
          ) : (
            <StatsSummaryCards summary={summary} />
          )}
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity
                  className="size-5 text-emerald-600"
                  aria-hidden="true"
                />
                <h2 className="text-xl font-semibold text-slate-900">
                  Bornes en direct
                </h2>
              </div>
              {bornes.length === 0 ? (
                <Skeleton className="h-64" />
              ) : (
                <BornesGrid bornes={bornes} />
              )}
            </section>
            <aside>
              <AlertesPanel bornes={bornes} />
            </aside>
          </div>
        </div>
      </main>
      </PageTransition>
    </>
  );
}
