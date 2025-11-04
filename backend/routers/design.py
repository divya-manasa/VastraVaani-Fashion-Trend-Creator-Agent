from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class DesignRequest(BaseModel):
    description: str
    style: str = "modern"

@router.post("/generate")
async def generate_design(req: DesignRequest):
    """Generate fashion design image using Pollinations AI (Free)"""
    try:
        # Pollinations AI - Free image generation (no model change needed)
        prompt = f"fashion design {req.description} in {req.style} style, high quality, professional"
        image_url = f"https://image.pollinations.ai/prompt/{prompt.replace(' ', '%20')}"
        
        return {
            "success": True,
            "description": req.description,
            "style": req.style,
            "image_url": image_url,
            "download_url": image_url,
            "model": "Pollinations AI (Free)"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
