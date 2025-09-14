from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.models.user import User
from app.models.portfolio import Portfolio, Transaction, Dividend
from app.models.stock import Stock
from app.schemas.portfolio import (
    TransactionCreate, TransactionResponse, PortfolioSummary, 
    PortfolioPosition, DividendResponse, SimulationRequest, SimulationResponse
)
from app.api.auth import get_current_user

router = APIRouter()

@router.post("/transactions", response_model=TransactionResponse)
async def create_transaction(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Adiciona uma nova transação ao portfólio
    """
    # Buscar ação
    stock = db.query(Stock).filter(Stock.ticker == transaction_data.stock_ticker.upper()).first()
    if not stock:
        raise HTTPException(
            status_code=404,
            detail="Ação não encontrada"
        )
    
    # Criar transação
    transaction = Transaction(
        user_id=current_user.id,
        stock_id=stock.id,
        transaction_type=transaction_data.transaction_type,
        quantity=transaction_data.quantity,
        price=transaction_data.price,
        total_value=transaction_data.quantity * transaction_data.price,
        transaction_date=transaction_data.transaction_date,
        notes=transaction_data.notes
    )
    
    db.add(transaction)
    
    # Atualizar posição no portfólio
    update_portfolio_position(db, current_user.id, stock.id, transaction_data)
    
    db.commit()
    db.refresh(transaction)
    
    return transaction

@router.get("/summary", response_model=PortfolioSummary)
async def get_portfolio_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtém resumo completo do portfólio
    """
    # Buscar posições do usuário
    positions = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).all()
    
    if not positions:
        return PortfolioSummary(
            total_invested=0,
            current_value=0,
            total_pnl=0,
            total_pnl_percent=0,
            monthly_dividend_income=0,
            total_dividends_received=0,
            positions=[],
            sector_allocation={},
            performance_metrics={}
        )
    
    # Calcular métricas
    total_invested = sum(pos.total_invested for pos in positions)
    current_value = sum(pos.current_value or 0 for pos in positions)
    total_pnl = current_value - total_invested
    total_pnl_percent = (total_pnl / total_invested * 100) if total_invested > 0 else 0
    
    # Calcular renda de dividendos
    monthly_dividend_income = sum(pos.monthly_dividend_income or 0 for pos in positions)
    total_dividends_received = sum(pos.total_dividends_received for pos in positions)
    
    # Criar posições detalhadas
    portfolio_positions = []
    sector_allocation = {}
    
    for pos in positions:
        stock = db.query(Stock).filter(Stock.id == pos.stock_id).first()
        if stock:
            position = PortfolioPosition(
                stock_ticker=stock.ticker,
                stock_name=stock.name,
                quantity=pos.quantity,
                average_price=pos.average_price,
                current_price=stock.current_price or 0,
                total_invested=pos.total_invested,
                current_value=pos.current_value or 0,
                unrealized_pnl=pos.unrealized_pnl or 0,
                unrealized_pnl_percent=pos.unrealized_pnl_percent or 0,
                monthly_dividend_income=pos.monthly_dividend_income,
                total_dividends_received=pos.total_dividends_received
            )
            portfolio_positions.append(position)
            
            # Calcular alocação setorial
            if stock.sector:
                sector_allocation[stock.sector] = sector_allocation.get(stock.sector, 0) + (pos.current_value or 0)
    
    # Normalizar alocação setorial para percentuais
    if current_value > 0:
        sector_allocation = {k: (v / current_value * 100) for k, v in sector_allocation.items()}
    
    return PortfolioSummary(
        total_invested=total_invested,
        current_value=current_value,
        total_pnl=total_pnl,
        total_pnl_percent=total_pnl_percent,
        monthly_dividend_income=monthly_dividend_income,
        total_dividends_received=total_dividends_received,
        positions=portfolio_positions,
        sector_allocation=sector_allocation,
        performance_metrics={}  # Implementar métricas de performance
    )

