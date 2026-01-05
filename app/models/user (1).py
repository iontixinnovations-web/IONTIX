from sqlalchemy import Column, String, DateTime, Boolean, UUID
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
import uuid
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
     = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    gender = Column(String(50), nullable=True)
    is_verified = Column(Boolean, default=False)
    avatar_url = Column(String(500), nullable=True)
    phone = Column(String(20), nullable=True)
    bio = Column(String(500), nullable=True)
    skin_tone = Column(String(50), nullable=True)
    makeup_preferences = Column(String(255), nullable=True)
    role = Column(String(50), default="user")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)
