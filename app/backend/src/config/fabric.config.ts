import { registerAs } from '@nestjs/config';

export default registerAs('fabric', () => ({
  eventStreamUrl: process.env.FABRIC_EVENTSTREAM_URL ?? '',
  apiKey: process.env.FABRIC_EVENTSTREAM_API_KEY ?? '',
  kqlEndpoint: process.env.FABRIC_KQL_ENDPOINT ?? '',
  kqlApiKey: process.env.FABRIC_KQL_API_KEY ?? '',
}));
