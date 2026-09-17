import { UnprocessableEntityException } from '@nestjs/common';
import { TarificationService } from './tarification.service';
import { GrilleTarifaire } from './entities/grille-tarifaire.entity';

describe('TarificationService', () => {
  function serviceWith(grilles: GrilleTarifaire[]) {
    const query = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(grilles[0] ?? null),
    };
    return {
      service: new TarificationService({
        createQueryBuilder: jest.fn().mockReturnValue(query),
      } as any),
      query,
    };
  }

  it('selects the latest active applicable tariff', async () => {
    const latest = { id: 'latest' } as GrilleTarifaire;
    const { service, query } = serviceWith([latest]);

    await expect(service.getGrilleApplicable(new Date('2026-09-01'))).resolves.toBe(latest);
    expect(query.where).toHaveBeenCalledWith('grille.actif = :actif', { actif: true });
    expect(query.andWhere).toHaveBeenCalledWith(
      'grille.date_effective <= :date',
      expect.any(Object),
    );
    expect(query.orderBy).toHaveBeenCalledWith('grille.date_effective', 'DESC');
  });

  it('excludes inactive tariffs through the active predicate', async () => {
    const { service, query } = serviceWith([]);

    await expect(service.getGrilleApplicable(new Date())).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
    expect(query.where).toHaveBeenCalledWith('grille.actif = :actif', { actif: true });
  });

  it('throws explicitly when no tariff is defined', async () => {
    const { service } = serviceWith([]);

    await expect(service.getGrilleApplicable(new Date())).rejects.toThrow(
      'Aucune grille tarifaire active applicable',
    );
  });
});
