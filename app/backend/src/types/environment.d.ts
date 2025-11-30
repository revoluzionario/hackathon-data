declare namespace NodeJS {
  interface ProcessEnv {
    FABRIC_EVENTSTREAM_URL: string;
    FABRIC_EVENTSTREAM_API_KEY: string;
    FABRIC_KQL_ENDPOINT: string;
    FABRIC_KQL_API_KEY: string;
    FABRIC_SQL_ENDPOINT: string;
    FABRIC_SQL_API_KEY: string;
    STRIPE_SECRET_KEY: string;
    STRIPE_PUBLIC_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
  }
}
