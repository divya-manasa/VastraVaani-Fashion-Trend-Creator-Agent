from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
import cv2
import numpy as np
from io import BytesIO
from PIL import Image
from groq import Groq
import json

# Initialize router
router = APIRouter()

# Initialize Groq LLM
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Pydantic Models
class ColorInfo(BaseModel):
    hex: str
    rgb: Dict[str, int]
    name: str
    percentage: float
    psychology: str

class PatternInfo(BaseModel):
    type: str
    confidence: float
    description: str

class RecommendationInfo(BaseModel):
    color_hex: str
    color_name: str
    reason: str
    use_case: str
    psychology: str

class AnalysisResponse(BaseModel):
    success: bool
    dominant_colors: List[ColorInfo]
    pattern_analysis: PatternInfo
    llm_recommendations: List[RecommendationInfo]
    llm_analysis_summary: str

# Helper functions
def get_color_name(rgb):
    """Convert RGB to color name"""
    r, g, b = rgb['r'], rgb['g'], rgb['b']
    
    if r > 200 and g > 100 and b < 100:
        return "Red/Orange", "Warm, energetic, passionate"
    elif r > 100 and g > 100 and b < 100:
        return "Yellow/Brown", "Warm, earthy, natural"
    elif r < 100 and g > 150 and b < 100:
        return "Green", "Calm, nature, growth"
    elif r < 100 and g < 100 and b > 150:
        return "Blue", "Cool, trust, stability"
    elif r > 150 and g < 100 and b > 150:
        return "Purple", "Royal, creative, mysterious"
    elif r > 150 and g > 150 and b > 150:
        return "White/Light", "Clean, pure, minimalist"
    else:
        return "Dark/Gray", "Sophisticated, neutral, elegant"

def extract_colors_from_image(image_array):
    """Extract dominant colors using K-means clustering"""
    try:
        # Ensure image is RGB
        if len(image_array.shape) == 2:
            image_array = cv2.cvtColor(image_array, cv2.COLOR_GRAY2RGB)
        elif image_array.shape[2] == 4:
            image_array = cv2.cvtColor(image_array, cv2.COLOR_RGBA2RGB)
        
        # Resize for faster processing
        h, w = image_array.shape[:2]
        if h > 500 or w > 500:
            scale = max(h, w) / 500
            image_array = cv2.resize(image_array, (int(w/scale), int(h/scale)))
        
        # Reshape for K-means
        pixels = image_array.reshape(-1, 3).astype(np.float32)
        
        # K-means clustering
        k = 6
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
        _, labels, centers = cv2.kmeans(pixels, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        
        # Get dominant colors
        unique, counts = np.unique(labels, return_counts=True)
        dominant_colors = []
        
        for i, center in enumerate(centers):
            r, g, b = map(int, center)
            percentage = (counts[i] / len(labels)) * 100
            hex_color = f"#{r:02x}{g:02x}{b:02x}"
            color_name, psychology = get_color_name({"r": r, "g": g, "b": b})
            
            color_info = {
                "hex": hex_color,
                "rgb": {"r": r, "g": g, "b": b},
                "name": color_name,
                "percentage": round(percentage, 1),
                "psychology": psychology
            }
            dominant_colors.append(color_info)
        
        # Sort by percentage
        dominant_colors.sort(key=lambda x: x["percentage"], reverse=True)
        return dominant_colors[:6]
    
    except Exception as e:
        print(f"Error extracting colors: {str(e)}")
        return []

def detect_pattern(image_array):
    """Detect pattern type"""
    try:
        gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 100, 200)
        edge_percentage = (np.count_nonzero(edges) / edges.size) * 100
        
        if edge_percentage > 30:
            return "Complex Pattern", edge_percentage
        elif edge_percentage > 15:
            return "Moderate Pattern", edge_percentage
        else:
            return "Simple/Solid", edge_percentage
    except:
        return "Unknown", 0

