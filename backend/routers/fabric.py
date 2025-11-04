from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
import os

router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class FabricRequest(BaseModel):
    garment_type: str
    season: str
    preferences: str = ""

@router.post("/recommend")
async def recommend_fabrics(req: FabricRequest):
    """Recommend fabrics using Groq AI (Llama 3.3 70B)"""
    try:
        prompt = f"""As a fabric expert, recommend the best fabrics for:
Garment Type: {req.garment_type}
Season: {req.season}
Additional Preferences: {req.preferences}

Provide:
1. Top 3 fabric recommendations
2. Pros and cons for each
3. Care instructions
4. Price range

Be specific and practical."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # ✅ UPDATED
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            max_tokens=800
        )
        
        return {
            "success": True,
            "garment_type": req.garment_type,
            "season": req.season,
            "recommendations": response.choices[0].message.content,
            "model": "Llama 3.3 70B (Groq)"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
