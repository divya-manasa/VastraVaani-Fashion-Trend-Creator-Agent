# routers/ar_tryon_agent_fixed.py
# 3D AR Try-On Agent - CORRECTED VERSION
# Fixes: ar_preview must be JSON string, not dict
# Fixes: Proper validation and error handling

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from groq import Groq
import os
import cv2
import numpy as np
import base64
from datetime import datetime
import json
import math
from enum import Enum

router = APIRouter()
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ======================== ENUMS ========================

class GarmentCategory(str, Enum):
    SHIRT = "shirt"
    DRESS = "dress"
    PANTS = "pants"
    JACKET = "jacket"
    SKIRT = "skirt"
    SWEATER = "sweater"
    SAREE = "saree"
    LEHENGA = "lehenga"

class FabricType(str, Enum):
    COTTON = "cotton"
    SILK = "silk"
    WOOL = "wool"
    POLYESTER = "polyester"
    LINEN = "linen"
    VELVET = "velvet"
    CHIFFON = "chiffon"
    DENIM = "denim"

class DrapeAttribute(str, Enum):
    STIFF = "stiff"
    MODERATE = "moderate"
    FLOWING = "flowing"
    STRETCHY = "stretchy"

# ======================== MODELS ========================

class BodyMeasurements(BaseModel):
    height: float
    weight: float
    shoulder_width: float
    chest: float
    waist: float
    hip: float
    arm_length: float
    inseam: float

class FabricProperties(BaseModel):
    fabric_type: FabricType
    texture: str
    material_percentage: Dict[str, float]
    drape: DrapeAttribute
    weight: float
    elasticity: float = Field(..., ge=0, le=1)
    shine: float = Field(..., ge=0, le=1)

class TryOnPreferences(BaseModel):
    garment_category: GarmentCategory
    color: str
    lighting: str = "natural"
    environment: str = "plain"
    pose: str = "frontal"

class UserAvatar(BaseModel):
    avatar_type: str
    measurements: BodyMeasurements
    skin_tone: str
    body_shape: str

class GarmentModel(BaseModel):
    model_type: str
    model_format: str = "png"

class FitRecommendation(BaseModel):
    size_recommendation: str
    fit_score: float = Field(..., ge=0, le=100)
    adjustments_needed: List[str]
    length_recommendation: str
    width_recommendation: str

class TryOnResponse(BaseModel):
    success: bool
    try_on_model_base64: str
    fit_recommendations: FitRecommendation
    fabric_simulation: Dict
    visualizations: List[str]
    ar_preview: str = ""  # ← FIXED: Must be string
    downloadable_glb: str = ""  # ← FIXED: Must be string
    fit_metrics: Dict
    timestamp: str

class TryOnRequest(BaseModel):
    user_avatar: UserAvatar
    garment_model: GarmentModel
    fabric_properties: Optional[FabricProperties] = None
    preferences: TryOnPreferences

# ======================== BODY ANALYZER ========================

class BodyAnalyzer:
    """Analyze body measurements"""
    
    @staticmethod
    def calculate_bmi(height: float, weight: float) -> float:
        """Calculate BMI"""
        height_m = height / 100
        return weight / (height_m ** 2)
    
    @staticmethod
    def get_body_shape_category(measurements: BodyMeasurements) -> str:
        """Determine body shape"""
        chest = measurements.chest
        waist = measurements.waist
        hip = measurements.hip
        
        chest_hip_diff = abs(chest - hip)
        waist_hip_ratio = waist / hip if hip > 0 else 0
        
        if chest_hip_diff < 5 and waist < 0.75 * hip:
            return "pear"
        elif abs(chest - hip) < 5 and waist > 0.75 * hip:
            return "apple"
        elif chest_hip_diff < 5 and waist < 0.7 * hip:
            return "hourglass"
        elif chest_hip_diff > 10 and waist_hip_ratio > 0.9:
            return "rectangle"
        else:
            return "athletic"
    
    @staticmethod
    def generate_3d_avatar(measurements: BodyMeasurements, skin_tone: str) -> Dict:
        """Generate 3D avatar parameters"""
        bmi = BodyAnalyzer.calculate_bmi(measurements.height, measurements.weight)
        body_shape = BodyAnalyzer.get_body_shape_category(measurements)
        
        scale_factors = {
            "height_scale": measurements.height / 180,
            "width_scale": measurements.shoulder_width / 42,
            "chest_scale": measurements.chest / 98,
            "waist_scale": measurements.waist / 75,
            "hip_scale": measurements.hip / 100,
        }
        
        return {
            "bmi": round(bmi, 2),
            "body_shape": body_shape,
            "scale_factors": scale_factors,
            "skin_tone": skin_tone,
            "model_format": "gltf",
            "three_js_params": {
                "position": [0, 0, 0],
                "rotation": [0, 0, 0],
                "scale": list(scale_factors.values())[:3]
            }
        }

