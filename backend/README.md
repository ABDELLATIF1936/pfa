# EV Charging Platform API

Backend NestJS de gestion d'une plateforme de recharge de vehicules electriques. L'API gere les utilisateurs, cartes RFID, sites, bornes, sessions OCPP-J 1.6, tarification, facturation, fidelite et tableaux de bord.

## Architecture

- **NestJS + TypeScript** : modules, controllers, services, guards et DTOs.
- **TypeORM + PostgreSQL** : persistance relationnelle et migrations.
- **JWT + roles** : authentification client/administrateur.
- **OCPP-J 1.6** : supervision des bornes via le serveur OCPP integre.
- **Swagger** : documentation interactive sur `/api/docs`.

```text
Client Web/Mobile -> API REST NestJS -> Services metier -> PostgreSQL
                             |
                             +--> OCPP Server <--> Borne / simulateur
                             |
                             +--> Facturation -> Wallet / fidelite -> PDF
```

## Prerequis

- Node.js 20 ou plus recent
- npm 10 ou plus recent
- PostgreSQL 14 ou plus recent
- Une base PostgreSQL accessible par le backend

## Installation

```bash
cd backend
npm install
copy .env.example .env
```

Variables d'environnement :

| Variable                 | Description                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `DB_HOST`                | Hote PostgreSQL, par defaut `localhost`.                                                               |
| `DB_PORT`                | Port PostgreSQL, par defaut `5432`.                                                                    |
| `DB_USER`                | Utilisateur PostgreSQL.                                                                                |
| `DB_PASSWORD`            | Mot de passe PostgreSQL.                                                                               |
| `DB_NAME`                | Nom de la base.                                                                                        |
| `DATABASE_URL`           | URL PostgreSQL alternative pour un deploiement ; la configuration TypeORM utilise actuellement `DB_*`. |
| `JWT_SECRET`             | Secret long et aleatoire pour signer les tokens JWT.                                                   |
| `PORT`                   | Port HTTP, par defaut `3000`.                                                                          |
| `FRONTEND_URL`           | Origines CORS autorisees, separees par des virgules.                                                   |
| `OCPP_PORT`              | Port WebSocket OCPP, par defaut `3001`.                                                                |
| `STRIPE_SECRET_KEY`      | Optionnel, cle Stripe de test si le provider carte est active.                                         |
| `STRIPE_PUBLISHABLE_KEY` | Optionnel, cle Stripe publique de test.                                                                |
| `STRIPE_WEBHOOK_SECRET`  | Optionnel, secret de verification des webhooks Stripe.                                                 |

Ne jamais committer `.env` ni de vrais secrets.

## Base de donnees

```bash
npm run migration:run
npm run migration:revert
```

## Lancement

```bash
npm run start:dev
npm run build
npm run start:prod
npm run simulator
```

Le simulateur OCPP utilise `OCPP_PORT` pour tester les notifications et transactions de recharge.

## Tests

```bash
npm test
npm run test:cov
npm run test:e2e
```

Les tests e2e utilisent `AppModule`, PostgreSQL et un mock de la couche WebSocket OCPP pour isoler les scénarios HTTP.

## Swagger

- Swagger UI : http://localhost:3000/api/docs
- Schema OpenAPI : http://localhost:3000/api/docs-json

Utiliser **Authorize** avec `Bearer <jwt>`. La collection Postman est disponible dans [docs/postman_collection.json](docs/postman_collection.json).

## Collection Postman

Importer [docs/postman_collection.json](docs/postman_collection.json), puis renseigner `baseUrl` et `jwt_token`. Les dossiers couvrent Auth, Users, CarteRfid, Sites, Bornes, Sessions, Factures, Tarification, Vehicules, Fidelite, Wallet et Dashboard.

Le dossier Wallet est informatif : aucun controller Wallet public n'est expose dans la version actuelle ; le debit wallet est applique automatiquement lors de la facturation.

## Comptes de test

Aucun seed de comptes par defaut n'est present. Creer un client via `/auth/register`. Les routes administrateur necessitent une fixture ou un compte administrateur cree par le workflow de gestion des utilisateurs.

## Securite API

- `ValidationPipe` global avec `whitelist`, `forbidNonWhitelisted` et transformation.
- JWT et roles administrateur sur les routes protegees.
- Rate limiting global de 100 requetes/minute, 3 inscriptions/minute et 5 connexions/minute.
- CORS limite aux origines de `FRONTEND_URL`.
- Les erreurs SQL internes ne sont pas exposees aux clients.
