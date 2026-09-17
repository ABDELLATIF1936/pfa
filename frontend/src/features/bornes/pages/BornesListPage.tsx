import { Eye, Plus, QrCode } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { createBorne, getBornes } from '@/api/endpoints/bornes';
import { AdminNavbar } from '@/features/dashboard/components/AdminNavbar';
import { getSites } from '@/api/endpoints/sites';
import { BorneForm } from '@/features/bornes/components/BorneForm';
import { QrCodeDisplay } from '@/features/bornes/components/QrCodeDisplay';
import { StatutBadge } from '@/features/bornes/components/StatutBadge';
import { StatutChangeMenu } from '@/features/bornes/components/StatutChangeMenu';
import type { Borne, StatutBorne } from '@/features/bornes/types/borne.types';
import { ROUTES } from '@/routes/routes.config';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { Modal } from '@/shared/components/Modal';
import { Skeleton } from '@/shared/components/Skeleton';
import type { Site } from '@/features/sites/types/site.types';

const statuses: StatutBorne[] = [
  'disponible',
  'en_charge',
  'hors_service',
  'en_panne',
  'maintenance',
];

export function BornesListPage() {
  const [bornes, setBornes] = useState<Borne[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [siteFilter, setSiteFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [qrBorne, setQrBorne] = useState<Borne>();
  const [createdBorne, setCreatedBorne] = useState<Borne>();
  const [creationMessage, setCreationMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void getSites()
      .then(setSites)
      .catch(() => toast.error('Impossible de charger les sites.'));
  }, []);
  useEffect(() => {
    const loadBornes = async () => {
      try {
        setBornes(
          await getBornes({
            siteId: siteFilter || undefined,
            statut: (statusFilter || undefined) as StatutBorne | undefined,
          }),
        );
      } catch {
        toast.error('Impossible de charger les bornes.');
      } finally {
        setIsLoading(false);
      }
    };
    void loadBornes();
  }, [siteFilter, statusFilter]);

  const handleCreate = async (payload: {
    typeBorne: 'AC' | 'DC';
    puissance: number;
    siteId: string;
  }) => {
    setIsSaving(true);
    try {
      const created = await createBorne(payload);
      const createdWithSite = {
        ...created,
        site: sites.find((site) => site.id === payload.siteId) ?? created.site,
      };
      setBornes((current) => [createdWithSite, ...current]);
      setFormOpen(false);
      setCreatedBorne(createdWithSite);
      setSiteFilter('');
      setStatusFilter('');
      setCreationMessage(`La borne ${created.identifiantUnique} a été créée avec succès.`);
      toast.success('Borne créée.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      toast.error('Impossible de créer la borne.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateBorne = (updated: Borne) =>
    setBornes((current) =>
      current.map((borne) => (borne.id === updated.id ? updated : borne)),
    );

  return (
    <>
      <AdminNavbar />
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <Badge>Administration</Badge>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Bornes de recharge
            </h1>
            <p className="mt-2 text-slate-500">
              Suivez l’état et l’installation de chaque borne.
            </p>
          </div>
          <Button
            type="button"
            className="gap-2"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="size-4" aria-hidden="true" /> Ajouter une borne
          </Button>
        </header>
        {creationMessage ? (
          <div
            role="status"
            className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <p>{creationMessage}</p>
            <button
              type="button"
              className="self-start font-semibold text-emerald-700 hover:underline sm:self-auto"
              onClick={() => setCreationMessage('')}
            >
              Fermer
            </button>
          </div>
        ) : null}
        <div className="flex flex-col gap-4 sm:flex-row">
          <label
            className="flex flex-1 flex-col gap-1 text-sm font-medium text-slate-700"
            htmlFor="borne-site-filter"
          >
            Site
            <select
              id="borne-site-filter"
              value={siteFilter}
              onChange={(event) => setSiteFilter(event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 font-normal"
            >
              <option value="">Tous les sites</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.nom}
                </option>
              ))}
            </select>
          </label>
          <label
            className="flex flex-1 flex-col gap-1 text-sm font-medium text-slate-700"
            htmlFor="borne-status-filter"
          >
            Statut
            <select
              id="borne-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 font-normal"
            >
              <option value="">Tous les statuts</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </label>
        </div>
        {isLoading ? (
          <Skeleton className="h-72" />
        ) : bornes.length === 0 ? (
          <EmptyState
            title="Aucune borne trouvée"
            description="Ajoutez une borne ou modifiez les filtres."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Identifiant</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Puissance</th>
                  <th className="px-5 py-4">Site</th>
                  <th className="px-5 py-4">Statut</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bornes.map((borne) => (
                  <tr key={borne.id}>
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-800">
                      {borne.identifiantUnique}
                    </td>
                    <td className="px-5 py-4">{borne.typeBorne}</td>
                    <td className="px-5 py-4">{borne.puissance} kW</td>
                    <td className="px-5 py-4">{borne.site?.nom ?? 'Site indisponible'}</td>
                    <td className="px-5 py-4">
                      <StatutBadge statut={borne.statut} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <StatutChangeMenu
                          borne={borne}
                          onChanged={updateBorne}
                        />
                        <Link
                          to={ROUTES.ADMIN_BORNE_DETAIL.replace(
                            ':id',
                            borne.id,
                          )}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-100"
                        >
                          <Eye className="size-3.5" aria-hidden="true" /> Détail
                        </Link>
                        <Button
                          type="button"
                          variant="secondary"
                          className="gap-1 px-2.5 py-1.5 text-xs"
                          onClick={() => setQrBorne(borne)}
                        >
                          <QrCode className="size-3.5" aria-hidden="true" /> QR
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Ajouter une borne"
      >
        <BorneForm onSubmit={handleCreate} isLoading={isSaving} />
      </Modal>
      <Modal
        open={Boolean(createdBorne)}
        onClose={() => setCreatedBorne(undefined)}
        title="Borne créée"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Le QR code est prêt à être imprimé et posé sur la borne.
          </p>
          {createdBorne ? <QrCodeDisplay borne={createdBorne} /> : null}
        </div>
      </Modal>
      <Modal
        open={Boolean(qrBorne)}
        onClose={() => setQrBorne(undefined)}
        title="QR code de la borne"
      >
        {qrBorne ? <QrCodeDisplay borne={qrBorne} /> : null}
      </Modal>
      </main>
    </>
  );
}
