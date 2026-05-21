import { Injectable, BadRequestException } from '@nestjs/common';
import Groq from 'groq-sdk';

@Injectable()
export class AiService {
  private client: Groq;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }
    this.client = new Groq({ apiKey });
  }

  async extractContactEmailByRoasterName(
    roasterName: string
  ): Promise<string | null> {
    if (!roasterName?.trim()) {
      throw new BadRequestException('Roaster name is required');
    }

    // Use Groq to suggest likely website URLs
    const urlSuggestions = await this.suggestWebsiteUrls(roasterName);

    // Try each URL to find the website with contact email
    for (const url of urlSuggestions) {
      try {
        const email = await this.extractContactEmailFromWebsite(url);
        if (email) {
          return email;
        }
      } catch (error) {
        // Continue to next URL if this one fails
        continue;
      }
    }

    return null;
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

    let content = websiteContent;

    // If only URL is provided, fetch the content
    if (!content && websiteUrl) {
      try {
        content = await this.fetchWebsiteContent(websiteUrl);
      } catch (error) {
        throw new BadRequestException(
          `Failed to fetch website content from ${websiteUrl}`
        );
      }
    }

    if (!content) {
      return null;
    }

    // Use Groq to extract contact email
    const response = await this.client.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Extract the primary contact email address from the following website content. Return ONLY the email address (e.g., contact@example.com), or null if no contact email is found. Do not include any other text.\n\nWebsite content:\n${content}`,
        },
      ],
    });

    const extractedEmail = response.choices[0]?.message?.content;
    if (!extractedEmail) {
      return null;
    }

    const email = extractedEmail.trim();

    // Validate it looks like an email
    if (
      email &&
      email !== 'null' &&
      email.includes('@') &&
      email.includes('.')
    ) {
      return email;
    }

    return null;
  }

  private async suggestWebsiteUrls(roasterName: string): Promise<string[]> {
    // Use Groq to generate likely website URLs based on roaster name
    const response = await this.client.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: `Given the coffee roaster company name "${roasterName}", suggest the 3 most likely website URLs. Return ONLY the URLs as a comma-separated list, without any other text. Example format: example.com, www.example.com, example.co\n\nSuggested URLs:`,
        },
      ],
    });

    const suggestedUrls = response.choices[0]?.message?.content;
    if (!suggestedUrls) {
      return [];
    }

    // Parse the URLs and normalize them
    return suggestedUrls
      .split(',')
      .map((url) => url.trim())
      .filter((url) => url.length > 0)
      .slice(0, 3); // Limit to 3 URLs
  }

  private async fetchWebsiteContent(url: string): Promise<string> {
    // Ensure URL has protocol
    let normalizedUrl = url;
    if (
      !normalizedUrl.startsWith('http://') &&
      !normalizedUrl.startsWith('https://')
    ) {
      normalizedUrl = 'https://' + url;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(normalizedUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();

      // Extract text content from HTML (basic cleanup)
      const text = html
        .replace(/<script[^>]*>.*?<\/script>/gs, '')
        .replace(/<style[^>]*>.*?<\/style>/gs, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      return text.substring(0, 5000); // Limit to first 5000 chars to keep API costs reasonable
    } catch (error) {
      throw new Error(
        `Failed to fetch website: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