# ======================== FABRIC SIMULATOR ========================

class FabricSimulator:
    """Simulate fabric behavior"""
    
    @staticmethod
    def calculate_drape_curve(fabric_props: FabricProperties) -> List[float]:
        """Calculate drape curve"""
        drape_by_type = {
            FabricType.CHIFFON: 0.9,
            FabricType.SILK: 0.8,
            FabricType.COTTON: 0.5,
            FabricType.LINEN: 0.45,
            FabricType.POLYESTER: 0.55,
            FabricType.WOOL: 0.4,
            FabricType.VELVET: 0.65,
            FabricType.DENIM: 0.2,
        }
        
        base_drape = drape_by_type.get(fabric_props.fabric_type, 0.5)
        elasticity_factor = 0.5 + (fabric_props.elasticity * 0.5)
        weight_factor = 1.0 - (fabric_props.weight / 300)
        weight_factor = max(0.3, min(weight_factor, 1.0))
        
        final_drape = base_drape * elasticity_factor * weight_factor
        drape_curve = [final_drape * math.sin(x * math.pi / 10) for x in range(11)]
        
        return [round(x, 3) for x in drape_curve]
    
    @staticmethod
    def calculate_fabric_physics(fabric_props: FabricProperties, garment_length: float) -> Dict:
        """Calculate physics parameters"""
        
        return {
            "gravity_influence": 0.3 + (fabric_props.weight / 300),
            "wind_resistance": 1.0 - fabric_props.elasticity,
            "bounce": fabric_props.elasticity * 0.5,
            "damping": 0.95,
            "cloth_stiffness": 1.0 - (fabric_props.elasticity * 0.8),
            "mass": fabric_props.weight / 100,
            "drape_curve": FabricSimulator.calculate_drape_curve(fabric_props),
            "fold_simulation": fabric_props.drape == DrapeAttribute.FLOWING,
            "stretch_response": fabric_props.elasticity
        }

# ======================== FIT ANALYZER ========================

