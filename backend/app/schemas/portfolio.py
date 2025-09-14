from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TransactionBase(BaseModel):
    stock_ticker: str
    transaction_type: str  # "buy" ou "sell"
    quantity: int
    price: float
    transaction_date: datetime
    notes: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    total_value: float
    created_at: datetime

    class Config:
        from_attributes = True

class PortfolioPosition(BaseModel):
    stock_ticker: str
    stock_name: str
    quantity: int
    average_price: float
    current_price: float
    total_invested: float
    current_value: float
    unrealized_pnl: float
    unrealized_pnl_percent: float
    monthly_dividend_income: Optional[float] = None
    total_dividends_received: float = 0

class PortfolioSummary(BaseModel):
    total_invested: float
    current_value: float
    total_pnl: float
    total_pnl_percent: float
    monthly_dividend_income: float
    total_dividends_received: float
    positions: List[PortfolioPosition]
    sector_allocation: dict
    performance_metrics: dict

class DividendResponse(BaseModel):
    id: int
    stock_ticker: str
    stock_name: str
    amount_per_share: float
    total_amount: float
    payment_date: datetime
    ex_date: Optional[datetime] = None

    class Config:
        from_attributes = True

class SimulationRequest(BaseModel):
    stock_ticker: str
    investment_amount: float

class SimulationResponse(BaseModel):
    stock: dict
    investment_amount: float
    shares_to_buy: int
    projected_monthly_dividend: float
    projected_annual_dividend: float
    sector_impact: dict
    portfolio_impact: dict
