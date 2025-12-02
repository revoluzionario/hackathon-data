declare namespace NodeJS {
  interface ProcessEnv {
    DATABRICKS_SQL_ENDPOINT: string;
    DATABRICKS_SQL_WAREHOUSE_ID: string;
    DATABRICKS_API_TOKEN: string;
    DATABRICKS_SQL_CATALOG?: string;
    DATABRICKS_SQL_SCHEMA?: string;
    DATABRICKS_SQL_WAIT_TIMEOUT?: string;
    STRIPE_SECRET_KEY: string;
    STRIPE_PUBLIC_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
  }
}
