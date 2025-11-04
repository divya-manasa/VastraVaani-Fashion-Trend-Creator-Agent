from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
import os

router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class ChatRequest(BaseModel):
    message: str
    history: list = []

@router.post("/chat")
async def stylist_chat(req: ChatRequest):
    """Personal AI Stylist using Groq AI (Llama 3.3 70B)"""
    try:
        system_prompt = """You are VastraVaani AI Stylist, an expert fashion consultant with deep knowledge of:
- Fashion history and evolution
- Current global trends
- Styling techniques
- Color theory
- Body types and flattering styles
- Occasion-appropriate fashion
- Sustainable fashion
- Brand recommendations
- Wardrobe building

Provide practical, specific, and personalized fashion advice."""

        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history
        for msg in req.history[-5:]:
            messages.append({"role": "user", "content": msg.get("user", "")})
            messages.append({"role": "assistant", "content": msg.get("assistant", "")})
        
        messages.append({"role": "user", "content": req.message})
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # ✅ UPDATED
            messages=messages,
            temperature=0.7,
            max_tokens=800
        )
        
        return {
            "success": True,
            "message": req.message,
            "response": response.choices[0].message.content,
            "model": "Llama 3.3 70B (Groq)"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
