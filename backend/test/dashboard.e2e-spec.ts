import { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, it } from '@jest/globals';
import request from 'supertest';
import { createE2eApp, registerAndLogin } from './e2e-test.utils';

describe('Dashboard (e2e)', () => {
  let app: INestApplication;
  let clientToken: string;

  beforeAll(async () => {
    app = await createE2eApp();
    clientToken = (await registerAndLogin(app, `dashboard-${Date.now()}@example.com`)).token;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('is restricted to administrators', async () => {
    await request(app.getHttpServer())
      .get('/dashboard/stats/revenue')
      .set('Authorization', `Bearer ${clientToken}`)
      .expect(403);
  });

  it('requires a JWT on statistics endpoints', async () => {
    await request(app.getHttpServer())
      .get('/dashboard/stats/sessions')
      .expect(401);
  });
});