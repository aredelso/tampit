"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let AiService = class AiService {
    constructor() {
        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) {
            throw new Error('GROQ_API_KEY environment variable is not set');
        }
        this.groqClient = new groq_sdk_1.default({ apiKey: groqApiKey });
        const claudeApiKey = process.env.ANTHROPIC_API_KEY;
        if (!claudeApiKey) {
            throw new Error('ANTHROPIC_API_KEY environment variable is not set');
        }
        this.claudeClient = new sdk_1.default({ apiKey: claudeApiKey });
    }
    async extractCoffeeDataFromImage(imagePath) {
        if (!imagePath?.trim()) {
            throw new common_1.BadRequestException('Image path is required');
        }
        // Read the image file
        const absolutePath = path.resolve(imagePath);
        if (!fs.existsSync(absolutePath)) {
            throw new common_1.BadRequestException(`Image file not found: ${imagePath}`);
        }
        const imageBuffer = fs.readFileSync(absolutePath);
        const base64Image = imageBuffer.toString('base64');
        // Determine media type from file extension
        const ext = path.extname(imagePath).toLowerCase();
        let mediaType;
        switch (ext) {
            case '.jpg':
            case '.jpeg':
                mediaType = 'image/jpeg';
                break;
            case '.png':
                mediaType = 'image/png';
                break;
            case '.gif':
                mediaType = 'image/gif';
                break;
            case '.webp':
                mediaType = 'image/webp';
                break;
            default:
                throw new common_1.BadRequestException(`Unsupported image format: ${ext}. Supported formats: jpg, jpeg, png, gif, webp`);
        }
        return this.extractCoffeeDataFromBase64(base64Image, mediaType);
    }
    async extractCoffeeDataFromBase64(base64Image, mediaType) {
        if (!base64Image?.trim()) {
            throw new common_1.BadRequestException('Base64 image data is required');
        }
        const response = await this.claudeClient.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 500,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: mediaType,
                                data: base64Image,
                            },
                        },
                        {
                            type: 'text',
                            text: `Extract coffee information from this coffee bag or label image. Return the data as a JSON object with the following fields (only include fields that are visible in the image):

{
  "name": "Coffee name/product name",
  "origin": "Country or region of origin",
  "variety": "Coffee variety/cultivar (e.g., Bourbon, Typica, Geisha)",
  "farm": "Farm or estate name",
  "process": "Processing method (e.g., Washed, Natural, Honey)",
  "description": "Any other relevant information from the label",
  "roasterName": "Name of the roasting company"
}

Return ONLY valid JSON, no additional text. If you cannot determine a field, omit it from the response.`,
                        },
                    ],
                },
            ],
        });
        const content = response.content[0];
        if (content.type !== 'text') {
            throw new common_1.BadRequestException('Failed to extract text from image');
        }
        try {
            // Extract JSON from the response (handle cases where there might be extra text)
            const jsonMatch = content.text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            const extractedData = JSON.parse(jsonMatch[0]);
            return extractedData;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to parse extracted coffee data: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async extractContactEmailByRoasterName(roasterName) {
        if (!roasterName?.trim()) {
            throw new common_1.BadRequestException('Roaster name is required');
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
            }
            catch (error) {
                // Continue to next URL if this one fails
                continue;
            }
        }
        return null;
    }
    async extractContactEmailFromWebsite(websiteUrl, websiteContent) {
        if (!websiteUrl && !websiteContent) {
            throw new common_1.BadRequestException('Either websiteUrl or websiteContent is required');
        }
        let content = websiteContent;
        // If only URL is provided, fetch the content
        if (!content && websiteUrl) {
            try {
                content = await this.fetchWebsiteContent(websiteUrl);
            }
            catch (error) {
                throw new common_1.BadRequestException(`Failed to fetch website content from ${websiteUrl}`);
            }
        }
        if (!content) {
            return null;
        }
        // Use Groq to extract contact email
        const response = await this.groqClient.chat.completions.create({
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
        if (email &&
            email !== 'null' &&
            email.includes('@') &&
            email.includes('.')) {
            return email;
        }
        return null;
    }
    async suggestWebsiteUrls(roasterName) {
        // Use Groq to generate likely website URLs based on roaster name
        const response = await this.groqClient.chat.completions.create({
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
    async fetchWebsiteContent(url) {
        // Ensure URL has protocol
        let normalizedUrl = url;
        if (!normalizedUrl.startsWith('http://') &&
            !normalizedUrl.startsWith('https://')) {
            normalizedUrl = 'https://' + url;
        }
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const response = await fetch(normalizedUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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
        }
        catch (error) {
            throw new Error(`Failed to fetch website: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AiService);
