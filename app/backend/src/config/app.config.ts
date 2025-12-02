import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: Number(process.env.PORT ?? 3000),
  logLevel: (process.env.LOG_LEVEL ?? 'debug')
    .split(',')
    .map((level) => level.trim()),
  nodeEnv: process.env.NODE_ENV ?? 'development',
}));
