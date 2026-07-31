# Coffee Image AI Extraction Feature

## What's Been Implemented

### Backend (Node.js/NestJS)
- **AI Service** (`server/src/ai/ai.service.ts`)
  - `extractCoffeeDataFromImage(imagePath)` - Extracts coffee data from local image files
  - `extractCoffeeDataFromBase64(base64Image, mediaType)` - Extracts data from base64 encoded images
  - Uses Claude Sonnet 4 vision capabilities for accurate image analysis

- **API Controller** (`server/src/ai/ai.controller.ts`)
  - POST `/api/ai/extract-coffee-data` - File upload endpoint
  - Supports JPEG, PNG, GIF, and WebP image formats
  - Automatically cleans up temporary files after processing

- **Module Integration** (`server/src/ai/ai.module.ts`)
  - Added to main app module (`server/src/app.module.ts`)
  - Fully integrated with NestJS dependency injection

### Frontend (React/Next.js)
- **Updated CoffeeForm Component** (`client/src/components/CoffeeForm.tsx`)
  - New "Extract from bag image" section with visual upload UI
  - Handles image upload and sends to `/api/ai/extract-coffee-data`
  - Auto-fills form fields with extracted data:
    - Coffee name
    - Origin
    - Variety
    - Farm
    - Process
    - Description
    - Roaster name
  - Shows loading state ("Analyzing image…") during extraction
  - Displays error messages if extraction fails

## Setup Instructions

### 1. Set Anthropic API Key
Update your `.env` file in the server directory:

```bash
# server/.env
ANTHROPIC_API_KEY=your-actual-api-key-here
```

Get your API key from: https://console.anthropic.com

### 2. Ensure Database is Running
Make sure PostgreSQL is running in WSL (as per your existing setup):

```bash
# In WSL
sudo service postgresql start
```

### 3. Start the Application
```bash
npm start
```

This will start both the backend server (port 4000) and frontend (port 3000).

## Testing the Feature

1. **Navigate to the Coffee Form**
   - Go to the "Add Coffee" page in your app
   - Look for the "Extract from bag image" section below the Description field

2. **Upload a Coffee Bag Image**
   - Click on the "Extract from image" upload area
   - Select a photo of a coffee bag label
   - Wait for the analysis to complete

3. **Verify Results**
   - Form fields should auto-populate with extracted data
   - Check that coffee name, origin, variety, farm, and process are correctly identified
   - Error messages will appear if the image cannot be processed

## Supported Image Formats

- JPEG/JPG
- PNG
- GIF
- WebP

Maximum recommended image size: 20MB (for API efficiency)

## API Response Format

The `/api/ai/extract-coffee-data` endpoint returns JSON:

```json
{
  "name": "Ethiopian Yirgacheffe",
  "origin": "Ethiopia, Yirgacheffe",
  "variety": "Heirloom",
  "farm": "Worka",
  "process": "Washed",
  "roasterName": "Blue Bottle Coffee",
  "description": "Bright acidity with floral notes"
}
```

Fields that couldn't be identified are omitted from the response.

## curl Example

```bash
curl -X POST http://localhost:4000/api/ai/extract-coffee-data \
  -F "image=@path/to/coffee-bag.jpg"
```

## Notes

- The AI uses Claude Sonnet 4 for high accuracy with complex images
- Images are processed server-side and temporary files are automatically cleaned up
- All form fields can still be manually edited after extraction
- The feature works best with clear, well-lit photos of coffee bag labels
