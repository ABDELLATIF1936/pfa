import { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { createE2eApp, registerAndLogin } from './e2e-test.utils';

describe('Sessions (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    app = await createE2eApp();
    token = (await registerAndLogin(app, `sessions-${Date.now()}@example.com`)).token;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('rejects an unknown QR borne', async () => {
    await request(app.getHttpServer())
      .post('/sessions/start-qr')
      .set('Authorization', `Bearer ${token}`)
      .send({ identifiantBorne: `UNKNOWN-${Date.now()}` })
      .expect(404);
  });

  it('requires authentication for the QR start endpoint', async () => {
    await request(app.getHttpServer())
      .post('/sessions/start-qr')
      .send({ identifiantBorne: 'BORNE-TEST' })
      .expect(401);
  });
});