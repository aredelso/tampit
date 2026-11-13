"""HTTP API for the AI features: label extraction and roaster contact emails.

All processing is local: Tesseract for OCR, and rule-based extraction in
extractors.py. Errors look like {"message": "..."} so the Nest server can forward them.
"""

from fastapi import Depends, FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from .service import AiError, AiService

app = FastAPI(title="TampIt AI service", version="2.0.0")


def get_service() -> AiService:
    return _service


_service = AiService()


class ContactByWebsite(BaseModel):
    websiteUrl: str | None = None
    websiteContent: str | None = None


class ContactByRoaster(BaseModel):
    roasterName: str | None = None


class EmailResult(BaseModel):
    email: str | None


@app.exception_handler(AiError)
async def ai_error_handler(_request, error: AiError):
    return JSONResponse(status_code=error.status_code, content={"message": error.message})


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/extract-coffee-data")
async def extract_coffee_data(
    image: UploadFile = File(...), service: AiService = Depends(get_service)
):
    return await service.extract_coffee_data(await image.read())


@app.post("/contact-email", response_model=EmailResult)
async def contact_email_from_website(
    body: ContactByWebsite, service: AiService = Depends(get_service)
):
    email = await service.extract_contact_email_from_website(
        website_url=body.websiteUrl, website_content=body.websiteContent
    )
    return {"email": email}


@app.post("/roaster-contact-email", response_model=EmailResult)
async def contact_email_by_roaster(
    body: ContactByRoaster, service: AiService = Depends(get_service)
):
    if body.roasterName is None:
        raise AiError(400, "Roaster name is required")
    email = await service.extract_contact_email_by_roaster_name(body.roasterName)
    return {"email": email}