@router.get("/transactions", response_model=List[TransactionResponse])
async def get_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtém histórico de transações do usuário
    """
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).order_by(Transaction.transaction_date.desc()).all()
    return transactions

@router.get("/dividends", response_model=List[DividendResponse])
async def get_dividends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtém histórico de dividendos recebidos
    """
    dividends = db.query(Dividend).filter(Dividend.user_id == current_user.id).order_by(Dividend.payment_date.desc()).all()
    return dividends

@router.post("/simulate", response_model=SimulationResponse)
async def simulate_investment(
    simulation_data: SimulationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Simula o impacto de um investimento
    """
    # Buscar ação
    stock = db.query(Stock).filter(Stock.ticker == simulation_data.stock_ticker.upper()).first()
    if not stock:
        raise HTTPException(
            status_code=404,
            detail="Ação não encontrada"
        )
    
    # Calcular número de ações
    shares_to_buy = int(simulation_data.investment_amount / (stock.current_price or 1))
    
    # Calcular dividendos projetados
    monthly_dividend_per_share = (stock.dividend_yield or 0) / 100 * (stock.current_price or 1) / 12
    projected_monthly_dividend = shares_to_buy * monthly_dividend_per_share
    projected_annual_dividend = projected_monthly_dividend * 12
    
    # Calcular impacto setorial
    # Por simplicidade, usar valores padrão
    current_portfolio = {
        'current_value': 0,
        'monthly_dividend_income': 0,
        'sector_allocation': {}
    }
    current_sector_allocation = current_portfolio['sector_allocation']
    
    new_sector_value = current_sector_allocation.get(stock.sector or "Outros", 0) + simulation_data.investment_amount
    total_value = current_portfolio['current_value'] + simulation_data.investment_amount
    
    sector_impact = {}
    for sector, value in current_sector_allocation.items():
        sector_impact[sector] = (value / total_value * 100) if total_value > 0 else 0
    
    if stock.sector:
        sector_impact[stock.sector] = (new_sector_value / total_value * 100) if total_value > 0 else 0
    
    return SimulationResponse(
        stock={
            "ticker": stock.ticker,
            "name": stock.name,
            "current_price": stock.current_price,
            "dividend_yield": stock.dividend_yield
        },
        investment_amount=simulation_data.investment_amount,
        shares_to_buy=shares_to_buy,
        projected_monthly_dividend=projected_monthly_dividend,
        projected_annual_dividend=projected_annual_dividend,
        sector_impact=sector_impact,
        portfolio_impact={
            "new_total_value": total_value,
            "new_monthly_dividend_income": current_portfolio['monthly_dividend_income'] + projected_monthly_dividend
        }
    )

def update_portfolio_position(db: Session, user_id: int, stock_id: int, transaction_data: TransactionCreate):
    """
    Atualiza posição no portfólio após transação
    """
    # Buscar posição existente
    position = db.query(Portfolio).filter(
        Portfolio.user_id == user_id,
        Portfolio.stock_id == stock_id
    ).first()
    
    if transaction_data.transaction_type == "buy":
        if position:
            # Atualizar posição existente
            new_quantity = position.quantity + transaction_data.quantity
            new_total_invested = position.total_invested + (transaction_data.quantity * transaction_data.price)
            new_average_price = new_total_invested / new_quantity
            
            position.quantity = new_quantity
            position.average_price = new_average_price
            position.total_invested = new_total_invested
        else:
            # Criar nova posição
            position = Portfolio(
                user_id=user_id,
                stock_id=stock_id,
                quantity=transaction_data.quantity,
                average_price=transaction_data.price,
                total_invested=transaction_data.quantity * transaction_data.price
            )
            db.add(position)
    
    elif transaction_data.transaction_type == "sell":
        if not position or position.quantity < transaction_data.quantity:
            raise HTTPException(
                status_code=400,
                detail="Quantidade insuficiente para venda"
            )
        
        # Atualizar posição
        position.quantity -= transaction_data.quantity
        position.total_invested -= (transaction_data.quantity * position.average_price)
        
        # Se quantidade zerou, remover posição
        if position.quantity == 0:
            db.delete(position)
