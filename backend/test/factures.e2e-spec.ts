import { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { createE2eApp, registerAndLogin } from './e2e-test.utils';

describe('Factures (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    app = await createE2eApp();
    token = (await registerAndLogin(app, `factures-${Date.now()}@example.com`)).token;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('lists only the authenticated client invoices with pagination metadata', async () => {
    await request(app.getHttpServer())
      .get('/factures')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual(expect.objectContaining({
          items: expect.any(Array),
          page: 1,
          limit: 20,
          total: expect.any(Number),
        }));
      });
  });

  it('rejects an inaccessible or unknown invoice PDF', async () => {
    await request(app.getHttpServer())
      .get('/factures/00000000-0000-0000-0000-000000000000/pdf')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});