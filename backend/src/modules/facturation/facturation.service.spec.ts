import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FacturationService } from './facturation.service';
import { Facture, StatutPaiementFacture } from './entities/facture.entity';
import { SessionRecharge } from '../sessions/entities/session-recharge.entity';
import { GrilleTarifaire } from '../tarification/entities/grille-tarifaire.entity';

describe('FacturationService', () => {
  const grille = {
    id: 'grille-1',
    prixParKwh: 0.35,
    prixParMinute: 0.1,
  } as GrilleTarifaire;

  async function makeService() {
    const factureRepository = {
      findOne: jest.fn(),
      manager: { query: jest.fn().mockResolvedValue([{ value: '1' }]) },
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
    };
    const tarificationService = {
      getGrilleApplicable: jest.fn().mockResolvedValue(grille),
    };
    const clientRepository = {
      save: jest.fn(async (value) => value),
    };
    const fideliteService = {
      ajouterPoints: jest.fn().mockResolvedValue(undefined),
    };
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: FacturationService,
          useFactory: () => new FacturationService(
            factureRepository as any,
            tarificationService as any,
            clientRepository as any,
            fideliteService as any,
          ),
        },
      ],
    }).compile();

    const service = module.get(FacturationService);

    return {
      module,
      service,
      factureRepository,
      tarificationService,
      clientRepository,
      fideliteService,
    };
  }

  function session(overrides: Partial<SessionRecharge> = {}) {
    return {
      id: 'session-1',
      dateDebut: new Date('2026-09-07T10:00:00.000Z'),
      dateFin: new Date('2026-09-07T11:30:00.000Z'),
      energieConsommee: 10,
      ...overrides,
    } as SessionRecharge;
  }

  it('calculates energy and started-minute charges rounded to two decimals', async () => {
    const { service, tarificationService } = await makeService();

    await expect(service.calculerMontant(session())).resolves.toBe(12.5);
    expect(tarificationService.getGrilleApplicable).toHaveBeenCalledWith(
      new Date('2026-09-07T10:00:00.000Z'),
    );
  });

  it('treats a null minute price as zero', async () => {
    const { service, tarificationService } = await makeService();
    tarificationService.getGrilleApplicable.mockResolvedValue({
      ...grille,
      prixParMinute: null,
    });

    await expect(service.calculerMontant(session())).resolves.toBe(3.5);
  });

  it('rejects an unfinished session', async () => {
    const { service } = await makeService();

    await expect(
      service.calculerMontant(session({ dateFin: null })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('supports zero duration', async () => {
    const { service } = await makeService();
    const start = new Date('2026-09-07T10:00:00.000Z');

    await expect(
      service.calculerMontant(session({ dateDebut: start, dateFin: start })),
    ).resolves.toBe(3.5);
  });

  it('returns the existing invoice and does not duplicate it', async () => {
    const existing = { id: 'facture-1' } as Facture;
    const { service, factureRepository } = await makeService();
    factureRepository.findOne.mockResolvedValue(existing);

    await expect(service.genererFacture(session())).resolves.toBe(existing);
    expect(factureRepository.create).not.toHaveBeenCalled();
  });

  it('generates distinct sequence-backed numbers for concurrent calls', async () => {
    const { service, factureRepository } = await makeService();
    factureRepository.manager.query
      .mockResolvedValueOnce([{ value: '11' }])
      .mockResolvedValueOnce([{ value: '12' }]);

    const numbers = await Promise.all([
      service.genererNumeroFacture(),
      service.genererNumeroFacture(),
    ]);

    expect(new Set(numbers).size).toBe(2);
    expect(numbers).toEqual([
      expect.stringMatching(/^FACT-\d{4}-00011$/),
      expect.stringMatching(/^FACT-\d{4}-00012$/),
    ]);
  });

  it('persists a pending invoice when none exists', async () => {
    const { service, factureRepository } = await makeService();
    factureRepository.findOne.mockResolvedValue(null);

    const result = await service.genererFacture(session());

    expect(result).toMatchObject({
      sessionId: 'session-1',
      montantTotal: 12.5,
      numero: 'FACT-2026-00001',
      grilleTarifaireId: 'grille-1',
      statutPaiement: StatutPaiementFacture.EN_ATTENTE,
    });
    expect(factureRepository.save).toHaveBeenCalled();
  });

  it('auto-debits the wallet when the client uses wallet payment', async () => {
    const { service, factureRepository, clientRepository, fideliteService } = await makeService();
    factureRepository.findOne.mockResolvedValue(null);

    const result = await service.genererFacture(
      session({
        client: {
          id: 'client-1',
          modePaiementDefaut: 'wallet',
          soldeWallet: 50,
        },
      }),
    );

    expect(result.statutPaiement).toBe(StatutPaiementFacture.PAYEE);
    expect(clientRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'client-1',
        soldeWallet: 37.5,
      }),
    );
    expect(fideliteService.ajouterPoints).toHaveBeenCalledWith(
      'client-1',
      expect.objectContaining({ statutPaiement: StatutPaiementFacture.PAYEE }),
    );
  });

  it('keeps a postpaid invoice pending until settlement is processed', async () => {
    const { service, factureRepository, clientRepository, fideliteService } = await makeService();
    factureRepository.findOne.mockResolvedValue(null);

    const result = await service.genererFacture(
      session({
        client: {
          id: 'client-2',
          modePaiementDefaut: 'postpaid',
          soldeWallet: 0,
        },
      }),
    );

    expect(result.statutPaiement).toBe(StatutPaiementFacture.EN_ATTENTE);
    expect(clientRepository.save).not.toHaveBeenCalled();
    expect(fideliteService.ajouterPoints).not.toHaveBeenCalled();
  });

  it('does not award points when the wallet cannot cover the invoice', async () => {
    const { service, factureRepository, fideliteService } = await makeService();
    factureRepository.findOne.mockResolvedValue(null);

    const result = await service.genererFacture(
      session({
        client: {
          id: 'client-3',
          modePaiementDefaut: 'wallet',
          soldeWallet: 1,
        },
      }),
    );

    expect(result.statutPaiement).toBe(StatutPaiementFacture.ECHOUEE);
    expect(fideliteService.ajouterPoints).not.toHaveBeenCalled();
  });
});
