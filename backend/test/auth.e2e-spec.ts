import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2eApp, removeTestUser } from './e2e-test.utils';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  const email = `auth-${Date.now()}@example.com`;
  const password = 'P@ssword123';

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    if (app) {
      await removeTestUser(app, email);
      await app.close();
    }
  });

  it('registers and logs in a client', async () => {
    const registration = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ nom: 'Test', prenom: 'Client', email, motDePasse: password })
      .expect(201);

    expect(registration.body.access_token).toEqual(expect.any(String));
    expect(registration.body.user.email).toBe(email);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, motDePasse: password })
      .expect(201);
    expect(login.body.access_token).toEqual(expect.any(String));
  });

  it('rejects a duplicate email and an invalid password', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ nom: 'Other', prenom: 'Client', email, motDePasse: password })
      .expect(409);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, motDePasse: 'wrong-password' })
      .expect(401);
  });
});