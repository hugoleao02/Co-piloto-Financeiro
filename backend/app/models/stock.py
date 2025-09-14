from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class Stock(Base):
    __tablename__ = "stocks"
    
    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    sector = Column(String, nullable=True)
    subsector = Column(String, nullable=True)
    
    # Dados fundamentais
    current_price = Column(Float, nullable=True)
    market_cap = Column(Float, nullable=True)
    pe_ratio = Column(Float, nullable=True)
    pb_ratio = Column(Float, nullable=True)
    dividend_yield = Column(Float, nullable=True)
    payout_ratio = Column(Float, nullable=True)
    debt_to_ebitda = Column(Float, nullable=True)
    roe = Column(Float, nullable=True)
    net_margin = Column(Float, nullable=True)
    
    # Métricas calculadas
    dividend_cagr_5y = Column(Float, nullable=True)  # CAGR dos dividendos 5 anos
    bazin_price = Column(Float, nullable=True)  # Preço teto de Bazin (DY 6%)
    graham_margin = Column(Float, nullable=True)  # Margem de segurança Graham
    
    # Notas do sistema de scoring
    value_score = Column(Float, nullable=True)  # 0-10
    income_score = Column(Float, nullable=True)  # 0-10
    quality_score = Column(Float, nullable=True)  # 0-10
    final_score = Column(Float, nullable=True)  # 0-10
    
    # Controle de qualidade
    is_qualified = Column(Boolean, default=False)  # Passou na peneira grossa
    last_updated = Column(DateTime(timezone=True), server_default=func.now())
    
    # Fonte dos dados
    data_source = Column(String, nullable=True)
    data_quality_score = Column(Float, nullable=True)  # 0-1
