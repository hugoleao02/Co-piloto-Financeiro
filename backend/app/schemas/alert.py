from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.alert import AlertType, AlertStatus

class AlertBase(BaseModel):
    alert_type: AlertType
    title: str
    message: str
    stock_ticker: Optional[str] = None
    stock_name: Optional[str] = None
    current_price: Optional[str] = None
    score: Optional[str] = None

class AlertCreate(AlertBase):
    strategy_id: Optional[int] = None
    stock_id: Optional[int] = None

class AlertUpdate(BaseModel):
    status: Optional[AlertStatus] = None

class AlertResponse(AlertBase):
    id: int
    user_id: int
    strategy_id: Optional[int] = None
    stock_id: Optional[int] = None
    status: AlertStatus
    created_at: datetime
    sent_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class AlertSummary(BaseModel):
    total_alerts: int
    unread_alerts: int
    pending_alerts: int
    recent_alerts: list[AlertResponse]
