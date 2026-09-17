import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

// Charge les variables d'environnement depuis le fichier .env
config();

export const typeOrmConfigOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1111',
  database: process.env.DB_NAME || 'ev_charging_platform',
  entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],
  migrations: [
    __dirname + '/../database/migrations/*{.ts,.js}',
    __dirname + '/../modules/**/migration/*{.ts,.js}',
  ],
  synchronize: false, // Ne pas utiliser synchronize: true en production ni lors de l'usage des migrations
  logging: true,
};

const dataSource = new DataSource(typeOrmConfigOptions);
export default dataSource;
