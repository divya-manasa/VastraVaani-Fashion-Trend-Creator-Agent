
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers.auth_router import router as auth_router
from database import engine, Base
import os

load_dotenv()

from routers import ( 
    stylist, 
    pricing, 
    bookmarks, 
    advanced_trends, 
    design_generator,
    fabric_recommender,  # NEW IMPORT
    color_pattern_analyzer,
    ar_tryon_agent ,
    auth_router # NEW IMPORT
)
Base.metadata.create_all(bind=engine)
app = FastAPI(title="VastraVaani AI Platform", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost",
        "http://127.0.0.1"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,
)

# Include all routers
app.include_router(advanced_trends.router, prefix="/api/advanced-trends", tags=["Advanced Trends"])
app.include_router(stylist.router, prefix="/api/stylist", tags=["Stylist"])
app.include_router(pricing.router, prefix="/api/pricing", tags=["Pricing"])
app.include_router(bookmarks.router, prefix="/api/bookmarks", tags=["Bookmarks"])
app.include_router(design_generator.router, prefix="/api/design-generator", tags=["Design Generator"])
app.include_router(fabric_recommender.router, prefix="/api/fabric-recommender", tags=["Fabric Recommender"])  # NEW ROUTER
app.include_router(
    color_pattern_analyzer.router,
    prefix="/api/color-pattern-analyzer",
    tags=["Color & Pattern Analyzer"]
)
app.include_router(
    ar_tryon_agent.router,
    prefix="/api/ar-tryon",
    tags=["3D AR Try-On Agent"]
)
app.include_router(auth_router.router, prefix="/api/auth", tags=["authentication"])
@app.get("/")
def root():
    return {
        "message": "VastraVaani AI Platform v3.0",
        "status": "running",
        "features": [
            "Trend Prediction (Groq AI)",
            "Advanced Trend Analysis (Web Scraping)",
            "AI Design Generator (SDXL)",
            "Fabric Recommendations",
            "Fabric Recommender Agent (NEW) 🧵",  # NEW FEATURE
            "Color Palette Generator",
            "Personal Stylist Chat",
            "Smart Pricing Strategy",
            "Knowledge Bookmarks"
        ]
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "groq_configured": bool(os.getenv("GROQ_API_KEY")),
        "apify_configured": bool(os.getenv("APIFY_API_KEY")),
        "huggingface_configured": bool(os.getenv("HUGGINGFACE_API_KEY"))
    }
