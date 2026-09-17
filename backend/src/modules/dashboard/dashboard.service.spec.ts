import { DashboardService } from './dashboard.service';
import { StatutBorne } from '../bornes/enums/statut-borne.enum';
import {
  StatutPaiementFacture,
} from '../facturation/entities/facture.entity';
import { StatutSessionRecharge } from '../sessions/entities/session-recharge.entity';

function queryBuilder(rawOne: unknown = undefined, rawMany: unknown[] = []) {
  const builder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    setParameters: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue(rawOne),
    getRawMany: jest.fn().mockResolvedValue(rawMany),
  };
  return builder;
}

describe('DashboardService statistics', () => {
  function makeService() {
    const borneRepository = { find: jest.fn(), createQueryBuilder: jest.fn() };
    const sessionRepository = { find: jest.fn(), createQueryBuilder: jest.fn() };
    const factureRepository = { createQueryBuilder: jest.fn() };
    const siteRepository = { createQueryBuilder: jest.fn() };
    const bornesService = { getStatusOverview: jest.fn() };

    const service = new DashboardService(
      bornesService as any,
      borneRepository as any,
      sessionRepository as any,
      factureRepository as any,
      siteRepository as any,
    );

    return { service, borneRepository, sessionRepository, factureRepository, siteRepository, bornesService };
  }

  it('returns zero values when revenue has no paid invoices', async () => {
    const { service, factureRepository } = makeService();
    const builder = queryBuilder({ revenue: '0', nombreFactures: '0' });
    factureRepository.createQueryBuilder.mockReturnValue(builder);

    await expect(service.getRevenue({})).resolves.toEqual({
      revenue: 0,
      nombreFactures: 0,
      periode: { dateDebut: null, dateFin: null },
    });
    expect(builder.where).toHaveBeenCalledWith(
      'facture.statutPaiement = :statut',
      { statut: StatutPaiementFacture.PAYEE },
    );
  });

  it('applies the site filter to revenue statistics', async () => {
    const { service, factureRepository } = makeService();
    const builder = queryBuilder({ revenue: '125.50', nombreFactures: '2' });
    factureRepository.createQueryBuilder.mockReturnValue(builder);

    await service.getRevenue({ siteId: 'site-1' });

    expect(builder.andWhere).toHaveBeenCalledWith(
      'borne.site_id = :siteId',
      { siteId: 'site-1' },
    );
  });

  it('returns SQL-calculated session averages and status distribution', async () => {
    const { service, sessionRepository } = makeService();
    const builder = queryBuilder({
      nombreSessions: '3',
      dureeMoyenneMinutes: '42.5',
      energieMoyenneKwh: '8.25',
      terminee: '2',
      interrompue: '1',
      enPanne: '0',
    });
    sessionRepository.createQueryBuilder.mockReturnValue(builder);

    await expect(
      service.getSessionsStats({ dateDebut: '2026-01-01T00:00:00.000Z' }),
    ).resolves.toEqual({
      nombreSessions: 3,
      dureeMoyenneMinutes: 42.5,
      energieMoyenneKwh: 8.25,
      repartitionParStatut: { terminee: 2, interrompue: 1, en_panne: 0 },
    });
    expect(builder.where).toHaveBeenCalledWith(
      'session.statut <> :enCours',
      { enCours: StatutSessionRecharge.EN_COURS },
    );
  });

  it('returns an empty top-sites list when there is no session data', async () => {
    const { service, siteRepository } = makeService();
    const builder = queryBuilder(undefined, []);
    siteRepository.createQueryBuilder.mockReturnValue(builder);

    await expect(service.getTopSites({ limit: 5 })).resolves.toEqual([]);
    expect(builder.limit).toHaveBeenCalledWith(5);
  });

  it('maps the existing borne status aggregation to the dashboard contract', async () => {
    const { service, bornesService } = makeService();
    bornesService.getStatusOverview.mockResolvedValue({
      totalBornes: 7,
      parStatut: {
        [StatutBorne.DISPONIBLE]: 2,
        [StatutBorne.EN_CHARGE]: 1,
        [StatutBorne.EN_PANNE]: 3,
        [StatutBorne.HORS_SERVICE]: 1,
      },
    });

    await expect(service.getBornesStatus()).resolves.toEqual({
      disponible: 2,
      en_charge: 1,
      en_panne: 3,
      hors_service: 1,
      total: 7,
    });
  });
});
