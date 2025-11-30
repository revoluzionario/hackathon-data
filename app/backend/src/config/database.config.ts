import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASS ?? process.env.DB_PASSWORD ?? 'password',
  database: process.env.DB_NAME ?? 'ecommerce',
  synchronize: false,
  migrationsRun: true,
  ssl: (process.env.DB_SSL ?? 'false') === 'true',
}));
