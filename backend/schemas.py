from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    """Base user schema"""
    name: str
    email: EmailStr

class UserCreate(UserBase):
    """User creation schema"""
    password: str

class UserUpdate(BaseModel):
    """User update schema"""
    name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    company: Optional[str] = None

class User(UserBase):
    """User response schema"""
    id: int
    plan: str
    location: Optional[str]
    phone: Optional[str]
    bio: Optional[str]
    company: Optional[str]
    photo: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    """Login request schema"""
    email: EmailStr
    password: str

class Token(BaseModel):
    """Token schema"""
    access_token: str
    token_type: str = "bearer"

class LoginResponse(BaseModel):
    """Login response schema"""
    access_token: str
    token_type: str
    user: User
