from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class FilterIndicator(str, enum.Enum):
    PE_RATIO = "pe_ratio"
    PB_RATIO = "pb_ratio"
    DIVIDEND_YIELD = "dividend_yield"
    PAYOUT_RATIO = "payout_ratio"
    DEBT_TO_EBITDA = "debt_to_ebitda"
    ROE = "roe"
    NET_MARGIN = "net_margin"
    SECTOR = "sector"
    SUBSECTOR = "subsector"
    MARKET_CAP = "market_cap"
    DIVIDEND_CAGR_5Y = "dividend_cagr_5y"

class FilterOperator(str, enum.Enum):
    GREATER_THAN = ">"
    LESS_THAN = "<"
    EQUALS = "="
    GREATER_EQUAL = ">="
    LESS_EQUAL = "<="
    IN = "in"
    NOT_IN = "not_in"

class UserStrategy(Base):
    __tablename__ = "user_strategies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    is_notification_enabled = Column(Boolean, default=False)
    created_at = Column(String, nullable=False)  # Usando String para compatibilidade
    updated_at = Column(String, nullable=True)
    
    # Relacionamentos
    filters = relationship("StrategyFilter", back_populates="strategy", cascade="all, delete-orphan")
    user = relationship("User", back_populates="strategies")

class StrategyFilter(Base):
    __tablename__ = "strategy_filters"
    
    id = Column(Integer, primary_key=True, index=True)
    indicator = Column(Enum(FilterIndicator), nullable=False)
    operator = Column(Enum(FilterOperator), nullable=False)
    value_numeric = Column(Float, nullable=True)
    value_string = Column(String(200), nullable=True)  # Para filtros de texto como setor
    strategy_id = Column(Integer, ForeignKey("user_strategies.id"), nullable=False)
    
    # Relacionamentos
    strategy = relationship("UserStrategy", back_populates="filters")
