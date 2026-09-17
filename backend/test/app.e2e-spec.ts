import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2eApp } from './e2e-test.utils';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createE2eApp();
  });

  it('/ (GET) is not exposed', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(404);
  });

  it.each([
    ['GET', '/sessions'],
    ['GET', '/sessions/00000000-0000-0000-0000-000000000000'],
    ['GET', '/sessions/00000000-0000-0000-0000-000000000000/status'],
    ['POST', '/sessions/start-qr'],
    ['GET', '/vehicules'],
    ['GET', '/vehicules/00000000-0000-0000-0000-000000000000'],
    ['POST', '/vehicules'],
    ['PATCH', '/vehicules/00000000-0000-0000-0000-000000000000'],
    ['DELETE', '/vehicules/00000000-0000-0000-0000-000000000000'],
  ])('%s %s requires JWT authentication', (method, path) => {
    return (request(app.getHttpServer()) as any)
      [method.toLowerCase()](path)
      .expect(401);
  });

  afterEach(async () => {
    if (app) await app.close();
  });
});
