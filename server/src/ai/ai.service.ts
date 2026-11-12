import { Injectable, BadRequestException } from '@nestjs/common';
import Groq from 'groq-sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as Tesseract from 'tesseract.js';
import type { ExtractedCoffeeData } from '@shared/coffee';

@Injectable()
export class AiService {
  private groqClient: Groq;

  constructor() {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }
    this.groqClient = new Groq({ apiKey: groqApiKey });
  }

  async extractCoffeeDataFromImage(
    imagePath: string
  ): Promise<ExtractedCoffeeData> {
    if (!imagePath?.trim()) {
      throw new BadRequestException('Image path is required');
    }

    // Read the image file
    const absolutePath = path.resolve(imagePath);
    if (!fs.existsSync(absolutePath)) {
      throw new BadRequestException(`Image file not found: ${imagePath}`);
    }

    const imageBuffer = fs.readFileSync(absolutePath);
    const base64Image = imageBuffer.toString('base64');

    return this.extractCoffeeDataFromBase64(base64Image);
  }

  async extractCoffeeDataFromBase64(
    base64Image: string
  ): Promise<ExtractedCoffeeData> {
    if (!base64Image?.trim()) {
      throw new BadRequestException('Base64 image data is required');
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Image, 'base64');

    // Use Tesseract OCR to extract text from image
    let ocrText: string;
    try {
      const result = await Tesseract.recognize(imageBuffer, 'eng');
      ocrText = result.data.text;
    } catch (error) {
      throw new BadRequestException(
        `Failed to extract text from image: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    if (!ocrText?.trim()) {
      throw new BadRequestException(
        'Could not extract any text from the image'
      );
    }

    // Use Groq to analyze the extracted text
    const response = await this.groqClient.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Analyze this coffee label text and extract coffee information. Return a JSON object with the following fields (only include fields that are present in the text):

{
  "name": "Coffee name/product name",
  "origin": "Country or region of origin",
  "variety": "Coffee variety/cultivar (e.g., Bourbon, Typica, Geisha)",
  "farm": "Farm or estate name",
  "process": "Processing method (e.g., Washed, Natural, Honey)",
  "description": "Any other relevant information",
  "roasterName": "Name of the roasting company"
}

Return ONLY valid JSON, no additional text. If you cannot determine a field, omit it from the response.

Label text:
${ocrText}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new BadRequestException(
        'Failed to extract coffee data from image text'
      );
    }

    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const extractedData = JSON.parse(jsonMatch[0]) as ExtractedCoffeeData;
      return extractedData;
    } catch (error) {
      throw new BadRequestException(
        `Failed to parse extracted coffee data: ${error instanceof Error ? error.message : String(error)}`
      );
    }
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
    const response = await this.groqClient.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
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
    const response = await this.groqClient.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
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

  private async fetchWebsiteContent(url: any): Promise<string> {
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
