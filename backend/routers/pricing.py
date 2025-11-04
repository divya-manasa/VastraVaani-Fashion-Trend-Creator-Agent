from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
import os

router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class PricingRequest(BaseModel):
    product_name: str
    cost: float
    target_market: str
    competition: str = ""

@router.post("/suggest")
async def suggest_pricing(req: PricingRequest):
    """Generate smart pricing strategy using AI (Llama 3.3 70B)"""
    try:
        prompt = f"""As a fashion business consultant, suggest a pricing strategy for:

Product: {req.product_name}
Production Cost: ${req.cost}
Target Market: {req.target_market}
Competition: {req.competition}

Provide:
1. Recommended retail price
2. Wholesale price
3. Discount strategy
4. Profit margins
5. Pricing justification
6. Market positioning"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # ✅ UPDATED
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            max_tokens=700
        )
        
        return {
            "success": True,
            "product": req.product_name,
            "cost": req.cost,
            "strategy": response.choices[0].message.content,
            "model": "Llama 3.3 70B (Groq)"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
