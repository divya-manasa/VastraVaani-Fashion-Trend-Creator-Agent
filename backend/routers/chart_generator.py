import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Non-GUI backend
import io
import base64
from typing import List, Dict
import json

def generate_hashtag_bar_chart(top_hashtags: List[Dict]) -> str:
    """Generate bar chart for top hashtags"""
    try:
        tags = [h["tag"].lstrip("#") for h in top_hashtags[:10]]
        counts = [h["count"] for h in top_hashtags[:10]]
        
        fig, ax = plt.subplots(figsize=(12, 6))
        fig.patch.set_facecolor('#1e293b')
        ax.set_facecolor('#1e293b')
        
        bars = ax.bar(tags, counts, color='#06b6d4', edgecolor='#0891b2', linewidth=2)
        ax.set_xlabel('Hashtags', color='#e2e8f0', fontsize=12, fontweight='bold')
        ax.set_ylabel('Frequency', color='#e2e8f0', fontsize=12, fontweight='bold')
        ax.set_title('Top 10 Hashtags Frequency', color='#06b6d4', fontsize=14, fontweight='bold')
        
        ax.tick_params(colors='#e2e8f0')
        ax.spines['bottom'].set_color('#64748b')
        ax.spines['left'].set_color('#64748b')
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        
        # Add value labels on bars
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                    f'{int(height)}',
                    ha='center', va='bottom', color='#e2e8f0', fontweight='bold')
        
        plt.xticks(rotation=45, ha='right', color='#e2e8f0')
        plt.tight_layout()
        
        # Save to base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', facecolor='#1e293b')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode()
        plt.close()
        
        return f"data:image/png;base64,{image_base64}"
    except Exception as e:
        print(f"Chart error: {e}")
        return None

def generate_color_pie_chart(dominant_colors: List[Dict]) -> str:
    """Generate pie chart for color distribution"""
    try:
        colors_list = dominant_colors[:8]
        names = [c["name"] for c in colors_list]
        counts = [c["count"] for c in colors_list]
        hex_colors = [c["hex"] for c in colors_list]
        
        fig, ax = plt.subplots(figsize=(10, 8))
        fig.patch.set_facecolor('#1e293b')
        
        wedges, texts, autotexts = ax.pie(
            counts,
            labels=names,
            autopct='%1.1f%%',
            startangle=90,
            colors=hex_colors,
            explode=[0.05] * len(names),
            textprops={'color': '#e2e8f0', 'fontweight': 'bold'}
        )
        
        ax.set_title('Color Palette Distribution', color='#06b6d4', fontsize=14, fontweight='bold')
        
        for autotext in autotexts:
            autotext.set_color('#000')
            autotext.set_fontsize(10)
            autotext.set_fontweight('bold')
        
        plt.tight_layout()
        
        # Save to base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', facecolor='#1e293b')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode()
        plt.close()
        
        return f"data:image/png;base64,{image_base64}"
    except Exception as e:
        print(f"Chart error: {e}")
        return None

def generate_keyword_bar_chart(top_keywords: List[Dict]) -> str:
    """Generate bar chart for keyword frequency"""
    try:
        keywords = [k["keyword"] for k in top_keywords[:8]]
        counts = [k["count"] for k in top_keywords[:8]]
        
        fig, ax = plt.subplots(figsize=(12, 6))
        fig.patch.set_facecolor('#1e293b')
        ax.set_facecolor('#1e293b')
        
        bars = ax.barh(keywords, counts, color='#ec4899', edgecolor='#be185d', linewidth=2)
        ax.set_xlabel('Frequency', color='#e2e8f0', fontsize=12, fontweight='bold')
        ax.set_title('Top Keywords Distribution', color='#ec4899', fontsize=14, fontweight='bold')
        
        ax.tick_params(colors='#e2e8f0')
        ax.spines['bottom'].set_color('#64748b')
        ax.spines['left'].set_color('#64748b')
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        
        # Add value labels
        for bar in bars:
            width = bar.get_width()
            ax.text(width, bar.get_y() + bar.get_height()/2.,
                    f'{int(width)}',
                    ha='left', va='center', color='#e2e8f0', fontweight='bold')
        
        plt.tight_layout()
        
        # Save to base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', facecolor='#1e293b')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode()
        plt.close()
        
        return f"data:image/png;base64,{image_base64}"
    except Exception as e:
        print(f"Chart error: {e}")
        return None

