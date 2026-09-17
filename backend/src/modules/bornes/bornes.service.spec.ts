import { BornesService } from './bornes.service';
import { StatutBorne } from './enums/statut-borne.enum';

describe('BornesService', () => {
  it('should compute a dashboard status overview', async () => {
    const service = new BornesService(
      {} as any,
      {} as any,
      {} as any,
      { emitStatutChange: jest.fn(), emitStatusOverview: jest.fn() } as any,
    );

    const statusBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { statut: StatutBorne.DISPONIBLE, total: '2' },
        { statut: StatutBorne.EN_CHARGE, total: '1' },
      ]),
    };

    const siteBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      addGroupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { siteId: 'site-1', siteNom: 'Site A', totalBornes: '2', disponibles: '1', enCharge: '1', horsService: '0' },
      ]),
    };

    (service as any).borneRepository = {
      createQueryBuilder: jest
        .fn()
        .mockReturnValueOnce(statusBuilder)
        .mockReturnValueOnce(siteBuilder),
      find: jest.fn().mockResolvedValue([
        { id: 'b1', statut: StatutBorne.DISPONIBLE, site: { id: 'site-1', nom: 'Site A' } },
        { id: 'b2', statut: StatutBorne.EN_CHARGE, site: { id: 'site-1', nom: 'Site A' } },
        { id: 'b3', statut: StatutBorne.DISPONIBLE, site: { id: 'site-2', nom: 'Site B' } },
      ]),
    } as any;

    await expect((service as any).getStatusOverview()).resolves.toMatchObject({
      totalBornes: 3,
      parStatut: {
        disponible: 2,
        en_charge: 1,
        hors_service: 0,
        maintenance: 0,
      },
      parSite: [
        {
          siteId: 'site-1',
          siteNom: 'Site A',
          totalBornes: 2,
          disponibles: 1,
          enCharge: 1,
          horsService: 0,
        },
      ],
    });
  });
});
