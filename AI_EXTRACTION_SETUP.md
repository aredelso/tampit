# AI Features: Coffee Label Extraction and Roaster Contact Lookup

The AI features run in a Python service (`ai-service/`). The NestJS server forwards requests to it, and the Next.js client calls the NestJS server as before. The service runs entirely locally: no external AI API and no API key.

```
client (Next.js)  --->  server (NestJS, :4000)  --->  ai-service (FastAPI, :8000)
                                                         |-- Tesseract OCR (label images, via pytesseract)
                                                         `-- Rule-based extraction (standard library + httpx)
```

## What it does

- **Coffee label extraction.** Upload a photo of a bag label. Tesseract reads the text. Known vocabularies (countries, processing methods, varieties) and label keywords such as "Origin:" pull out name, origin, variety, farm, process, and roaster name.
- **Roaster contact email.** Given a roaster name, the service guesses likely website domains, fetches each page, and looks for a contact address. It prefers mailboxes such as `info@` and `hello@`, and it reads `mailto:` links.

Because this is rule-based rather than a language model, it works best with labels that use clear keywords ("Origin: Kenya") and known terms. Unusual layouts may return fewer fields.

## Endpoints

| Route (NestJS, public) | Python service | Purpose |
| --- | --- | --- |
| `POST /api/ai/extract-coffee-data` (multipart `image`) | `POST /extract-coffee-data` | Label extraction |
| `POST /roasters/extract-contact-email` | `POST /contact-email` | Email from a website URL or content |
| `POST /roasters/extract-contact-email-by-name` | `POST /roaster-contact-email` | Email from a roaster name |

The Python service also has `GET /health`. Errors come back as `{"message": "..."}`. Validation problems return 400. The NestJS server passes these messages through.

## Configuration

No AI API key is needed. The only setting is where the server finds the service:

- `AI_SERVICE_URL` (NestJS): Compose sets `http://ai:8000`. For host runs, `server/.env.local` uses `http://localhost:8000`.

## Running

With Docker (recommended):

```bash
npm run docker              # starts db, ai, server and client
```

Without Docker (host), you need Python 3.12 and Tesseract installed:

```bash
cd ai-service
python -m venv .venv && .venv/Scripts/activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Tests

The Python tests need no network and no Tesseract. The OCR call is replaced with a stub, and page fetches use a fake HTTP client.

```bash
cd ai-service
pytest -q
```

To run them without a local Python install:

```bash
docker run --rm -v "$PWD:/app" -w /app python:3.12-slim sh -c "pip install -q -r requirements.txt && python -m pytest -q"
```

## Example

```bash
curl -X POST http://localhost:4000/api/ai/extract-coffee-data \
  -F "image=@path/to/coffee-bag.jpg"
```

```json
{
  "name": "Kenya AA Washed",
  "origin": "Kenya",
  "farm": "Nyeri",
  "process": "Washed"
}
```

Fields the service cannot find are omitted. If nothing is recognised, the endpoint returns 400.

## Supported images

JPEG, PNG, GIF, and WebP. Clear, well-lit photos of the label give the best results, because OCR accuracy depends on image quality.

## Files

- `ai-service/app/main.py`: HTTP routes and error mapping
- `ai-service/app/service.py`: OCR, the label flow, and the email lookup flow
- `ai-service/app/extractors.py`: rule-based label parsing, email selection, and website guessing
- `ai-service/app/parsing.py`: HTML-to-text and `mailto:` helpers
- `server/src/ai/ai.service.ts`: NestJS client for the AI service
- `server/src/ai/ai.controller.ts`: public upload endpoint
