from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class StockBase(BaseModel):
    ticker: str
    name: str
    sector: Optional[str] = None
    subsector: Optional[str] = None

class StockCreate(StockBase):
    pass

class StockUpdate(BaseModel):
    current_price: Optional[float] = None
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None
    payout_ratio: Optional[float] = None
    debt_to_ebitda: Optional[float] = None
    roe: Optional[float] = None
    net_margin: Optional[float] = None

class StockInDB(StockBase):
    id: int
    current_price: Optional[float] = None
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None
    payout_ratio: Optional[float] = None
    debt_to_ebitda: Optional[float] = None
    roe: Optional[float] = None
    net_margin: Optional[float] = None
    dividend_cagr_5y: Optional[float] = None
    bazin_price: Optional[float] = None
    graham_margin: Optional[float] = None
    value_score: Optional[float] = None
    income_score: Optional[float] = None
    quality_score: Optional[float] = None
    final_score: Optional[float] = None
    is_qualified: bool = False
    last_updated: datetime
    data_source: Optional[str] = None
    data_quality_score: Optional[float] = None

    class Config:
        from_attributes = True

class StockResponse(StockInDB):
    pass

class StockAnalysis(BaseModel):
    stock: StockResponse
    checklist: dict  # Checklist dos Mestres
    explanation: dict  # Tradutor de Financês
    recommendation: str
    confidence: float

class RecommendationRequest(BaseModel):
    limit: int = 10

class RecommendationResponse(BaseModel):
    recommendations: list[StockAnalysis]
    user_archetype: str
    generated_at: datetime