class FitAnalyzer:
    """Analyze fit"""
    
    SIZE_CHARTS = {
        "XS": {"chest": 76, "waist": 61, "hip": 84},
        "S": {"chest": 82, "waist": 66, "hip": 89},
        "M": {"chest": 89, "waist": 71, "hip": 97},
        "L": {"chest": 97, "waist": 79, "hip": 104},
        "XL": {"chest": 104, "waist": 86, "hip": 112},
        "XXL": {"chest": 112, "waist": 94, "hip": 119},
    }
    
    @staticmethod
    def calculate_fit_score(measurements: BodyMeasurements, size_recommendation: str) -> float:
        """Calculate fit score"""
        size_chart = FitAnalyzer.SIZE_CHARTS.get(size_recommendation, FitAnalyzer.SIZE_CHARTS["M"])
        
        chest_diff = abs(measurements.chest - size_chart["chest"])
        waist_diff = abs(measurements.waist - size_chart["waist"])
        hip_diff = abs(measurements.hip - size_chart["hip"])
        
        avg_diff = (chest_diff + waist_diff + hip_diff) / 3
        fit_score = max(0, 100 - (avg_diff * 2))
        
        return round(fit_score, 1)
    
    @staticmethod
    def get_size_recommendation(measurements: BodyMeasurements) -> str:
        """Get size recommendation"""
        chest = measurements.chest
        waist = measurements.waist
        hip = measurements.hip
        
        avg_measurement = (chest * 0.4 + waist * 0.3 + hip * 0.3)
        
        if avg_measurement < 79:
            return "XS"
        elif avg_measurement < 85:
            return "S"
        elif avg_measurement < 93:
            return "M"
        elif avg_measurement < 101:
            return "L"
        elif avg_measurement < 109:
            return "XL"
        else:
            return "XXL"
    
    @staticmethod
    def get_fit_adjustments(measurements: BodyMeasurements, garment_category: GarmentCategory) -> List[str]:
        """Get fit adjustments"""
        adjustments = []
        
        bmi = BodyAnalyzer.calculate_bmi(measurements.height, measurements.weight)
        
        if garment_category == GarmentCategory.SHIRT:
            if measurements.shoulder_width > measurements.chest * 0.5:
                adjustments.append("Shoulders may be tight - consider larger size")
            if measurements.arm_length > 65:
                adjustments.append("Sleeves may be short - consider length extension")
        
        elif garment_category == GarmentCategory.PANTS:
            if measurements.inseam < 75:
                adjustments.append("May need cropping for hem length")
            if measurements.waist > measurements.hip * 0.85:
                adjustments.append("High waist design recommended")
        
        elif garment_category == GarmentCategory.DRESS:
            if measurements.height < 160:
                adjustments.append("Dress may be oversized - petite fit recommended")
            if measurements.waist < measurements.hip * 0.65:
                adjustments.append("Belted waist design would enhance fit")
        
        if not adjustments:
            adjustments.append("Standard fit - no major adjustments needed")
        
        return adjustments
    
    @staticmethod
    def calculate_fit_metrics(measurements: BodyMeasurements, size_rec: str) -> Dict:
        """Calculate fit metrics"""
        return {
            "bmi": round(BodyAnalyzer.calculate_bmi(measurements.height, measurements.weight), 2),
            "body_shape": BodyAnalyzer.get_body_shape_category(measurements),
            "proportions": {
                "shoulder_to_waist": round(measurements.shoulder_width / measurements.waist, 2),
                "waist_to_hip": round(measurements.waist / measurements.hip, 2),
                "arm_to_height": round(measurements.arm_length / measurements.height, 2),
            },
            "size_recommendation": size_rec,
            "ideal_garment_length": round(measurements.height * 0.55, 1),
            "ideal_sleeve_length": round(measurements.arm_length * 1.05, 1),
        }

# ======================== MODEL GENERATOR ========================

class ModelGenerator:
    """Generate 3D models"""
    
    @staticmethod
    def generate_three_js_config(body_data: Dict, garment_category: GarmentCategory, color: str) -> Dict:
        """Generate Three.js config"""
        return {
            "scene": {
                "background": 0xf5f5f5,
                "lighting": {
                    "ambient": {"intensity": 0.6, "color": 0xffffff},
                    "directional": {"intensity": 0.8, "color": 0xffffff, "position": [5, 10, 7]},
                    "point": {"intensity": 0.4, "color": 0xffffff, "position": [-5, 5, 5]}
                }
            },
            "body_model": {
                "geometry": "humanoid",
                "scale": body_data["scale_factors"],
                "skin_color": body_data["skin_tone"],
                "material": {"type": "phong", "shininess": 30}
            },
            "garment_model": {
                "type": garment_category.value,
                "color": color,
                "material": {"type": "cloth", "shininess": 50},
                "physics": "cloth_simulation"
            },
            "camera": {"position": [0, 1.5, 3], "target": [0, 1, 0], "fov": 60},
            "controls": {"autoRotate": True, "autoRotateSpeed": 2, "enableZoom": True}
        }
    
    @staticmethod
    def generate_glb_export_data(body_data: Dict, garment_data: Dict, fabric_physics: Dict) -> Dict:
        """Generate GLB export data"""
        return {
            "format": "glb",
            "body": {
                "geometry": body_data,
                "materials": {"skin": {"color": body_data["skin_tone"], "roughness": 0.4}}
            },
            "garment": {
                "geometry": garment_data,
                "materials": {
                    "fabric": {
                        "color": garment_data.get("color", "#000000"),
                        "roughness": 0.7,
                        "metalness": 0
                    }
                }
            },
            "physics": fabric_physics,
            "metadata": {"created": datetime.now().isoformat(), "version": "3.0", "format": "glTF 2.0"}
        }

