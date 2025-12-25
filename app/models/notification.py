from sqlalchemy import Column, String, DateTime, Text, UUID, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import JSON
from datetime import datetime
import uuid

from app.database import Base

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    notification_type = Column(String(50), nullable=True)
    title = Column(String(255), nullable=True)
    message = Column(Text, nullable=True)
    data = Column(JSON, default={})
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime, nullable=True)
