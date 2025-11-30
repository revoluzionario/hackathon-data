declare module 'stripe' {
  namespace Stripe {
    interface StripeConfig {
      apiVersion?: LatestApiVersion | '2023-10-16';
    }
  }
}
