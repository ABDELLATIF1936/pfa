import { SessionsService } from './sessions.service';
import {
  SessionRecharge,
  StatutSessionRecharge,
} from './entities/session-recharge.entity';

function makeSessionRepository() {
  return {
    findOne: jest.fn(),
    save: jest.fn(async (session: SessionRecharge) => session),
  };
}

describe('SessionsService interruption handling', () => {
  it('interromps the active session for a borne and is idempotent', async () => {
    const repository = makeSessionRepository();
    const activeSession = {
      id: 'session-1',
      borneId: 'borne-1',
      statut: StatutSessionRecharge.EN_COURS,
      dateFin: null,
    } as unknown as SessionRecharge;
    repository.findOne
      .mockResolvedValueOnce(activeSession)
      .mockResolvedValueOnce(null);

    const service = new SessionsService(
      repository as any,
      {} as any,
      { updateStatut: jest.fn() } as any,
      {} as any,
    );

    const interrupted = await service.interrompreActiveByBorneId('borne-1');

    expect(interrupted).toMatchObject({
      id: 'session-1',
      statut: StatutSessionRecharge.INTERRUPPUE,
    });
    expect(interrupted?.dateFin).toBeInstanceOf(Date);
    expect(repository.save).toHaveBeenCalledWith(activeSession);
    await expect(
      service.interrompreActiveByBorneId('borne-1'),
    ).resolves.toBeNull();
  });
});
