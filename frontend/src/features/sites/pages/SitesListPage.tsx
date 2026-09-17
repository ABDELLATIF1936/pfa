import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import {
  createSite,
  deleteSite,
  getSites,
  updateSite,
} from '@/api/endpoints/sites';
import { AdminNavbar } from '@/features/dashboard/components/AdminNavbar';
import { SiteCard } from '@/features/sites/components/SiteCard';
import { SiteForm } from '@/features/sites/components/SiteForm';
import type { Site } from '@/features/sites/types/site.types';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { Input } from '@/shared/components/Input';
import { Modal } from '@/shared/components/Modal';
import { Skeleton } from '@/shared/components/Skeleton';

export function SitesListPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site>();
  const [deletingSite, setDeletingSite] = useState<Site>();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getSites()
      .then((data) => {
        if (!cancelled) setSites(data);
      })
      .catch(() => toast.error('Impossible de charger les sites.'))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSites = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    if (!normalizedSearch) return sites;
    return sites.filter(
      (site) =>
        site.ville.toLocaleLowerCase().includes(normalizedSearch) ||
        site.nom.toLocaleLowerCase().includes(normalizedSearch),
    );
  }, [search, sites]);

  const closeForm = () => {
    setFormOpen(false);
    setEditingSite(undefined);
  };
  const openCreate = () => {
    setEditingSite(undefined);
    setFormOpen(true);
  };
  const openEdit = (site: Site) => {
    setEditingSite(site);
    setFormOpen(true);
  };

  const handleSubmit = async (payload: Omit<Site, 'id'>) => {
    setIsSaving(true);
    try {
      if (editingSite) {
        const updated = await updateSite(editingSite.id, payload);
        setSites((current) =>
          current.map((site) => (site.id === updated.id ? updated : site)),
        );
        toast.success('Site modifié.');
      } else {
        const created = await createSite(payload);
        setSites((current) => [...current, created]);
        toast.success('Site créé.');
      }
      closeForm();
    } catch {
      toast.error('Impossible d’enregistrer ce site.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSite) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteSite(deletingSite.id);
      setSites((current) =>
        current.filter((site) => site.id !== deletingSite.id),
      );
      setDeletingSite(undefined);
      toast.success('Site supprimé.');
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setDeleteError(
          'Impossible de supprimer ce site : il contient encore des bornes actives. Réaffectez ou supprimez d’abord ces bornes.',
        );
      } else {
        setDeleteError('Impossible de supprimer ce site pour le moment.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <Badge>Administration</Badge>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Sites de recharge
            </h1>
            <p className="mt-2 text-slate-500">
              Gérez les emplacements et leurs coordonnées.
            </p>
          </div>
          <Button type="button" className="gap-2" onClick={openCreate}>
            <Plus className="size-4" aria-hidden="true" /> Ajouter un site
          </Button>
        </header>
        <div className="max-w-md">
          <Input
            id="site-search"
            label="Rechercher par nom ou ville"
            placeholder="Ex. Paris"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-[390px]" />
            ))}
          </div>
        ) : filteredSites.length === 0 ? (
          <EmptyState
            title={
              sites.length === 0 ? 'Aucun site enregistré' : 'Aucun site trouvé'
            }
            description={
              sites.length === 0
                ? 'Ajoutez votre premier site de recharge.'
                : 'Modifiez votre recherche pour retrouver un site.'
            }
            action={
              sites.length === 0 ? (
                <Button type="button" onClick={openCreate}>
                  Ajouter un site
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredSites.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                onEdit={openEdit}
                onDelete={(selected) => {
                  setDeleteError('');
                  setDeletingSite(selected);
                }}
              />
            ))}
          </div>
        )}
      </div>
      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editingSite ? 'Modifier le site' : 'Ajouter un site'}
      >
        <SiteForm
          initialData={editingSite}
          onSubmit={handleSubmit}
          isLoading={isSaving}
        />
      </Modal>
      <Modal
        open={Boolean(deletingSite)}
        onClose={() => setDeletingSite(undefined)}
        title="Supprimer le site"
      >
        <div className="space-y-5">
          <p className="text-sm text-slate-600">
            Voulez-vous vraiment supprimer <strong>{deletingSite?.nom}</strong>{' '}
            ? Cette action est irréversible.
          </p>
          {deleteError ? (
            <p
              className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              role="alert"
            >
              {deleteError}
            </p>
          ) : null}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeletingSite(undefined)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              className="gap-2 bg-red-600 hover:bg-red-700"
              isLoading={isDeleting}
              onClick={handleDelete}
            >
              <Trash2 className="size-4" aria-hidden="true" /> Supprimer
            </Button>
          </div>
        </div>
      </Modal>
      </main>
    </>
  );
}
