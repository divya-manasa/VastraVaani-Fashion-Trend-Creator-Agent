from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import json
import os

router = APIRouter()

# Simple file-based storage (replace with DB in production)
BOOKMARKS_FILE = "bookmarks.json"

class Bookmark(BaseModel):
    title: str
    content: str
    category: str
    tags: List[str] = []

@router.get("/list")
async def list_bookmarks():
    """Get all bookmarks"""
    try:
        if os.path.exists(BOOKMARKS_FILE):
            with open(BOOKMARKS_FILE, 'r') as f:
                bookmarks = json.load(f)
        else:
            bookmarks = []
        
        return {"success": True, "bookmarks": bookmarks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/add")
async def add_bookmark(bookmark: Bookmark):
    """Add a new bookmark"""
    try:
        if os.path.exists(BOOKMARKS_FILE):
            with open(BOOKMARKS_FILE, 'r') as f:
                bookmarks = json.load(f)
        else:
            bookmarks = []
        
        bookmarks.append(bookmark.dict())
        
        with open(BOOKMARKS_FILE, 'w') as f:
            json.dump(bookmarks, f, indent=2)
        
        return {"success": True, "message": "Bookmark added"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/{index}")
async def delete_bookmark(index: int):
    """Delete a bookmark"""
    try:
        with open(BOOKMARKS_FILE, 'r') as f:
            bookmarks = json.load(f)
        
        if 0 <= index < len(bookmarks):
            del bookmarks[index]
            
            with open(BOOKMARKS_FILE, 'w') as f:
                json.dump(bookmarks, f, indent=2)
            
            return {"success": True, "message": "Bookmark deleted"}
        else:
            raise HTTPException(status_code=404, detail="Bookmark not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
