import { postToApi } from "@/lib/api";

export interface AddToCartPayload {
  productId: number;
  quantity: number;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export async function addToCart(payload: AddToCartPayload) {
  return postToApi<{ success: boolean } | undefined>("/cart/add", payload);
}
