
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserCreate, LoginRequest, LoginResponse, User as UserSchema, UserUpdate

# ⚠️ IMPORTANT: Import from auth.py (utilities), NOT from this file!
# Make sure you have auth.py (utilities) and auth_router.py (this file) as separate files
from auth import hash_password, verify_password, create_access_token, verify_token

from datetime import timedelta
from config import settings

router = APIRouter()

# ========================= REGISTER ENDPOINT =========================

@router.post("/register", response_model=LoginResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account
    
    - **name**: User's full name
    - **email**: Valid email address (will be username)
    - **password**: Password (will be hashed with Argon2)
    
    Returns JWT token and user info
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user with hashed password
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        plan="Free"  # Default plan
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate JWT token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email},
        expires_delta=access_token_expires
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserSchema.from_orm(new_user)
    )

# ========================= LOGIN ENDPOINT =========================

@router.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """
    Login with email and password
    
    - **email**: Your registered email
    - **password**: Your password
    
    Returns JWT token for authenticated requests
    """
    # Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()
    
    # Verify user exists and password matches
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Check if account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Contact support."
        )
    
    # Generate JWT token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserSchema.from_orm(user)
    )

# ========================= GET PROFILE ENDPOINT =========================

@router.get("/profile", response_model=dict)
def get_profile(token: str = None, db: Session = Depends(get_db)):
    """
    Get current user profile
    
    Requires JWT token as query parameter: ?token=your_jwt_token
    
    Returns user information
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Provide token as query parameter."
        )
    
    # Verify and decode token
    email = verify_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    # Get user from database
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"user": UserSchema.from_orm(user)}

# ========================= UPDATE PROFILE ENDPOINT =========================

@router.put("/profile", response_model=dict)
def update_profile(
    user_data: UserUpdate,
    token: str = None,
    db: Session = Depends(get_db)
):
    """
    Update user profile information
    
    Requires JWT token as query parameter: ?token=your_jwt_token
    
    Can update: name, phone, location, bio, company
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    # Verify token
    email = verify_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    # Get user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update only provided fields
    if user_data.name is not None:
        user.name = user_data.name
    if user_data.phone is not None:
        user.phone = user_data.phone
    if user_data.location is not None:
        user.location = user_data.location
    if user_data.bio is not None:
        user.bio = user_data.bio
    if user_data.company is not None:
        user.company = user_data.company
    
    db.commit()
    db.refresh(user)
    
    return {"user": UserSchema.from_orm(user)}

# ========================= UTILITY ENDPOINT =========================

@router.get("/test")
async def test_auth():
    """Test endpoint to verify auth router is working"""
    return {
        "status": "ok",
        "message": "Authentication router is working!",
        "endpoints": [
            "POST /auth/register",
            "POST /auth/login",
            "GET /auth/profile?token=...",
            "PUT /auth/profile?token=..."
        ]
    }