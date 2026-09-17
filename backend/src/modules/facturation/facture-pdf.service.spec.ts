import { FacturePdfService } from './facture-pdf.service';
import { Facture, StatutPaiementFacture } from './entities/facture.entity';
import { MethodeAuthSession, StatutSessionRecharge } from '../sessions/entities/session-recharge.entity';

describe('FacturePdfService', () => {
  it('generates a valid PDF buffer from the complete invoice relations', async () => {
    const facture = {
      id: 'facture-1',
      numero: 'FACT-2026-00001',
      montantTotal: 12.5,
      dateEmission: new Date('2026-09-07T12:00:00.000Z'),
      statutPaiement: StatutPaiementFacture.EN_ATTENTE,
      grilleTarifaire: { id: 'grille-1', prixParKwh: 0.35, prixParMinute: 0.1 },
      session: {
        id: 'session-1',
        dateDebut: new Date('2026-09-07T10:00:00.000Z'),
        dateFin: new Date('2026-09-07T11:30:00.000Z'),
        energieConsommee: 10,
        methodeAuth: MethodeAuthSession.RFID,
        client: { nom: 'Doe', prenom: 'Jane', email: 'jane@example.com' },
        borne: {
          identifiantUnique: 'BORNE-1',
          site: { nom: 'Site Centre', adresse: '1 rue Test', ville: 'Rabat' },
        },
        vehicule: null,
      },
    } as unknown as Facture;
    const repository = {
      findOne: jest.fn().mockResolvedValue(facture),
    };
    const service = new FacturePdfService(repository as any);

    const pdf = await service.genererPdf(facture);

    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
  });
});
