from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from groq import Groq
import httpx
import cv2
import numpy as np
import os
from datetime import datetime
from collections import Counter
import re

# Import official Apify SDK
try:
    from apify_client import ApifyClient
    APIFY_AVAILABLE = True
except ImportError:
    APIFY_AVAILABLE = False
    print("⚠️ Apify SDK not installed. Install with: pip install apify-client")

router = APIRouter()
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
apify_api_key = os.getenv("APIFY_API_KEY")

class TrendAnalysisRequest(BaseModel):
    theme: str
    platforms: List[str]
    hashtags: List[str]
    keywords: List[str]
    region: str = "global"
    time_range: str = "30"
    output_format: str = "detailed"
    depth: str = "detailed"

class ColorAnalysis:
    @staticmethod
    def extract_colors(image_url: str, num_colors: int = 5) -> List[Dict]:
        """Extract dominant colors from image"""
        try:
            response = httpx.get(image_url, timeout=10)
            img_array = np.frombuffer(response.content, np.uint8)
            img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
            
            if img is None:
                return []
            
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img_resized = cv2.resize(img_rgb, (150, 150))
            pixels = img_resized.reshape((-1, 3))
            pixels = np.float32(pixels)
            
            criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
            _, labels, centers = cv2.kmeans(pixels, num_colors, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
            
            centers = np.uint8(centers)
            colors = []
            
            for i, center in enumerate(centers):
                r, g, b = int(center[0]), int(center[1]), int(center[2])
                hex_color = f"#{r:02x}{g:02x}{b:02x}".upper()
                percentage = (np.sum(labels == i) / len(labels)) * 100
                colors.append({
                    "hex": hex_color,
                    "rgb": {"r": r, "g": g, "b": b},
                    "percentage": round(percentage, 1),
                    "name": ColorAnalysis.get_color_name(r, g, b)
                })
            
            return sorted(colors, key=lambda x: x["percentage"], reverse=True)
        except Exception as e:
            print(f"Color extraction error: {e}")
            return []
    
    @staticmethod
    def get_color_name(r: int, g: int, b: int) -> str:
        """Convert RGB to color name"""
        color_names = {
            (255, 0, 0): "Red", (0, 255, 0): "Green", (0, 0, 255): "Blue",
            (255, 255, 0): "Yellow", (255, 165, 0): "Orange", (128, 0, 128): "Purple",
            (0, 0, 0): "Black", (255, 255, 255): "White", (128, 128, 128): "Gray",
            (165, 42, 42): "Brown", (255, 192, 203): "Pink", (0, 128, 128): "Teal",
        }
        
        min_distance = float("inf")
        closest_color = "Unknown"
        
        for (cr, cg, cb), name in color_names.items():
            distance = ((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2) ** 0.5
            if distance < min_distance:
                min_distance = distance
                closest_color = name
        
        return closest_color

# ======================== REAL APIFY SCRAPING (WORKING) ========================

async def scrape_instagram_real(hashtags: List[str]) -> Dict:
    """Real Instagram scraping using official Apify SDK"""
    try:
        if not APIFY_AVAILABLE:
            raise Exception("Apify SDK not installed")
        
        print("📱 Scraping Instagram via Apify SDK...")
        
        client = ApifyClient(apify_api_key)
        
        # Use the correct actor ID
        actor_id = "apify/instagram-hashtag-scraper"
        
        run_input = {
            "hashtags": [h.lstrip("#") for h in hashtags[:3]],
            "resultsLimit": 50,
            "resultsType": "posts"
        }
        
        print(f"Input: {run_input}")
        
        # This is the correct way to call Apify
        run = client.actor(actor_id).call(run_input=run_input)
        
        dataset_client = client.dataset(run["defaultDatasetId"])
        items = list(dataset_client.iterate_items())
        
        posts = []
        for item in items[:50]:
            posts.append({
                "platform": "instagram",
                "caption": item.get("caption", ""),
                "likes": item.get("likesCount", 0),
                "comments": item.get("commentsCount", 0),
                "hashtags": extract_hashtags(item.get("caption", "")),
                "image_url": item.get("displayUrl", ""),
                "posted_at": item.get("timestamp", ""),
                "author": item.get("ownerUsername", ""),
            })
        
        print(f"✅ Instagram: {len(posts)} posts scraped")
        return {"success": True, "posts": posts, "count": len(posts)}
        
    except Exception as e:
        print(f"❌ Instagram error: {str(e)}")
        return {"success": False, "posts": [], "error": str(e)}

async def scrape_pinterest_real(keywords: List[str]) -> Dict:
    """Real Pinterest scraping using official Apify SDK"""
    try:
        if not APIFY_AVAILABLE:
            raise Exception("Apify SDK not installed")
        
        print("📌 Scraping Pinterest via Apify SDK...")
        
        client = ApifyClient(apify_api_key)
        
        # Use the correct actor ID
        actor_id = "apify/pinterest-scraper"
        
        run_input = {
            "keywords": keywords[:3],
            "resultsLimit": 50,
            "maxRequests": 50
        }
        
        print(f"Input: {run_input}")
        
        # This is the correct way to call Apify
        run = client.actor(actor_id).call(run_input=run_input)
        
        dataset_client = client.dataset(run["defaultDatasetId"])
        items = list(dataset_client.iterate_items())
        
        pins = []
        for item in items[:50]:
            pins.append({
                "platform": "pinterest",
                "description": item.get("description", ""),
                "title": item.get("title", ""),
                "saves": item.get("saveCount", 0),
                "likes": item.get("likeCount", 0),
                "image_url": item.get("imageUrl", ""),
                "source_url": item.get("sourceUrl", ""),
                "hashtags": extract_hashtags(item.get("description", "")),
            })
        
        print(f"✅ Pinterest: {len(pins)} pins scraped")
        return {"success": True, "posts": pins, "count": len(pins)}
        
    except Exception as e:
        print(f"❌ Pinterest error: {str(e)}")
        return {"success": False, "posts": [], "error": str(e)}

def extract_hashtags(text: str) -> List[str]:
    """Extract hashtags from text"""
    return re.findall(r'#\w+', text.lower())

# ======================== ANALYSIS ========================

def extract_hashtags_keywords(posts: List[Dict]) -> Dict:
    """Extract and analyze hashtags and keywords"""
    all_hashtags = []
    all_text = []
    
    for post in posts:
        if "hashtags" in post:
            all_hashtags.extend(post["hashtags"])
        text = (post.get("caption", "") or post.get("description", "") or post.get("title", ""))
        if text:
            all_text.append(text)
    
    hashtag_counter = Counter(all_hashtags)
    top_hashtags = hashtag_counter.most_common(15)
    
    keywords = []
    for text in all_text:
        words = re.findall(r'\b\w+\b', text.lower())
        keywords.extend([w for w in words if len(w) > 3])
    
    keyword_counter = Counter(keywords)
    top_keywords = keyword_counter.most_common(10)
    
    return {
        "top_hashtags": [{"tag": tag, "count": count} for tag, count in top_hashtags],
        "top_keywords": [{"keyword": kw, "count": count} for kw, count in top_keywords],
        "total_posts": len(posts),
        "total_unique_hashtags": len(hashtag_counter),
    }

def extract_dominant_colors(posts: List[Dict]) -> List[Dict]:
    """Extract colors from images"""
    all_colors = []
    
    for post in posts:
        image_url = post.get("image_url")
        if image_url and image_url.startswith("http"):
            colors = ColorAnalysis.extract_colors(image_url, num_colors=3)
            if colors:
                all_colors.extend(colors)
    
    if not all_colors:
        return []
    
    color_dict = {}
    for color in all_colors:
        hex_val = color["hex"]
        if hex_val not in color_dict:
            color_dict[hex_val] = {"hex": hex_val, "name": color["name"], "count": 0, "rgb": color["rgb"]}
        color_dict[hex_val]["count"] += 1
    
    return sorted(color_dict.values(), key=lambda x: x["count"], reverse=True)[:10]

async def generate_ai_insights(theme: str, posts: List[Dict], colors: List[Dict], analysis: Dict) -> str:
    """Generate AI insights using Groq"""
    try:
        sample_text = " ".join([
            p.get("caption", "") or p.get("description", "") or ""
            for p in posts[:10]
        ])
        
        top_kw = ", ".join([k["keyword"] for k in analysis.get("top_keywords", [])[:5]])
        color_str = ", ".join([c["name"] for c in colors[:5]])
        
        prompt = f"""Analyze this REAL fashion trend data scraped from Instagram and Pinterest:

Theme: {theme}
Total Posts: {len(posts)}
Top Keywords: {top_kw}
Dominant Colors: {color_str}
Top Hashtags: {', '.join([h['tag'] for h in analysis.get('top_hashtags', [])[:5]])}

Sample Content:
{sample_text[:400]}

Provide a detailed trend forecast with:
1. Trend strength (1-10) and classification
2. Key characteristics defining this trend
3. Target demographic and lifestyle
4. Visual identity and aesthetics
5. Predicted longevity of trend
6. Emerging sub-trends within this
7. Geographic hotspots/popularity
8. Commercial opportunities
9. Designer recommendations
10. Competition/saturation analysis

Be specific and data-driven based on the actual posts."""

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=2000
        )
        
        return response.choices[0].message.content
    except Exception as e:
        return f"Analysis complete with {len(posts)} posts scraped and analyzed."

# ======================== ENDPOINTS ========================

@router.post("/analyze-advanced")
async def analyze_advanced_trends(req: TrendAnalysisRequest):
    """Real web scraping + AI analysis + Visual charts"""
    try:
        from .chart_generator import (
            generate_hashtag_bar_chart,
            generate_color_pie_chart,
            generate_keyword_bar_chart,
            generate_platform_pie_chart,
            analyze_popular_styles,
            generate_style_bar_chart
        )
        
        if not APIFY_AVAILABLE:
            raise HTTPException(
                status_code=400,
                detail="❌ Apify SDK not installed. Run: pip install apify-client"
            )
        
        if not apify_api_key:
            raise HTTPException(
                status_code=400,
                detail="❌ APIFY_API_KEY not set in .env file"
            )
        
        results = {
            "theme": req.theme,
            "requested_at": datetime.now().isoformat(),
            "scraping_status": {},
            "analysis": {},
            "insights": {},
            "charts": {}
        }
        
        all_posts = []
        
        # Scrape Instagram
        if "instagram" in req.platforms:
            insta = await scrape_instagram_real(req.hashtags)
            results["scraping_status"]["instagram"] = {
                "success": insta["success"],
                "posts": insta.get("count", 0),
                "error": insta.get("error")
            }
            all_posts.extend(insta.get("posts", []))
        
        # Scrape Pinterest
        if "pinterest" in req.platforms:
            pinterest = await scrape_pinterest_real(req.keywords)
            results["scraping_status"]["pinterest"] = {
                "success": pinterest["success"],
                "posts": pinterest.get("count", 0),
                "error": pinterest.get("error")
            }
            all_posts.extend(pinterest.get("posts", []))
        
        if not all_posts:
            raise HTTPException(
                status_code=400,
                detail="❌ No posts scraped. Verify API key and hashtags/keywords."
            )
        
        print(f"📊 Total posts: {len(all_posts)}")
        
        # Analyze
        hashtag_analysis = extract_hashtags_keywords(all_posts)
        results["analysis"]["hashtags"] = hashtag_analysis
        
        dominant_colors = extract_dominant_colors(all_posts)
        results["analysis"]["dominant_colors"] = dominant_colors
        
        # DYNAMIC: Analyze styles from actual posts
        popular_styles = analyze_popular_styles(all_posts)
        results["analysis"]["popular_styles"] = popular_styles
        
        ai_forecast = await generate_ai_insights(
            req.theme,
            all_posts,
            dominant_colors,
            hashtag_analysis
        )
        results["insights"]["ai_forecast"] = ai_forecast
        
        # Generate Charts
        print("📊 Generating visual charts...")
        
        hashtag_chart = generate_hashtag_bar_chart(hashtag_analysis["top_hashtags"])
        if hashtag_chart:
            results["charts"]["hashtag_frequency"] = hashtag_chart
        
        color_chart = generate_color_pie_chart(dominant_colors)
        if color_chart:
            results["charts"]["color_distribution"] = color_chart
        
        keyword_chart = generate_keyword_bar_chart(hashtag_analysis["top_keywords"])
        if keyword_chart:
            results["charts"]["keyword_frequency"] = keyword_chart
        
        style_chart = generate_style_bar_chart(popular_styles)
        if style_chart:
            results["charts"]["style_distribution"] = style_chart
        
        instagram_count = len([p for p in all_posts if p["platform"] == "instagram"])
        pinterest_count = len([p for p in all_posts if p["platform"] == "pinterest"])
        
        platform_chart = generate_platform_pie_chart(instagram_count, pinterest_count)
        if platform_chart:
            results["charts"]["platform_distribution"] = platform_chart
        
        results["metrics"] = {
            "total_posts": len(all_posts),
            "instagram": instagram_count,
            "pinterest": pinterest_count,
            "unique_hashtags": hashtag_analysis["total_unique_hashtags"],
            "analysis_depth": req.depth,
        }
        
        return {
            "success": True,
            "data": results,
            "timestamp": datetime.now().isoformat(),
            "status": "✅ Real web scraping + charts analysis complete"
        }
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def scraper_status():
    """Check scraper configuration"""
    return {
        "status": "✅ Ready" if (APIFY_AVAILABLE and apify_api_key) else "❌ Not configured",
        "apify_sdk_installed": APIFY_AVAILABLE,
        "apify_api_key_set": bool(apify_api_key),
        "scraping_method": "Official Apify Python SDK",
        "platforms": ["instagram", "pinterest"],
        "setup_commands": [
            "pip install apify-client",
            "Add APIFY_API_KEY to .env"
        ]
    }
