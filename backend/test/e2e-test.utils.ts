import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { OcppServerService } from '../src/modules/ocpp/ocpp-server.service';
import { Personne } from '../src/modules/users/entities/personne.entity';

jest.setTimeout(30000);

export async function createE2eApp(): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(OcppServerService)
    .useValue({
      sendRemoteStartTransaction: jest.fn().mockResolvedValue({
        accepted: true,
        transactionId: 1,
      }),
    })
    .compile();
  const app = moduleFixture.createNestApplication();
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));
  await app.init();
  return app;
}

export async function registerAndLogin(app: INestApplication, email: string) {
  const password = 'P@ssword123';
  await request(app.getHttpServer())
    .post('/auth/register')
    .send({ nom: 'Test', prenom: 'Client', email, motDePasse: password })
    .expect(201);

  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, motDePasse: password })
    .expect(201);

  return { token: response.body.access_token, password };
}

export async function removeTestUser(app: INestApplication, email: string) {
  await app.get(DataSource).getRepository(Personne).delete({ email });
}