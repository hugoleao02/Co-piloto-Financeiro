#!/usr/bin/env python3
"""
Script para popular o banco de dados com dados de exemplo
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models import Base
from app.models.stock import Stock
from datetime import datetime

def create_sample_stocks():
    """Cria ações de exemplo no banco de dados"""
    
    # Criar tabelas
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Verificar se já existem ações
        existing_stocks = db.query(Stock).count()
        if existing_stocks > 0:
            print(f"Já existem {existing_stocks} ações no banco de dados")
            return
        
        # Ações de exemplo baseadas em Value Investing
        sample_stocks = [
            {
                "ticker": "VALE3",
                "name": "Vale S.A.",
                "sector": "Materiais Básicos",
                "subsector": "Mineração",
                "current_price": 65.50,
                "market_cap": 320000000000,
                "pe_ratio": 4.2,
                "pb_ratio": 0.8,
                "dividend_yield": 8.5,
                "payout_ratio": 0.35,
                "debt_to_ebitda": 0.8,
                "roe": 18.5,
                "net_margin": 0.25,
                "dividend_cagr_5y": 12.0,
                "bazin_price": 70.0,
                "graham_margin": 0.15,
                "value_score": 85.0,
                "income_score": 90.0,
                "quality_score": 80.0,
                "final_score": 85.0,
                "is_qualified": True,
                "last_updated": datetime.now(),
                "data_source": "manual",
                "data_quality_score": 95.0
            },
            {
                "ticker": "PETR4",
                "name": "Petróleo Brasileiro S.A. - Petrobras",
                "sector": "Petróleo, Gás e Biocombustíveis",
                "subsector": "Petróleo e Gás",
                "current_price": 42.30,
                "market_cap": 280000000000,
                "pe_ratio": 3.8,
                "pb_ratio": 0.6,
                "dividend_yield": 12.0,
                "payout_ratio": 0.45,
                "debt_to_ebitda": 1.2,
                "roe": 22.0,
                "net_margin": 0.18,
                "dividend_cagr_5y": 15.0,
                "bazin_price": 45.0,
                "graham_margin": 0.20,
                "value_score": 90.0,
                "income_score": 95.0,
                "quality_score": 75.0,
                "final_score": 87.0,
                "is_qualified": True,
                "last_updated": datetime.now(),
                "data_source": "manual",
                "data_quality_score": 90.0
            },
            {
                "ticker": "ITUB4",
                "name": "Itaú Unibanco Holding S.A.",
                "sector": "Financeiro",
                "subsector": "Bancos",
                "current_price": 28.90,
                "market_cap": 180000000000,
                "pe_ratio": 6.5,
                "pb_ratio": 1.1,
                "dividend_yield": 6.8,
                "payout_ratio": 0.40,
                "debt_to_ebitda": 0.0,
                "roe": 15.5,
                "net_margin": 0.22,
                "dividend_cagr_5y": 8.0,
                "bazin_price": 32.0,
                "graham_margin": 0.10,
                "value_score": 75.0,
                "income_score": 80.0,
                "quality_score": 85.0,
                "final_score": 80.0,
                "is_qualified": True,
                "last_updated": datetime.now(),
                "data_source": "manual",
                "data_quality_score": 88.0
            },
            {
                "ticker": "BBDC4",
                "name": "Banco Bradesco S.A.",
                "sector": "Financeiro",
                "subsector": "Bancos",
                "current_price": 22.40,
                "market_cap": 120000000000,
                "pe_ratio": 8.2,
                "pb_ratio": 0.9,
                "dividend_yield": 7.2,
                "payout_ratio": 0.35,
                "debt_to_ebitda": 0.0,
                "roe": 12.8,
                "net_margin": 0.18,
                "dividend_cagr_5y": 6.5,
                "bazin_price": 25.0,
                "graham_margin": 0.08,
                "value_score": 70.0,
                "income_score": 75.0,
                "quality_score": 80.0,
                "final_score": 75.0,
                "is_qualified": True,
                "last_updated": datetime.now(),
                "data_source": "manual",
                "data_quality_score": 85.0
            },
            {
                "ticker": "WEGE3",
                "name": "WEG S.A.",
                "sector": "Bens Industriais",
                "subsector": "Máquinas e Equipamentos",
                "current_price": 45.80,
                "market_cap": 95000000000,
                "pe_ratio": 12.5,
                "pb_ratio": 2.8,
                "dividend_yield": 4.2,
                "payout_ratio": 0.25,
                "debt_to_ebitda": 0.3,
                "roe": 22.5,
                "net_margin": 0.15,
                "dividend_cagr_5y": 18.0,
                "bazin_price": 50.0,
                "graham_margin": 0.12,
                "value_score": 60.0,
                "income_score": 65.0,
                "quality_score": 95.0,
                "final_score": 73.0,
                "is_qualified": True,
                "last_updated": datetime.now(),
                "data_source": "manual",
                "data_quality_score": 92.0
            }
        ]
        
        # Inserir ações no banco
        for stock_data in sample_stocks:
            stock = Stock(**stock_data)
            db.add(stock)
        
        db.commit()
        print(f"Criadas {len(sample_stocks)} ações de exemplo no banco de dados")
        
    except Exception as e:
        print(f"Erro ao criar ações de exemplo: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_stocks()
