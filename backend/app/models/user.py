from sqlalchemy import Column, Integer, String, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class InvestorArchetype(str, enum.Enum):
    CONSTRUTOR_RENDA = "construtor_renda"
    CACADOR_VALOR = "cacador_valor"
    SOCIO_PACIENTE = "socio_paciente"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Perfil de investidor (DNA Financeiro)
    investor_archetype = Column(Enum(InvestorArchetype), nullable=True)
    risk_tolerance = Column(Integer, nullable=True)  # 1-10
    investment_goal = Column(Text, nullable=True)
    investment_horizon = Column(Integer, nullable=True)  # anos
    monthly_contribution = Column(Integer, nullable=True)  # valor mensal
    
    # Configurações
    is_active = Column(String, default="true")
    is_verified = Column(String, default="false")
    
    # Relacionamentos
    strategies = relationship("UserStrategy", back_populates="user")
