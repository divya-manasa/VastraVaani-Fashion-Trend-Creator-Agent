from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
from groq import Groq
import os
from datetime import datetime
import base64
from io import BytesIO
from PIL import Image
import requests
import time

router = APIRouter()
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
huggingface_token = os.getenv("HUGGINGFACE_API_KEY")
serpapi_key = os.getenv("SERPAPI_API_KEY")

class DesignGeneratorRequest(BaseModel):
    outfit_type: str
    occasion: str
    gender: str
    colors: List[str]
    fabric_preference: Optional[str] = None
    regional_preference: Optional[str] = None
    style_keywords: List[str] = []
    design_description: Optional[str] = None

class ImageGenerationRequest(BaseModel):
    prompt: str
    use_refiner: Optional[bool] = True

# ======================== SERPAPI PINTEREST IMAGE SCRAPING ========================

async def scrape_pinterest_with_serpapi(keywords: List[str], gender: str) -> List[Dict]:
    """
    Scrape Pinterest images using SerpApi (REAL images)
    SerpApi handles Google Images, Pinterest, Bing Images, and more
    """
    try:
        if not serpapi_key:
            print("⚠️ SERPAPI_API_KEY not configured")
            return []
        
        print(f"🔍 Scraping Pinterest images for {gender} outfits with SerpApi...")
        
        designs = []
        
        for keyword in keywords[:3]:
            try:
                if gender == "Male":
                    search_query = f"{keyword} men's outfit fashion"
                else:
                    search_query = f"{keyword} women's outfit fashion"
                
                print(f"  🔍 Searching: {search_query}")
                
                # SerpApi endpoint for Google Images (which includes Pinterest results)
                url = "https://serpapi.com/search"
                
                params = {
                    "q": search_query,
                    "tbm": "isch",  # Image search
                    "ijn": "0",
                    "api_key": serpapi_key,
                    "num": 10,  # Get 10 images per search
                }
                
                response = requests.get(url, params=params, timeout=15)
                
                if response.status_code == 200:
                    data = response.json()
                    images_results = data.get("images_results", [])
                    
                    print(f"    ✅ Found {len(images_results)} images")
                    
                    for img in images_results[:10]:
                        image_url = img.get("original")
                        if image_url and image_url.startswith("http"):
                            designs.append({
                                "platform": "pinterest/google",
                                "image_url": image_url,
                                "title": img.get("title", search_query),
                                "description": search_query,
                            })
                else:
                    print(f"    ⚠️ API Response: {response.status_code}")
                    if response.status_code == 401:
                        print("    ❌ Invalid SerpApi key")
                    elif response.status_code == 429:
                        print("    ⚠️ Rate limit - waiting...")
                        time.sleep(2)
            
            except Exception as e:
                print(f"    ⚠️ Error: {str(e)[:50]}")
                continue
        
        print(f"✅ Scraping complete: {len(designs)} images found")
        return designs[:15]
        
    except Exception as e:
        print(f"❌ SerpApi error: {e}")
        return []

# ======================== CREATE INSPIRATION COLLAGE ========================

def create_inspiration_collage(images: List[Dict]) -> Optional[str]:
    """Create collage from scraped images"""
    try:
        if not images:
            print("⚠️ No images for collage")
            return None
        
        print(f"📸 Creating inspiration collage from {len(images)} images...")
        
        collage_size = (900, 900)
        tile_size = (300, 300)
        collage = Image.new('RGB', collage_size, color=(30, 41, 59))
        
        loaded_count = 0
        img_index = 0
        
        for row in range(3):
            for col in range(3):
                if img_index >= len(images):
                    break
                
                image_url = images[img_index].get("image_url", "")
                
                if image_url and image_url.startswith("http"):
                    try:
                        print(f"  Loading image {img_index + 1}/9...")
                        
                        response = requests.get(
                            image_url,
                            timeout=10,
                            headers={
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                            }
                        )
                        
                        if response.status_code == 200:
                            img = Image.open(BytesIO(response.content))
                            
                            if img.mode != 'RGB':
                                img = img.convert('RGB')
                            
                            # Center crop to square
                            min_dim = min(img.width, img.height)
                            img = img.crop((
                                (img.width - min_dim) // 2,
                                (img.height - min_dim) // 2,
                                (img.width + min_dim) // 2,
                                (img.height + min_dim) // 2,
                            ))
                            
                            img = img.resize(tile_size, Image.Resampling.LANCZOS)
                            
                            offset = (col * 300, row * 300)
                            collage.paste(img, offset)
                            loaded_count += 1
                            print(f"  ✅ Loaded image {loaded_count}")
                        else:
                            print(f"  ❌ HTTP {response.status_code}")
                    
                    except Exception as e:
                        print(f"  ⚠️ Failed: {str(e)[:40]}")
                
                img_index += 1
        
        buffer = BytesIO()
        collage.save(buffer, format='PNG')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode()
        
        print(f"✅ Collage created with {loaded_count} images")
        return f"data:image/png;base64,{image_base64}"
        
    except Exception as e:
        print(f"❌ Collage error: {e}")
        return None

