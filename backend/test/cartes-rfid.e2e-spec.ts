import { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { createE2eApp, registerAndLogin } from './e2e-test.utils';

describe('Cartes RFID (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    app = await createE2eApp();
    token = (await registerAndLogin(app, `rfid-${Date.now()}@example.com`)).token;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('creates, lists, reads, blocks and deletes a card', async () => {
    const created = await request(app.getHttpServer())
      .post('/cartes-rfid')
      .set('Authorization', `Bearer ${token}`)
      .send({ identifiantUnique: `TEST-RFID-${Date.now()}` })
      .expect(201);
    const id = created.body.id;

    await request(app.getHttpServer())
      .get('/cartes-rfid')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((response) => expect(response.body).toEqual(expect.arrayContaining([
        expect.objectContaining({ id }),
      ])));

    await request(app.getHttpServer())
      .patch(`/cartes-rfid/${id}/bloquer`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => expect(body.statut).toBe('bloquee'));

    await request(app.getHttpServer())
      .get(`/cartes-rfid/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => expect(body.statut).toBe('bloquee'));

    await request(app.getHttpServer())
      .delete(`/cartes-rfid/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});