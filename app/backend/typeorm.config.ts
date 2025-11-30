import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import * as path from 'path';

config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });

const sslEnabled = (process.env.DB_SSL ?? 'false') === 'true';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASS ?? process.env.DB_PASSWORD ?? 'password',
  database: process.env.DB_NAME ?? 'ecommerce',
  synchronize: false,
  migrationsRun: true,
  entities: [path.join(__dirname, '**', '*.entity.js')],
  migrations: [path.join(__dirname, 'migrations', '*.js')],
  ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
});

export default dataSource;
