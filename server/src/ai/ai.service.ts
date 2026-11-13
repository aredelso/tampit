import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import type { ExtractedCoffeeData } from '@shared/coffee';

/**
 * Client for the Python AI service (ai-service/). It runs OCR and text extraction
 * there, and this class only forwards requests and maps errors.
 *
 * The base URL comes from AI_SERVICE_URL (e.g. http://ai:8000 in Docker).
 */
@Injectable()
export class AiService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = (
      process.env.AI_SERVICE_URL ?? 'http://localhost:8000'
    ).replace(/\/$/, '');
  }

  async extractCoffeeDataFromImage(
    imagePath: string
  ): Promise<ExtractedCoffeeData> {
    if (!imagePath?.trim()) {
      throw new BadRequestException('Image path is required');
    }

    const absolutePath = path.resolve(imagePath);
    if (!fs.existsSync(absolutePath)) {
      throw new BadRequestException(`Image file not found: ${imagePath}`);
    }

    const form = new FormData();
    form.append(
      'image',
      new Blob([fs.readFileSync(absolutePath)]),
      path.basename(absolutePath)
    );
    return this.post<ExtractedCoffeeData>('/extract-coffee-data', form);
  }

  async extractContactEmailFromWebsite(
    websiteUrl?: string,
    websiteContent?: string
  ): Promise<string | null> {
    if (!websiteUrl && !websiteContent) {
      throw new BadRequestException(
        'Either websiteUrl or websiteContent is required'
      );
    }
    const result = await this.post<{ email: string | null }>('/contact-email', {
      websiteUrl,
      websiteContent,
    });
    return result.email;
  }

  async extractContactEmailByRoasterName(
    roasterName: string
  ): Promise<string | null> {
    if (!roasterName?.trim()) {
      throw new BadRequestException('Roaster name is required');
    }
    const result = await this.post<{ email: string | null }>(
      '/roaster-contact-email',
      { roasterName }
    );
    return result.email;
  }

  /**
   * Sends a request to the AI service. 4xx responses are client errors and are
   * returned to the caller as 400s. Network failures and 5xx responses become 503s.
   */
  private async post<T>(
    route: string,
    payload: FormData | Record<string, unknown>
  ): Promise<T> {
    const init: RequestInit =
      payload instanceof FormData
        ? { method: 'POST', body: payload }
        : {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          };

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${route}`, init);
    } catch {
      throw new ServiceUnavailableException('AI service is unavailable');
    }

    const body = (await response.json().catch(() => ({}))) as {
      message?: string | string[];
    } & Record<string, unknown>;

    if (response.status >= 400 && response.status < 500) {
      const message = Array.isArray(body.message)
        ? body.message.join(', ')
        : body.message;
      throw new BadRequestException(
        message ?? 'AI service rejected the request'
      );
    }
    if (!response.ok) {
      // Pass through the AI service's message (e.g. an upstream model failure).
      const message = Array.isArray(body.message)
        ? body.message.join(', ')
        : body.message;
      throw new ServiceUnavailableException(message ?? 'AI service error');
    }
    return body as T;
  }
}
