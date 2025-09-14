from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.models.user import User
from app.models.strategy import UserStrategy, StrategyFilter, FilterIndicator, FilterOperator
from app.schemas.strategy import (
    UserStrategyCreate, 
    UserStrategyUpdate, 
    UserStrategyResponse,
    StrategyFilterCreate,
    StrategyRecommendationRequest,
    StrategyRecommendationResponse
)
from app.api.auth import get_current_user
from app.services.scoring_engine import ScoringEngine
from app.models.stock import Stock

router = APIRouter()

@router.post("/strategies", response_model=UserStrategyResponse)
async def create_strategy(
    strategy_data: UserStrategyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cria uma nova estratégia personalizada para o usuário
    """
    # Verificar se já existe uma estratégia com o mesmo nome
    existing_strategy = db.query(UserStrategy).filter(
        UserStrategy.user_id == current_user.id,
        UserStrategy.name == strategy_data.name
    ).first()
    
    if existing_strategy:
        raise HTTPException(
            status_code=400,
            detail="Já existe uma estratégia com este nome"
        )
    
    # Criar a estratégia
    strategy = UserStrategy(
        name=strategy_data.name,
        description=strategy_data.description,
        user_id=current_user.id,
        is_notification_enabled=strategy_data.is_notification_enabled,
        created_at=datetime.now().isoformat()
    )
    
    db.add(strategy)
    db.flush()  # Para obter o ID da estratégia
    
    # Criar os filtros
    for filter_data in strategy_data.filters:
        filter_obj = StrategyFilter(
            indicator=filter_data.indicator,
            operator=filter_data.operator,
            value_numeric=filter_data.value_numeric,
            value_string=filter_data.value_string,
            strategy_id=strategy.id
        )
        db.add(filter_obj)
    
    db.commit()
    db.refresh(strategy)
    
    return strategy

@router.get("/strategies", response_model=List[UserStrategyResponse])
async def get_user_strategies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista todas as estratégias do usuário
    """
    strategies = db.query(UserStrategy).filter(
        UserStrategy.user_id == current_user.id,
        UserStrategy.is_active == True
    ).all()
    
    return strategies

@router.get("/strategies/{strategy_id}", response_model=UserStrategyResponse)
async def get_strategy(
    strategy_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtém uma estratégia específica do usuário
    """
    strategy = db.query(UserStrategy).filter(
        UserStrategy.id == strategy_id,
        UserStrategy.user_id == current_user.id
    ).first()
    
    if not strategy:
        raise HTTPException(
            status_code=404,
            detail="Estratégia não encontrada"
        )
    
    return strategy

@router.put("/strategies/{strategy_id}", response_model=UserStrategyResponse)
async def update_strategy(
    strategy_id: int,
    strategy_data: UserStrategyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Atualiza uma estratégia existente
    """
    strategy = db.query(UserStrategy).filter(
        UserStrategy.id == strategy_id,
        UserStrategy.user_id == current_user.id
    ).first()
    
    if not strategy:
        raise HTTPException(
            status_code=404,
            detail="Estratégia não encontrada"
        )
    
    # Atualizar dados da estratégia
    if strategy_data.name is not None:
        strategy.name = strategy_data.name
    if strategy_data.description is not None:
        strategy.description = strategy_data.description
    if strategy_data.is_notification_enabled is not None:
        strategy.is_notification_enabled = strategy_data.is_notification_enabled
    
    strategy.updated_at = datetime.now().isoformat()
    
    # Atualizar filtros se fornecidos
    if strategy_data.filters is not None:
        # Remover filtros existentes
        db.query(StrategyFilter).filter(
            StrategyFilter.strategy_id == strategy_id
        ).delete()
        
        # Adicionar novos filtros
        for filter_data in strategy_data.filters:
            filter_obj = StrategyFilter(
                indicator=filter_data.indicator,
                operator=filter_data.operator,
                value_numeric=filter_data.value_numeric,
                value_string=filter_data.value_string,
                strategy_id=strategy.id
            )
            db.add(filter_obj)
    
    db.commit()
    db.refresh(strategy)
    
    return strategy

@router.delete("/strategies/{strategy_id}")
async def delete_strategy(
    strategy_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Exclui uma estratégia (soft delete)
    """
    strategy = db.query(UserStrategy).filter(
        UserStrategy.id == strategy_id,
        UserStrategy.user_id == current_user.id
    ).first()
    
    if not strategy:
        raise HTTPException(
            status_code=404,
            detail="Estratégia não encontrada"
        )
    
    strategy.is_active = False
    strategy.updated_at = datetime.now().isoformat()
    
    db.commit()
    
    return {"message": "Estratégia excluída com sucesso"}

@router.post("/strategies/{strategy_id}/recommendations", response_model=StrategyRecommendationResponse)
async def get_strategy_recommendations(
    strategy_id: int,
    request: StrategyRecommendationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Gera recomendações baseadas em uma estratégia personalizada
    """
    # Buscar a estratégia
    strategy = db.query(UserStrategy).filter(
        UserStrategy.id == strategy_id,
        UserStrategy.user_id == current_user.id,
        UserStrategy.is_active == True
    ).first()
    
    if not strategy:
        raise HTTPException(
            status_code=404,
            detail="Estratégia não encontrada"
        )
    
    # Buscar todas as ações
    stocks = db.query(Stock).all()
    
    if not stocks:
        raise HTTPException(
            status_code=404,
            detail="Nenhuma ação encontrada no sistema"
        )
    
    # Aplicar a estratégia personalizada
    scoring_engine = ScoringEngine(db)
    qualified_stocks = scoring_engine.apply_custom_strategy(stocks, strategy)
    
    if not qualified_stocks:
        raise HTTPException(
            status_code=404,
            detail="Nenhuma ação atende aos critérios da estratégia"
        )
    
    # Calcular scores e ordenar
    scored_stocks = scoring_engine.calculate_scores(qualified_stocks)
    final_stocks = scoring_engine.calculate_final_scores(scored_stocks, current_user.investor_archetype)
    
    # Limitar resultados
    limited_stocks = final_stocks[:request.limit]
    
    # Converter para formato de resposta
    recommendations = []
    for stock in limited_stocks:
        analysis = scoring_engine.generate_stock_analysis(stock, current_user.investor_archetype)
        recommendations.append(analysis)
    
    return StrategyRecommendationResponse(
        recommendations=recommendations,
        strategy_name=strategy.name,
        strategy_description=strategy.description,
        generated_at=datetime.now(),
        total_found=len(qualified_stocks)
    )
