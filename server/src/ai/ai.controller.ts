import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import type { ExtractedCoffeeData } from '@shared/coffee';
import { AiService } from './ai.service';

@Controller('api/ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('extract-coffee-data')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = path.join(process.cwd(), 'uploads');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
          cb(null, name);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
        ];
        if (!allowedMimes.includes(file.mimetype)) {
          cb(new Error('Only image files are allowed'), false);
          return;
        }
        cb(null, true);
      },
    })
  )
  async extractCoffeeData(
    @UploadedFile() file: Express.Multer.File
  ): Promise<ExtractedCoffeeData> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    try {
      const extractedData = await this.aiService.extractCoffeeDataFromImage(
        file.path
      );
      // Clean up the uploaded file after processing
      fs.unlinkSync(file.path);
      return extractedData;
    } catch (error) {
      // Clean up the uploaded file on error
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }
}
