import { Injectable } from '@nestjs/common';
import * as ort from 'onnxruntime-node';
import { MLModelProvider } from './model.provider';
import { RecommendationItemDto } from '../dto/recommendation-response.dto';

@Injectable()
export class MLRecommendationService {
  constructor(private readonly modelProvider: MLModelProvider) {}

  async recommendForUser(
    userId: number,
    topK = 10,
  ): Promise<RecommendationItemDto[]> {
    if (!Number.isFinite(userId)) {
      return [];
    }

    const session = this.modelProvider.getSession();
    if (!session) {
      return [];
    }
    const userTensor = this.createUserTensor(userId);

    const feeds: Record<string, ort.Tensor> = {
      userId: userTensor,
    };

    const output = await session.run(feeds);

    const productIds = this.toNumberArray(output.productIds?.data);
    const scores = this.toNumberArray(output.scores?.data);

    const items: RecommendationItemDto[] = [];
    const count = Math.min(topK, productIds.length);
    for (let i = 0; i < count; i++) {
      items.push({ productId: productIds[i], score: scores[i] ?? 0 });
    }

    return items;
  }

  private createUserTensor(userId: number) {
    const id = BigInt(userId);
    return new ort.Tensor('int64', BigInt64Array.from([id]), [1]);
  }

  private toNumberArray(data: unknown): number[] {
    if (!data) {
      return [];
    }

    if (Array.isArray(data)) {
      return data.map((value) => Number(value));
    }

    if (ArrayBuffer.isView(data)) {
      // cast to unknown first to satisfy TS that this conversion is intentional
      return Array.from(data as unknown as ArrayLike<number | bigint>).map(
        (value) => Number(value),
      );
    }

    if (typeof (data as any)[Symbol.iterator] === 'function') {
      return Array.from(data as Iterable<number | bigint>).map((value) =>
        Number(value),
      );
    }

    return [];
  }
}
