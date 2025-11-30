import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class KqlQueryService {
  private endpoint = process.env.FABRIC_KQL_ENDPOINT;
  private apiKey = process.env.FABRIC_KQL_API_KEY;

  async query(kql: string) {
    const res = await axios.post(
      this.endpoint,
      { query: kql },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );
    return res.data;
  }
}
