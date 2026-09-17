import { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { createE2eApp, registerAndLogin } from './e2e-test.utils';

describe('Fidelite (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    app = await createE2eApp();
    token = (await registerAndLogin(app, `loyalty-${Date.now()}@example.com`)).token;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('returns the authenticated client loyalty account', async () => {
    await request(app.getHttpServer())
      .get('/fidelite/mon-compte')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => expect(body).toEqual(expect.objectContaining({
        points: expect.any(Number),
      })));
  });

  it('rejects an exchange for an unknown reward', async () => {
    await request(app.getHttpServer())
      .post('/fidelite/echanger')
      .set('Authorization', `Bearer ${token}`)
      .send({ recompenseId: '00000000-0000-0000-0000-000000000000' })
      .expect(404);
  });
});