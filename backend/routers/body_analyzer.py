
# Advanced Body Analysis from Image - Groq AI Powered

from fastapi import APIRouter, HTTPException, File, UploadFile
from pydantic import BaseModel
from groq import Groq
import base64
import json
import os

router = APIRouter()
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class BodyAnalysisResponse(BaseModel):
    height_estimate: float
    weight_estimate: float
    shoulder_width: float
    chest: float
    waist: float
    hip: float
    arm_length: float
    inseam: float
    body_shape: str
    skin_tone: str
    posture: str
    confidence_score: float
    analysis_details: str

@router.post("/analyze-image")
async def analyze_body_from_image(file: UploadFile = File(...)):
    """
    Analyze body measurements from uploaded image using Groq Vision
    """
    try:
        print(f"\n{'='*70}")
        print("🔍 IMAGE ANALYSIS - BODY MEASUREMENTS EXTRACTION")
        print(f"{'='*70}\n")

        # Read image
        contents = await file.read()
        base64_image = base64.standard_b64encode(contents).decode("utf-8")
        file_extension = file.filename.split(".")[-1].lower()
        
        # Determine media type
        media_type_map = {
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "png": "image/png",
            "gif": "image/gif",
            "webp": "image/webp"
        }
        media_type = media_type_map.get(file_extension, "image/jpeg")

        print(f"📷 Image: {file.filename}")
        print(f"📊 Analyzing body measurements...\n")

        # Use Groq's vision to analyze body
        message = groq_client.messages.create(
            model="gpt-4-vision-preview",  # Using vision capability
            max_tokens=2048,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": base64_image,
                            },
                        },
                        {
                            "type": "text",
                            "text": """Analyze this image and extract body measurements. IMPORTANT: Return ONLY valid JSON, no other text.

Analyze the person in the image and estimate:
1. Height (in cm, assume average standing posture)
2. Weight (in kg, based on visible body composition)
3. Shoulder width (in cm)
4. Chest measurement (in cm)
5. Waist measurement (in cm)
6. Hip measurement (in cm)
7. Arm length (in cm)
8. Inseam/leg length (in cm)
9. Body shape (pear/apple/hourglass/rectangle/athletic)
10. Skin tone (hex color code)
11. Posture assessment
12. Confidence score (0-100)

Return as JSON:
{
    "height_estimate": 170,
    "weight_estimate": 65,
    "shoulder_width": 42,
    "chest": 98,
    "waist": 75,
    "hip": 100,
    "arm_length": 65,
    "inseam": 80,
    "body_shape": "athletic",
    "skin_tone": "#E5BCA8",
    "posture": "straight",
    "confidence_score": 85,
    "analysis_details": "Description of the analysis"
}"""
                        }
                    ],
                }
            ],
        )

        # Parse response
        response_text = message.content[0].text.strip()
        
        # Extract JSON from response
        try:
            # Try to find JSON in response
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                measurements = json.loads(json_str)
            else:
                raise ValueError("No JSON found in response")
        except json.JSONDecodeError:
            print(f"Response: {response_text}")
            raise ValueError("Invalid JSON in Groq response")

        # Validate and normalize measurements
        measurements = {
            "height_estimate": max(150, min(220, float(measurements.get("height_estimate", 170)))),
            "weight_estimate": max(40, min(150, float(measurements.get("weight_estimate", 65)))),
            "shoulder_width": max(35, min(55, float(measurements.get("shoulder_width", 42)))),
            "chest": max(80, min(130, float(measurements.get("chest", 98)))),
            "waist": max(60, min(120, float(measurements.get("waist", 75)))),
            "hip": max(80, min(140, float(measurements.get("hip", 100)))),
            "arm_length": max(55, min(80, float(measurements.get("arm_length", 65)))),
            "inseam": max(65, min(95, float(measurements.get("inseam", 80)))),
            "body_shape": measurements.get("body_shape", "athletic").lower(),
            "skin_tone": measurements.get("skin_tone", "#E5BCA8"),
            "posture": measurements.get("posture", "straight").lower(),
            "confidence_score": max(0, min(100, float(measurements.get("confidence_score", 75)))),
            "analysis_details": measurements.get("analysis_details", "Analysis complete")
        }

        print(f"✅ Analysis Complete!")
        print(f"📊 Measurements Extracted:")
        print(f"   Height: {measurements['height_estimate']} cm")
        print(f"   Weight: {measurements['weight_estimate']} kg")
        print(f"   Chest: {measurements['chest']} cm")
        print(f"   Waist: {measurements['waist']} cm")
        print(f"   Hip: {measurements['hip']} cm")
        print(f"   Body Shape: {measurements['body_shape']}")
        print(f"   Confidence: {measurements['confidence_score']}%\n")

        return BodyAnalysisResponse(**measurements)

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

print("✅ Body Analyzer Loaded Successfully!")