def get_llm_color_recommendations(dominant_colors, pattern_type):
    """Get LLM-powered recommendations based on colors and patterns"""
    try:
        # Prepare color information for LLM
        color_descriptions = []
        for i, color in enumerate(dominant_colors[:5]):
            color_descriptions.append(
                f"{i+1}. {color['name']} ({color['hex']}) - {color['percentage']}% - {color['psychology']}"
            )
        
        color_text = "\n".join(color_descriptions)
        
        # Create LLM prompt
        prompt = f"""You are an expert fashion color consultant and stylist. Analyze these dominant colors from an image and recommend complementary colors for fashion design.

IMAGE COLORS DETECTED:
{color_text}

PATTERN TYPE: {pattern_type}

Based on these colors, provide:
1. 3-4 specific color recommendations (with hex codes) that would pair well with these colors for fashion design
2. For each recommendation, explain:
   - Why this color works with the detected colors (color psychology & harmony)
   - Best use case in fashion design
   - Specific hex code to use
   
3. A brief summary (2-3 sentences) of the overall color mood and styling recommendations

Format your response as JSON with this structure:
{{
    "recommendations": [
        {{
            "hex": "#RRGGBB",
            "name": "Color Name",
            "reason": "Why this color works",
            "use_case": "Where to use in design",
            "psychology": "Color psychology"
        }}
    ],
    "summary": "Overall styling recommendation"
}}

Be specific with hex codes and fashion design insights."""

        # Call Groq LLM
        message = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=1500,
        )
        
        # Extract response
        response_text = message.choices[0].message.content

        
        # Parse JSON from response
        try:
            # Find JSON in response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            if start_idx != -1 and end_idx > start_idx:
                json_str = response_text[start_idx:end_idx]
                return json.loads(json_str)
        except json.JSONDecodeError:
            pass
        
        # Fallback if JSON parsing fails
        return {
            "recommendations": [
                {
                    "hex": "#E8D5FF",
                    "name": "Lavender",
                    "reason": "Complementary to warm tones",
                    "use_case": "Accent color in designs",
                    "psychology": "Creativity and elegance"
                },
                {
                    "hex": "#FFE5D0",
                    "name": "Peach",
                    "reason": "Soft and versatile",
                    "use_case": "Primary or secondary color",
                    "psychology": "Warmth and comfort"
                }
            ],
            "summary": "These colors create a balanced and fashionable palette suitable for various design styles."
        }
    
    except Exception as e:
        print(f"Error getting LLM recommendations: {str(e)}")
        return {
            "recommendations": [],
            "summary": f"Error: {str(e)}"
        }

# API Endpoints
@router.post("/analyze")
async def analyze_color_llm(file: UploadFile = File(...)):
    """Analyze colors and patterns from image using LLM-powered recommendations"""
    try:
        # Read image
        contents = await file.read()
        image = Image.open(BytesIO(contents))
        img_array = np.array(image)
        
        # Convert to OpenCV format (BGR)
        if len(img_array.shape) == 3 and img_array.shape[2] == 3:
            img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        
        # Extract dominant colors
        dominant_colors = extract_colors_from_image(img_array)
        
        if not dominant_colors:
            raise HTTPException(status_code=400, detail="Could not extract colors from image")
        
        # Detect pattern
        pattern_type, confidence = detect_pattern(img_array)
        
        pattern_info = PatternInfo(
            type=pattern_type,
            confidence=round(min(100, confidence), 1),
            description=f"Pattern complexity: {pattern_type}"
        )
        
        # Get LLM recommendations
        llm_result = get_llm_color_recommendations(dominant_colors, pattern_type)
        
        # Format recommendations
        recommendations = []
        for rec in llm_result.get("recommendations", []):
            recommendations.append(RecommendationInfo(
                color_hex=rec.get("hex", "#000000"),
                color_name=rec.get("name", "Color"),
                reason=rec.get("reason", ""),
                use_case=rec.get("use_case", ""),
                psychology=rec.get("psychology", "")
            ))
        
        # Format dominant colors with psychology
        dominant_colors_with_psychology = []
        for color in dominant_colors:
            dominant_colors_with_psychology.append(ColorInfo(
                hex=color["hex"],
                rgb=color["rgb"],
                name=color["name"],
                percentage=color["percentage"],
                psychology=color["psychology"]
            ))
        
        return AnalysisResponse(
            success=True,
            dominant_colors=dominant_colors_with_psychology[:5],
            pattern_analysis=pattern_info,
            llm_recommendations=recommendations,
            llm_analysis_summary=llm_result.get("summary", "Color analysis complete")
        )
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error analyzing image: {str(e)}")

@router.get("/analyze")
async def analyze_color_test():
    """Test endpoint"""
    return {
        "status": "ok",
        "message": "Use POST /analyze-llm with an image file for LLM-powered color analysis"
    }

@router.post("/health")
async def health_check():
    """Health check"""
    return {"status": "ok", "llm_available": True}