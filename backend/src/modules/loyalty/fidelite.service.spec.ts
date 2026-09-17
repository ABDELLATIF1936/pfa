import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FideliteService } from './fidelite.service';
import { CompteFidelite } from './entities/compte-fidelite.entity';
import { NiveauFidelite } from './entities/niveau-fidelite.entity';
import { Recompense } from './entities/recompense.entity';
import { HistoriquePointsFidelite } from './entities/historique-points-fidelite.entity';

describe('FideliteService', () => {
  function makeService() {
    const compteRepo = {
      findOne: jest.fn(),
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        setLock: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
      })),
      manager: {
        transaction: jest.fn(async (handler) =>
          handler({
            getRepository: (entity) => {
              if (entity.name === 'CompteFidelite') return compteRepo;
              if (entity.name === 'Recompense') return recompenseRepo;
              if (entity.name === 'HistoriquePointsFidelite') return historiqueRepo;
              return { save: jest.fn(), create: jest.fn() };
            },
          }),
        ),
      },
    };
    const niveauRepo = {
      find: jest.fn(),
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
    };
    const recompenseRepo = {
      findOne: jest.fn(),
      save: jest.fn(async (value) => value),
    };
    const historiqueRepo = {
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      findAndCount: jest.fn(),
    };

    const service = new FideliteService(
      compteRepo as any,
      niveauRepo as any,
      recompenseRepo as any,
      historiqueRepo as any,
    );

    return { service, compteRepo, niveauRepo, recompenseRepo, historiqueRepo };
  }

  it('calculates loyalty points as floor(amount / 10)', async () => {
    const { service, compteRepo, niveauRepo, historiqueRepo } = makeService();
    const facture = { id: 'facture-1', montantTotal: 125.99 } as any;
    compteRepo.findOne.mockResolvedValue({ id: 'compte-1', points: 10, clientId: 'client-1', niveauActuelId: null });
    niveauRepo.find.mockResolvedValue([{ id: 'bronze', seuilPoints: 0 }]);

    await service.ajouterPoints('client-1', facture);

    expect(compteRepo.save).toHaveBeenCalledWith(expect.objectContaining({ points: 22 }));
    expect(historiqueRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'gain',
        points: 12,
        factureId: 'facture-1',
      }),
    );
  });

  it('recalculates level when threshold is crossed', async () => {
    const { service, compteRepo, niveauRepo } = makeService();
    const compte = { id: 'compte-1', clientId: 'client-1', points: 600, niveauActuelId: null } as CompteFidelite;
    niveauRepo.find.mockResolvedValue([{ id: 'bronze', seuilPoints: 0 }, { id: 'argent', seuilPoints: 500 }, { id: 'gold', seuilPoints: 2000 }]);
    compteRepo.findOne.mockResolvedValue(compte);

    await service.recalculerNiveau(compte);

    expect(compte.niveauActuelId).toBe('argent');
    expect(compteRepo.save).toHaveBeenCalledWith(expect.objectContaining({ niveauActuelId: 'argent' }));
  });

  it('does not downgrade the level after spending points', async () => {
    const { service, compteRepo, niveauRepo } = makeService();
    const compte = { id: 'compte-1', clientId: 'client-1', points: 300, niveauActuelId: 'argent' } as CompteFidelite;
    niveauRepo.find.mockResolvedValue([{ id: 'bronze', seuilPoints: 0 }, { id: 'argent', seuilPoints: 500 }]);
    compteRepo.createQueryBuilder.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      setLock: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(compte),
    });

    await service.recalculerNiveau(compte);

    expect(compte.niveauActuelId).toBe('argent');
  });

  it('rejects reward exchange when points are insufficient', async () => {
    const { service, compteRepo, recompenseRepo } = makeService();
    const compte = { id: 'compte-1', clientId: 'client-1', points: 100 } as CompteFidelite;
    recompenseRepo.findOne.mockResolvedValue({ id: 'reward-1', coutPoints: 150, actif: true } as Recompense);
    compteRepo.createQueryBuilder.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      setLock: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(compte),
    });
    await expect(service.echangerPoints('client-1', 'reward-1')).rejects.toThrow('pointsInsuffisants');
  });

  it('allows reward exchange when points are sufficient', async () => {
    const { service, compteRepo, recompenseRepo } = makeService();
    const compte = { id: 'compte-1', clientId: 'client-1', points: 400 } as CompteFidelite;
    recompenseRepo.findOne.mockResolvedValue({ id: 'reward-1', coutPoints: 200, actif: true, nom: 'Bonus' } as Recompense);
    compteRepo.createQueryBuilder.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      setLock: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(compte),
    });

    const result = await service.echangerPoints('client-1', 'reward-1');
    expect(result.compteFidelite.points).toBe(200);
    expect(result.recompense.id).toBe('reward-1');
  });
});
