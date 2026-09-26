import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

const isProduction = process.env.NODE_ENV === 'production';

const baseOptions = process.env.DATABASE_URL
  ? {
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '1111',
      database: process.env.DB_NAME || 'ev_charging_platform',
    };

export const typeOrmConfigOptions: DataSourceOptions = {
  type: 'postgres',
  ...baseOptions,
  entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],
  migrations: [
    __dirname + '/../database/migrations/*{.ts,.js}',
    __dirname + '/../modules/**/migration/*{.ts,.js}',
  ],
  synchronize: false,
  logging: !isProduction,
} as DataSourceOptions;

const dataSource = new DataSource(typeOrmConfigOptions);
export default dataSource;