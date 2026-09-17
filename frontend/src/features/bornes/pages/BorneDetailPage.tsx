import { ArrowLeft, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { getBorneById } from '@/api/endpoints/bornes';
import api from '@/api/client';
import { AdminNavbar } from '@/features/dashboard/components/AdminNavbar';
import { QrCodeDisplay } from '@/features/bornes/components/QrCodeDisplay';
import { StatutBadge } from '@/features/bornes/components/StatutBadge';
import { StatutChangeMenu } from '@/features/bornes/components/StatutChangeMenu';
import type { Borne } from '@/features/bornes/types/borne.types';
import { ROUTES } from '@/routes/routes.config';
import { Card } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { Skeleton } from '@/shared/components/Skeleton';

interface Session {
  id: string;
  borneId: string;
  dateDebut: string;
  dateFin?: string | null;
  energieConsommee: number;
  statut: string;
  client?: { nom?: string; prenom?: string };
}

export function BorneDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [borne, setBorne] = useState<Borne>();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([getBorneById(id), api.get<Session[]>('/sessions')])
      .then(([borneResponse, sessionResponse]) => {
        setBorne(borneResponse);
        setSessions(
          sessionResponse.data.filter((session) => session.borneId === id),
        );
      })
      .catch(() => toast.error('Impossible de charger le détail de la borne.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading)
    return (
      <>
        <AdminNavbar />
        <main className="min-h-screen bg-slate-50 p-8">
        <Skeleton className="mx-auto h-96 max-w-7xl" />
        </main>
      </>
    );
  if (!borne)
    return (
      <>
        <AdminNavbar />
        <main className="min-h-screen bg-slate-50 p-8">
        <EmptyState title="Borne introuvable" />
        </main>
      </>
    );

  return (
    <>
      <AdminNavbar />
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <Link
          to={ROUTES.ADMIN_BORNES}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Retour aux bornes
        </Link>
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {borne.identifiantUnique}
          </h1>
          <p className="mt-2 text-slate-500">
            Détail et historique de la borne.
          </p>
        </header>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Informations
              </h2>
              <StatutBadge statut={borne.statut} />
            </div>
            <dl className="grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase text-slate-500">Type</dt>
                <dd className="mt-1 font-medium">{borne.typeBorne}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">Puissance</dt>
                <dd className="mt-1 font-medium">{borne.puissance} kW</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">Site</dt>
                <dd className="mt-1 flex items-center gap-1 font-medium">
                  <MapPin
                    className="size-4 text-emerald-600"
                    aria-hidden="true"
                  />
                  {borne.site.nom}, {borne.site.ville}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">Statut</dt>
                <dd className="mt-1">
                  <StatutChangeMenu borne={borne} onChanged={setBorne} />
                </dd>
              </div>
            </dl>
          </Card>
          <QrCodeDisplay borne={borne} />
        </div>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Historique des sessions
          </h2>
          {sessions.length === 0 ? (
            <EmptyState
              title="Aucune session historique"
              description="Cette borne n’a encore aucune session enregistrée."
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Début</th>
                    <th className="px-5 py-4">Fin</th>
                    <th className="px-5 py-4">Client</th>
                    <th className="px-5 py-4">Énergie</th>
                    <th className="px-5 py-4">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.map((session) => (
                    <tr key={session.id}>
                      <td className="px-5 py-4">
                        {new Date(session.dateDebut).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-5 py-4">
                        {session.dateFin
                          ? new Date(session.dateFin).toLocaleString('fr-FR')
                          : '-'}
                      </td>
                      <td className="px-5 py-4">
                        {session.client
                          ? `${session.client.prenom ?? ''} ${session.client.nom ?? ''}`.trim()
                          : '-'}
                      </td>
                      <td className="px-5 py-4">
                        {session.energieConsommee} kWh
                      </td>
                      <td className="px-5 py-4">{session.statut}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      </main>
    </>
  );
}