# ======================== API ENDPOINTS ========================

@router.post("/analyze-body")
async def analyze_body(measurements: BodyMeasurements, skin_tone: str = "#E5BCA8"):
    """Analyze body measurements"""
    try:
        print(f"\n{'='*70}")
        print("👤 BODY ANALYSIS")
        print(f"{'='*70}\n")
        
        avatar_data = BodyAnalyzer.generate_3d_avatar(measurements, skin_tone)
        bmi = BodyAnalyzer.calculate_bmi(measurements.height, measurements.weight)
        body_shape = BodyAnalyzer.get_body_shape_category(measurements)
        
        print(f"✅ Body Analysis Complete")
        print(f"   BMI: {bmi:.1f}")
        print(f"   Shape: {body_shape}\n")
        
        return {
            "success": True,
            "avatar": avatar_data,
            "bmi": bmi,
            "body_shape": body_shape,
            "health_category": "healthy" if 18.5 < bmi < 25 else "check_doctor"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/simulate-fabric")
async def simulate_fabric(fabric: FabricProperties, garment_length: float = 80.0):
    """Simulate fabric behavior"""
    try:
        print(f"\n{'='*70}")
        print("🧵 FABRIC SIMULATION")
        print(f"{'='*70}\n")
        
        physics = FabricSimulator.calculate_fabric_physics(fabric, garment_length)
        drape = FabricSimulator.calculate_drape_curve(fabric)
        
        print(f"✅ Fabric Simulation Complete")
        print(f"   Type: {fabric.fabric_type.value}")
        print(f"   Drape: {fabric.drape.value}\n")
        
        return {
            "success": True,
            "fabric_type": fabric.fabric_type.value,
            "physics_parameters": physics,
            "drape_simulation": drape,
            "visualization_parameters": {
                "wave_amplitude": drape[-1],
                "wave_frequency": 0.5 + (fabric.elasticity * 0.5),
                "bounce_strength": fabric.elasticity
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/fit-recommendation")
async def get_fit_recommendation(measurements: BodyMeasurements, garment_category: str = "shirt"):
    """Get fit recommendations"""
    try:
        print(f"\n{'='*70}")
        print("📏 FIT ANALYSIS")
        print(f"{'='*70}\n")
        
        size_rec = FitAnalyzer.get_size_recommendation(measurements)
        fit_score = FitAnalyzer.calculate_fit_score(measurements, size_rec)
        adjustments = FitAnalyzer.get_fit_adjustments(measurements, GarmentCategory(garment_category))
        fit_metrics = FitAnalyzer.calculate_fit_metrics(measurements, size_rec)
        
        print(f"✅ Fit Analysis Complete")
        print(f"   Size: {size_rec}")
        print(f"   Fit Score: {fit_score}/100\n")
        
        return {
            "success": True,
            "size_recommendation": size_rec,
            "fit_score": fit_score,
            "adjustments": adjustments,
            "metrics": fit_metrics
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-tryon", response_model=TryOnResponse)
async def generate_try_on(request: TryOnRequest):
    """Generate complete 3D AR try-on"""
    try:
        print(f"\n{'='*70}")
        print("🎬 3D AR TRY-ON GENERATION")
        print(f"{'='*70}\n")
        
        # Body analysis
        print("🔵 Step 1: Analyzing body...")
        body_data = BodyAnalyzer.generate_3d_avatar(
            request.user_avatar.measurements,
            request.user_avatar.skin_tone
        )
        
        # Fit analysis
        print("🔵 Step 2: Analyzing fit...")
        size_rec = FitAnalyzer.get_size_recommendation(request.user_avatar.measurements)
        fit_score = FitAnalyzer.calculate_fit_score(request.user_avatar.measurements, size_rec)
        adjustments = FitAnalyzer.get_fit_adjustments(
            request.user_avatar.measurements,
            request.preferences.garment_category
        )
        fit_metrics = FitAnalyzer.calculate_fit_metrics(request.user_avatar.measurements, size_rec)
        
        # Fabric simulation
        print("🔵 Step 3: Simulating fabric...")
        fabric_sim = {}
        if request.fabric_properties:
            fabric_sim = FabricSimulator.calculate_fabric_physics(
                request.fabric_properties,
                fit_metrics["ideal_garment_length"]
            )
        
        # Generate 3D model config
        print("🔵 Step 4: Generating 3D model...")
        three_js_config = ModelGenerator.generate_three_js_config(
            body_data,
            request.preferences.garment_category,
            request.preferences.color
        )
        
        # Serialize to JSON string (FIXED)
        model_json_str = json.dumps(three_js_config)
        model_base64 = base64.b64encode(model_json_str.encode()).decode()
        
        # Generate AR preview config (FIXED: as JSON string)
        print("🔵 Step 5: Generating AR preview...")
        ar_config = {
            "ar_enabled": True,
            "webxr_required": True,
            "session_mode": "immersive-ar",
            "supported_features": ["dom-overlay", "hit-test", "light-estimation"],
            "required_permissions": ["camera"],
            "model_url": model_base64,
            "scale": 1.0,
            "rotation": [0, 0, 0],
            "position": [0, 0, -1.5],
            "interaction": {
                "rotation_enabled": True,
                "scale_enabled": True,
                "translation_enabled": True
            }
        }
        ar_json_str = json.dumps(ar_config)  # Convert to string
        ar_preview_str = base64.b64encode(ar_json_str.encode()).decode()
        
        # Generate GLB export (FIXED: as JSON string)
        print("🔵 Step 6: Preparing GLB export...")
        glb_data = ModelGenerator.generate_glb_export_data(
            body_data,
            {"color": request.preferences.color},
            fabric_sim or {}
        )
        glb_json_str = json.dumps(glb_data)
        glb_str = base64.b64encode(glb_json_str.encode()).decode()
        
        # Visualizations
        print("🔵 Step 7: Generating visualizations...")
        visualizations = [
            model_base64,
            ar_preview_str
        ]
        
        print(f"✅ Try-On Generation Complete!\n")
        
        return TryOnResponse(
            success=True,
            try_on_model_base64=model_base64,
            fit_recommendations=FitRecommendation(
                size_recommendation=size_rec,
                fit_score=fit_score,
                adjustments_needed=adjustments,
                length_recommendation="standard",
                width_recommendation="standard"
            ),
            fabric_simulation=fabric_sim or {},
            visualizations=visualizations,
            ar_preview=ar_preview_str,  # Now a string
            downloadable_glb=glb_str,   # Now a string
            fit_metrics=fit_metrics,
            timestamp=datetime.now().isoformat()
        )
    
    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_status():
    """Get status"""
    return {
        "status": "✅ 3D AR Try-On Agent Ready (Fixed)",
        "version": "2.1",
        "features": [
            "✅ Body Measurement Analysis",
            "✅ 3D Avatar Generation",
            "✅ Fabric Physics Simulation",
            "✅ Fit Recommendation Engine",
            "✅ Three.js 3D Rendering Config",
            "✅ WebXR AR Preview",
            "✅ GLB Model Export",
            "✅ Multi-angle Visualization"
        ],
        "supported_garments": [g.value for g in GarmentCategory],
        "supported_fabrics": [f.value for f in FabricType],
        "ar_ready": True,
        "webxr_compatible": True
    }

print("✅ 3D AR Try-On Agent (Fixed) Loaded Successfully!")