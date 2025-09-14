from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.strategy import FilterIndicator, FilterOperator

class StrategyFilterBase(BaseModel):
    indicator: FilterIndicator
    operator: FilterOperator
    value_numeric: Optional[float] = None
    value_string: Optional[str] = None

class StrategyFilterCreate(StrategyFilterBase):
    pass

class StrategyFilterResponse(StrategyFilterBase):
    id: int
    strategy_id: int
    
    class Config:
        from_attributes = True

class UserStrategyBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_notification_enabled: bool = False

class UserStrategyCreate(UserStrategyBase):
    filters: List[StrategyFilterCreate]

class UserStrategyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_notification_enabled: Optional[bool] = None
    filters: Optional[List[StrategyFilterCreate]] = None

class UserStrategyResponse(UserStrategyBase):
    id: int
    user_id: int
    is_active: bool
    created_at: str
    updated_at: Optional[str] = None
    filters: List[StrategyFilterResponse] = []
    
    class Config:
        from_attributes = True

class StrategyRecommendationRequest(BaseModel):
    strategy_id: int
    limit: int = 10

class StrategyRecommendationResponse(BaseModel):
    recommendations: List[dict]  # StockAnalysis
    strategy_name: str
    strategy_description: Optional[str] = None
    generated_at: datetime
    total_found: int
