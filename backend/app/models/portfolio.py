from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Portfolio(Base):
    __tablename__ = "portfolios"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Métricas gerais da carteira
    total_value = Column(Float, nullable=True, default=0)
    total_invested = Column(Float, nullable=True, default=0)
    total_dividends_received = Column(Float, default=0)
    monthly_dividend_income = Column(Float, nullable=True)
    
    # Controle
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacionamentos
    user = relationship("User")
    positions = relationship("PortfolioPosition", back_populates="portfolio", cascade="all, delete-orphan")

class PortfolioPosition(Base):
    __tablename__ = "portfolio_positions"
    
    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False)
    
    # Posição
    quantity = Column(Integer, nullable=False, default=0)
    average_price = Column(Float, nullable=False)
    total_invested = Column(Float, nullable=False)
    
    # Métricas de performance
    current_value = Column(Float, nullable=True)
    unrealized_pnl = Column(Float, nullable=True)
    unrealized_pnl_percent = Column(Float, nullable=True)
    
    # Dividendos
    total_dividends_received = Column(Float, default=0)
    monthly_dividend_income = Column(Float, nullable=True)
    
    # Controle
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacionamentos
    portfolio = relationship("Portfolio", back_populates="positions")
    stock = relationship("Stock")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False)
    
    # Transação
    transaction_type = Column(String, nullable=False)  # "buy" ou "sell"
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    total_value = Column(Float, nullable=False)
    transaction_date = Column(DateTime(timezone=True), nullable=False)
    
    # Metadados
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relacionamentos
    user = relationship("User")
    stock = relationship("Stock")

class Dividend(Base):
    __tablename__ = "dividends"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False)
    
    # Dividendo
    amount_per_share = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    payment_date = Column(DateTime(timezone=True), nullable=False)
    ex_date = Column(DateTime(timezone=True), nullable=True)
    
    # Controle
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relacionamentos
    user = relationship("User")
    stock = relationship("Stock")
