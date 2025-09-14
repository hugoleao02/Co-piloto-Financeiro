from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import InvestorArchetype

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    investor_archetype: Optional[InvestorArchetype] = None
    risk_tolerance: Optional[int] = None
    investment_goal: Optional[str] = None
    investment_horizon: Optional[int] = None
    monthly_contribution: Optional[int] = None

class UserInDB(UserBase):
    id: int
    investor_archetype: Optional[InvestorArchetype] = None
    risk_tolerance: Optional[int] = None
    investment_goal: Optional[str] = None
    investment_horizon: Optional[int] = None
    monthly_contribution: Optional[int] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserResponse(UserInDB):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class DNAFinanceiroRequest(BaseModel):
    # Perguntas do questionário
    investment_experience: int  # 1-5
    risk_tolerance: int  # 1-10
    investment_goal: str
    investment_horizon: int  # anos
    monthly_contribution: int
    dividend_preference: int  # 1-10
    value_preference: int  # 1-10
    quality_preference: int  # 1-10
    market_volatility_tolerance: int  # 1-10
    long_term_commitment: int  # 1-10

class DNAFinanceiroResponse(BaseModel):
    archetype: InvestorArchetype
    description: str
    investment_philosophy: str
    recommended_weights: dict
