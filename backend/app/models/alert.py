from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class AlertType(str, enum.Enum):
    STRATEGY_MATCH = "strategy_match"
    PRICE_ALERT = "price_alert"
    DIVIDEND_ALERT = "dividend_alert"
    SCORE_ALERT = "score_alert"

class AlertStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    READ = "read"
    DISMISSED = "dismissed"

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    strategy_id = Column(Integer, ForeignKey("user_strategies.id"), nullable=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=True)
    
    # Dados do alerta
    alert_type = Column(Enum(AlertType), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(Enum(AlertStatus), default=AlertStatus.PENDING)
    
    # Dados específicos do alerta
    stock_ticker = Column(String(20), nullable=True)
    stock_name = Column(String(200), nullable=True)
    current_price = Column(String(20), nullable=True)
    score = Column(String(10), nullable=True)
    
    # Controle
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    sent_at = Column(DateTime(timezone=True), nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relacionamentos
    user = relationship("User")
    strategy = relationship("UserStrategy")
    stock = relationship("Stock")
