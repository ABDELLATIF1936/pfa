import { OcppServerService } from './ocpp-server.service';
import { StatutBorne } from '../bornes/enums/statut-borne.enum';
import {
  SessionRecharge,
  StatutSessionRecharge,
} from '../sessions/entities/session-recharge.entity';

describe('OcppServerService StopTransaction billing', () => {
  function makeService() {
    const ws = { send: jest.fn() };
    const session = {
      id: 'session-1',
      borneId: 'borne-1',
      statut: StatutSessionRecharge.EN_COURS,
      dateDebut: new Date('2026-09-07T10:00:00.000Z'),
      dateFin: null,
      energieConsommee: 5,
    } as unknown as SessionRecharge;
    const sessionsService = {
      findByOcppTransactionId: jest.fn().mockResolvedValue(session),
      cloturer: jest.fn().mockResolvedValue({
        ...session,
        dateFin: new Date('2026-09-07T10:30:00.000Z'),
        statut: StatutSessionRecharge.TERMINEE,
      }),
      updateEnergie: jest.fn(),
      reconcilierSessionsOrphelines: jest.fn(),
    };
    const bornesService = {
      findOne: jest.fn().mockResolvedValue({
        id: 'borne-1',
        statut: StatutBorne.EN_CHARGE,
      }),
      updateStatut: jest.fn(),
    };
    const usersService = {
      findCarteRfidByIdentifiantUnique: jest.fn(),
    };
    const gateway = {
      emitSessionEnded: jest.fn(),
    };
    const facturationService = {
      genererFacture: jest.fn().mockResolvedValue({ montantTotal: 7.25 }),
    };
    const service = new OcppServerService(
      { get: jest.fn() } as any,
      bornesService as any,
      gateway as any,
      usersService as any,
      facturationService as any,
      sessionsService as any,
    );
    return { service, ws, session, sessionsService, bornesService, gateway, facturationService, usersService };
  }

  it('closes, invoices, and emits session:ended on StopTransaction', async () => {
    const { service, ws, session, sessionsService, gateway, facturationService } = makeService();

    await (service as any).handleStopTransaction(
      ws,
      'stop-1',
      { transactionId: 42, timestamp: '2026-09-07T10:30:00.000Z' },
      'BORNE-1',
    );

    expect(sessionsService.cloturer).toHaveBeenCalledWith(
      session.id,
      new Date('2026-09-07T10:30:00.000Z'),
    );
    expect(facturationService.genererFacture).toHaveBeenCalled();
    expect(gateway.emitSessionEnded).toHaveBeenCalledWith({
      sessionId: session.id,
      montant: 7.25,
    });
    expect(JSON.parse(ws.send.mock.calls[0][0])).toEqual([
      3,
      'stop-1',
      { idTagInfo: { status: 'Accepted' } },
    ]);
  });

  it('accepts an unknown transaction without billing failure', async () => {
    const { service, ws, sessionsService, facturationService } = makeService();
    sessionsService.findByOcppTransactionId.mockRejectedValueOnce(
      new Error('Session introuvable'),
    );

    await (service as any).handleStopTransaction(
      ws,
      'stop-unknown',
      { transactionId: 999 },
      'BORNE-1',
    );

    expect(facturationService.genererFacture).not.toHaveBeenCalled();
    expect(JSON.parse(ws.send.mock.calls[0][0])).toEqual([
      3,
      'stop-unknown',
      { idTagInfo: { status: 'Accepted' } },
    ]);
  });

  it('accepts QR idTags during RemoteStart authorization', async () => {
    const { service, ws, usersService } = makeService();
    service.registerQrSessionMetadata('QR_42_123456', { clientId: 'client-42' });
    usersService.findCarteRfidByIdentifiantUnique.mockRejectedValue(new Error('carte introuvable'));

    await (service as any).handleAuthorize(
      ws,
      'auth-qr',
      { idTag: 'QR_42_123456' },
      'BORNE-1',
    );

    expect(usersService.findCarteRfidByIdentifiantUnique).not.toHaveBeenCalled();
    expect(JSON.parse(ws.send.mock.calls[0][0])).toEqual([
      3,
      'auth-qr',
      { idTagInfo: { status: 'Accepted' } },
    ]);
  });
});
