import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as ort from 'onnxruntime-node';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MLModelProvider implements OnModuleInit {
  private session: ort.InferenceSession | null = null;
  private readonly logger = new Logger(MLModelProvider.name);

  async onModuleInit() {
    try {
      const modelPath = path.join(process.cwd(), 'models/als_recommender.onnx');
      if (!fs.existsSync(modelPath)) {
        this.logger.warn(
          `ONNX model not found at ${modelPath}. ML recommendations disabled.`,
        );
        return;
      }
      const modelBuffer = fs.readFileSync(modelPath);
      this.session = await ort.InferenceSession.create(modelBuffer);
      this.logger.log('ONNX recommendation model loaded successfully.');
    } catch (error) {
      this.logger.error(
        `Failed to load ONNX model: ${error?.message ?? error}`,
      );
      this.session = null;
    }
  }

  getSession(): ort.InferenceSession | null {
    if (!this.session) {
      this.logger.warn(
        'ONNX session not initialized. Falling back to empty recommendations.',
      );
      return null;
    }
    return this.session;
  }
}