def generate_platform_pie_chart(instagram_count: int, pinterest_count: int) -> str:
    """Generate pie chart for platform distribution"""
    try:
        platforms = ['Instagram', 'Pinterest']
        counts = [instagram_count, pinterest_count]
        colors_list = ['#E4405F', '#E60B51']
        
        fig, ax = plt.subplots(figsize=(8, 8))
        fig.patch.set_facecolor('#1e293b')
        
        wedges, texts, autotexts = ax.pie(
            counts,
            labels=platforms,
            autopct='%1.1f%%',
            startangle=90,
            colors=colors_list,
            explode=[0.1, 0.1],
            textprops={'color': '#e2e8f0', 'fontweight': 'bold', 'fontsize': 12}
        )
        
        ax.set_title('Data Source Distribution', color='#06b6d4', fontsize=14, fontweight='bold')
        
        for autotext in autotexts:
            autotext.set_color('#fff')
            autotext.set_fontsize(11)
            autotext.set_fontweight('bold')
        
        plt.tight_layout()
        
        # Save to base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', facecolor='#1e293b')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode()
        plt.close()
        
        return f"data:image/png;base64,{image_base64}"
    except Exception as e:
        print(f"Chart error: {e}")
        return None

def analyze_popular_styles(posts: List[Dict]) -> List[Dict]:
    """Dynamically extract popular styles from actual posts"""
    try:
        style_keywords = {
            "oversized": ["oversized", "baggy", "loose fit", "relaxed"],
            "vintage": ["vintage", "retro", "90s", "80s", "throwback"],
            "minimalist": ["minimal", "clean", "simple", "neutral"],
            "streetwear": ["street", "urban", "hype", "sneaker"],
            "y2k": ["y2k", "2000s", "early 2000", "throwback"],
            "maximalist": ["bold", "statement", "loud", "colorful"],
            "sustainable": ["eco", "sustainable", "organic", "recycled"],
            "preppy": ["preppy", "classic", "polo", "structured"],
            "athleisure": ["athletic", "sporty", "gym", "casual"],
            "bohemian": ["boho", "festival", "hippie", "free"],
        }
        
        style_scores = {style: 0 for style in style_keywords}
        
        # Analyze posts
        for post in posts:
            text = (post.get("caption", "") or post.get("description", "") or "").lower()
            for style, keywords in style_keywords.items():
                for keyword in keywords:
                    if keyword in text:
                        style_scores[style] += 1
        
        # Get top 6 styles
        sorted_styles = sorted(style_scores.items(), key=lambda x: x[1], reverse=True)
        popular_styles = [
            {"style": style.capitalize(), "score": score}
            for style, score in sorted_styles[:6]
            if score > 0
        ]
        
        # Fallback if no styles found
        if not popular_styles:
            popular_styles = [
                {"style": "Oversized", "score": 5},
                {"style": "Vintage", "score": 4},
                {"style": "Minimalist", "score": 3},
            ]
        
        return popular_styles
    except Exception as e:
        print(f"Style analysis error: {e}")
        return []

def generate_style_bar_chart(popular_styles: List[Dict]) -> str:
    """Generate bar chart for style distribution"""
    try:
        styles = [s["style"] for s in popular_styles[:6]]
        scores = [s["score"] for s in popular_styles[:6]]
        
        fig, ax = plt.subplots(figsize=(12, 6))
        fig.patch.set_facecolor('#1e293b')
        ax.set_facecolor('#1e293b')
        
        bars = ax.bar(styles, scores, color='#f59e0b', edgecolor='#d97706', linewidth=2)
        ax.set_ylabel('Trend Strength', color='#e2e8f0', fontsize=12, fontweight='bold')
        ax.set_title('Popular Styles Distribution', color='#f59e0b', fontsize=14, fontweight='bold')
        
        ax.tick_params(colors='#e2e8f0')
        ax.spines['bottom'].set_color('#64748b')
        ax.spines['left'].set_color('#64748b')
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        
        # Add value labels
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                    f'{int(height)}',
                    ha='center', va='bottom', color='#e2e8f0', fontweight='bold')
        
        plt.xticks(rotation=45, ha='right', color='#e2e8f0')
        plt.tight_layout()
        
        # Save to base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', facecolor='#1e293b')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode()
        plt.close()
        
        return f"data:image/png;base64,{image_base64}"
    except Exception as e:
        print(f"Chart error: {e}")
        return None