# ======================== DESIGN SUMMARY & PROMPT ========================

async def generate_design_summary(req: DesignGeneratorRequest) -> str:
    """Generate design summary"""
    try:
        keywords_str = ", ".join(req.style_keywords) if req.style_keywords else "elegant, modern"
        gender_context = "men's" if req.gender == "Male" else "women's"
        
        prompt = f"""Create a professional fashion design summary for a {gender_context} {req.outfit_type} for {req.occasion}:

Design: {req.outfit_type} ({req.gender})
Occasion: {req.occasion}
Colors: {', '.join(req.colors)}
Fabric: {req.fabric_preference or 'Not specified'}
Region: {req.regional_preference or 'Any'}
Keywords: {keywords_str}

Include: design overview, color placement, embellishments, fit, styling.
Professional and detailed."""

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=600
        )
        
        return response.choices[0].message.content
    except Exception as e:
        return f"Beautiful {req.gender} {req.outfit_type} for {req.occasion}."

async def generate_image_prompt_from_summary(req: DesignGeneratorRequest, summary: str) -> str:
    """Generate image prompt"""
    try:
        print("🤖 Generating image prompt...")
        gender_context = "men's" if req.gender == "Male" else "women's"
        
        prompt_generation = f"""Create a detailed SDXL prompt based on:
{summary}

Include: model, outfit details, colors, fabric, styling, professional photography.
Max 250 words. Single paragraph. Optimize for image generation."""

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt_generation}],
            temperature=0.8,
            max_tokens=500
        )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Professional {gender_context} fashion photography of {req.outfit_type}."

# ======================== IMAGE GENERATION WITH SDXL ========================

async def generate_image_with_sdxl(prompt: str, use_refiner: bool = True) -> Optional[str]:
    """Generate image with SDXL"""
    try:
        print("🎨 Generating image with SDXL...")
        
        if not huggingface_token:
            print("⚠️ HUGGINGFACE_API_KEY not configured")
            return None
        
        headers = {"Authorization": f"Bearer {huggingface_token}"}
        BASE_API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
        
        payload = {
            "inputs": prompt,
            "parameters": {
                "width": 1024,
                "height": 1024,
                "num_inference_steps": 40,
                "guidance_scale": 7.5,
            }
        }
        
        print("📡 Sending to SDXL...")
        base_response = requests.post(BASE_API_URL, headers=headers, json=payload, timeout=300)
        
        if base_response.status_code == 503:
            print("⏳ Model loading, waiting...")
            time.sleep(10)
            base_response = requests.post(BASE_API_URL, headers=headers, json=payload, timeout=300)
        
        if base_response.status_code != 200:
            print(f"❌ Error: {base_response.status_code}")
            return None
        
        image_base64 = base64.b64encode(base_response.content).decode()
        print("✅ Image generated")
        
        return f"data:image/png;base64,{image_base64}"
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

# ======================== FABRIC RECOMMENDATIONS ========================

def get_fabric_recommendations(fabric_pref: Optional[str], occasion: str, gender: str) -> List[Dict]:
    """Get fabric recommendations"""
    
    fabric_db = {
        "Wedding": ["Silk", "Velvet", "Brocade", "Georgette", "Satin"],
        "Grand": ["Silk", "Satin", "Brocade", "Tissue", "Crepe"],
        "Partywear": ["Satin", "Crepe", "Georgette", "Shimmer", "Net"],
        "Casual": ["Cotton", "Linen", "Khadi", "Rayon", "Jersey"],
        "Office": ["Cotton blend", "Linen", "Crepe", "Rayon", "Polyester"],
        "Festival": ["Silk", "Georgette", "Brocade", "Shimmer", "Tissue"],
    }
    
    fabrics = fabric_db.get(occasion, ["Cotton", "Silk"])
    
    return [
        {
            "fabric": fabric,
            "properties": get_fabric_properties(fabric),
            "care": get_fabric_care(fabric)
        }
        for fabric in fabrics[:5]
    ]

