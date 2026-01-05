from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.core.security import hash_password, verify_password, create_access_token
from datetime import datetime, timedelta
from app.config import get_settings

router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()

@router.post("/register")
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register new user with email and password"""
    try:
        # Check if user exists
        stmt = select(User).where(User.email == user_data.email)
        result = await db.execute(stmt)
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = hash_password(user_data.password)
        new_user = User(
            email=user_data.email,
            full_name=user_data.full_name,
            hashed_password=hashed_password,
            gender=user_data.gender,
            is_verified=False,
            created_at=datetime.utcnow(),
        )
        
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        
        # Generate token
        access_token = create_access_token(
            data={"sub": str(new_user.id)},
            expires_delta=timedelta(hours=settings.JWT_EXPIRATION_HOURS)
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(new_user.id),
                "email": new_user.email,
                "": new_user.full_name,
                "gender": new_user.gender,
                "role": "user",
                "is_verified": False,
                "created_at": new_user.created_at.isoformat(),
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/login")
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login user with email and password"""
    try:
        # Find user
        stmt = select(User).where(User.email == credentials.email)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user or not verify_password(credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Update last login
        user.last_login_at = datetime.utcnow()
        db.add(user)
        await db.commit()
        
        # Generate token
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(hours=settings.JWT_EXPIRATION_HOURS)
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "gender": user.gender,
                "role": "user",
                "is_verified": user.is_verified,
                "created_at": user.created_at.isoformat(),
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/me")
async def get_current_user(db: AsyncSession = Depends(get_db), token: str = Depends(lambda: None)):
    """Get current authenticated user"""
    from app.core.security import decode_token
    try:
        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        payload = decode_token(token)
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "gender": user.gender,
            "role": "user",
            "is_verified": user.is_verified,
            "created_at": user.created_at.isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")