def get_fabric_properties(fabric: str) -> str:
    properties = {
        "Silk": "Luxurious, smooth, breathable, drapes well",
        "Cotton": "Breathable, comfortable, durable, easy to care",
        "Satin": "Shiny, smooth, elegant, formal",
        "Georgette": "Lightweight, fluid, elegant, formal",
        "Crepe": "Textured, elegant, drapes well, professional",
        "Velvet": "Rich, luxurious, soft, formal",
        "Brocade": "Heavy, ornate, traditional, formal",
        "Linen": "Natural, breathable, casual, durable",
    }
    return properties.get(fabric, "Quality fabric")

def get_fabric_care(fabric: str) -> str:
    care = {
        "Silk": "Dry clean only",
        "Cotton": "Machine wash cold",
        "Satin": "Gentle wash or dry clean",
        "Georgette": "Hand wash or dry clean",
        "Crepe": "Dry clean recommended",
        "Velvet": "Dry clean only",
        "Brocade": "Dry clean only",
        "Linen": "Machine wash",
    }
    return care.get(fabric, "Follow care label")

# ======================== API ENDPOINTS ========================

@router.post("/generate-prompt")
async def generate_prompt_endpoint(req: DesignGeneratorRequest):
    """Generate design with Pinterest scraping"""
    try:
        print(f"\n{'='*70}")
        print(f"🎨 GENERATING DESIGN ({req.gender})")
        print(f"{'='*70}\n")
        
        print("=== Step 1: Pinterest Image Scraping ===")
        search_keywords = req.style_keywords or [req.outfit_type, req.occasion]
        pinterest_designs = await scrape_pinterest_with_serpapi(search_keywords, req.gender)
        print(f"✅ {len(pinterest_designs)} images scraped\n")
        
        collage = None
        if pinterest_designs:
            print("=== Step 2: Creating Inspiration Collage ===")
            collage = create_inspiration_collage(pinterest_designs)
            print()
        
        print("=== Step 3: Generating Design Summary ===")
        design_summary = await generate_design_summary(req)
        print(f"✅ Summary generated\n")
        
        print("=== Step 4: Generating Image Prompt ===")
        image_prompt = await generate_image_prompt_from_summary(req, design_summary)
        print(f"✅ Prompt generated\n")
        
        fabrics = get_fabric_recommendations(req.fabric_preference, req.occasion, req.gender)
        
        return {
            "success": True,
            "summary": design_summary,
            "prompt": image_prompt,
            "fabrics": fabrics,
            "inspiration_collage": collage,
            "inspiration_count": len(pinterest_designs),
            "message": "Review and edit the prompt"
        }
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}\n")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-image")
async def generate_image_endpoint(req: ImageGenerationRequest):
    """Generate image"""
    try:
        print(f"\n{'='*70}")
        print(f"🎨 GENERATING IMAGE")
        print(f"{'='*70}\n")
        
        image_data = await generate_image_with_sdxl(req.prompt)
        
        if not image_data:
            raise HTTPException(status_code=500, detail="Generation failed")
        
        return {
            "success": True,
            "image": image_data,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/download-image")
async def download_image_endpoint(prompt: str, format: str = "png"):
    """Download image"""
    try:
        image_data = await generate_image_with_sdxl(prompt)
        
        if not image_data:
            raise HTTPException(status_code=500)
        
        if image_data.startswith("data:image"):
            base64_data = image_data.split(",")[1]
        else:
            base64_data = image_data
        
        image_bytes = base64.b64decode(base64_data)
        img = Image.open(BytesIO(image_bytes))
        
        if format.lower() in ["jpg", "jpeg"] and img.mode != "RGB":
            img = img.convert("RGB")
        
        buffer = BytesIO()
        img.save(buffer, format="JPEG" if format.lower() in ["jpg", "jpeg"] else "PNG")
        buffer.seek(0)
        
        filename = f"fashion-design-{datetime.now().strftime('%Y%m%d-%H%M%S')}.{format.lower()}"
        
        return StreamingResponse(
            buffer,
            media_type=f"image/{format.lower()}",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def status():
    return {
        "status": "✅ Ready",
        "scraping": "SerpApi (Pinterest + Google Images) ✅",
        "images": "Real fashion images from Pinterest",
        "serpapi_configured": bool(serpapi_key),
    }
