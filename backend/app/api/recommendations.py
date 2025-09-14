from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.models.user import User
from app.models.stock import Stock
from app.schemas.stock import RecommendationRequest, RecommendationResponse, StockAnalysis
from app.api.auth import get_current_user
from app.services.scoring_engine import ScoringEngine

router = APIRouter()

@router.post("/generate", response_model=RecommendationResponse)
async def generate_recommendations(
    request: RecommendationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Gera recomendações personalizadas para o usuário
    """
    # Verificar se usuário tem perfil completo
    if not current_user.investor_archetype:
        raise HTTPException(
            status_code=400,
            detail="Perfil de investidor não configurado. Complete o DNA Financeiro primeiro."
        )
    
    # Buscar todas as ações qualificadas
    stocks = db.query(Stock).filter(Stock.is_qualified == True).all()
    
    if not stocks:
        raise HTTPException(
            status_code=404,
            detail="Nenhuma ação qualificada encontrada no sistema"
        )
    
    # Aplicar motor de scoring
    scoring_engine = ScoringEngine(db)
    
    # Aplicar filtros de qualidade
    qualified_stocks = scoring_engine.apply_gross_filter(stocks)
    
    # Calcular notas
    scored_stocks = scoring_engine.calculate_scores(qualified_stocks)
    
    # Aplicar ponderação dinâmica
    final_stocks = scoring_engine.calculate_final_scores(scored_stocks, current_user.investor_archetype)
    
    # Aplicar bônus de diversificação (implementar lógica de portfólio)
    # final_stocks = scoring_engine.apply_diversification_bonus(final_stocks, user_portfolio)
    
    # Obter top recomendações
    top_recommendations = scoring_engine.get_top_recommendations(final_stocks, request.limit)
    
    # Criar análises detalhadas
    analyses = []
    for stock in top_recommendations:
        analysis = StockAnalysis(
            stock=stock,
            checklist=create_masters_checklist(stock),
            explanation=create_finance_translator(stock),
            recommendation=generate_recommendation_text(stock, current_user.investor_archetype),
            confidence=stock.final_score / 10.0
        )
        analyses.append(analysis)
    
    return RecommendationResponse(
        recommendations=analyses,
        user_archetype=current_user.investor_archetype.value,
        generated_at=datetime.now()
    )

@router.get("/stock/{ticker}/analysis", response_model=StockAnalysis)
async def get_stock_analysis(
    ticker: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtém análise detalhada de uma ação específica
    """
    stock = db.query(Stock).filter(Stock.ticker == ticker.upper()).first()
    
    if not stock:
        raise HTTPException(
            status_code=404,
            detail="Ação não encontrada"
        )
    
    analysis = StockAnalysis(
        stock=stock,
        checklist=create_masters_checklist(stock),
        explanation=create_finance_translator(stock),
        recommendation=generate_recommendation_text(stock, current_user.investor_archetype),
        confidence=stock.final_score / 10.0 if stock.final_score else 0.0
    )
    
    return analysis

def create_masters_checklist(stock: Stock) -> dict:
    """
    Cria o Checklist dos Mestres para uma ação
    """
    checklist = {
        "graham_criteria": {
            "pe_ratio_ok": stock.pe_ratio is not None and 0 < stock.pe_ratio < 15,
            "pb_ratio_ok": stock.pb_ratio is not None and 0 < stock.pb_ratio < 1.5,
            "debt_low": stock.debt_to_ebitda is not None and stock.debt_to_ebitda < 2,
            "roe_good": stock.roe is not None and stock.roe > 15
        },
        "bazin_criteria": {
            "dividend_yield_ok": stock.dividend_yield is not None and stock.dividend_yield > 6,
            "payout_sustainable": stock.payout_ratio is not None and stock.payout_ratio < 80,
            "dividend_growth": stock.dividend_cagr_5y is not None and stock.dividend_cagr_5y > 0
        },
        "barsi_criteria": {
            "sector_best": stock.sector in ["Bancos", "Energia", "Saneamento", "Seguros", "Telecomunicações"],
            "consistent_profits": True,  # Implementar lógica de lucros consistentes
            "quality_company": stock.quality_score is not None and stock.quality_score > 7
        }
    }
    
    return checklist

def create_finance_translator(stock: Stock) -> dict:
    """
    Cria o Tradutor de Financês para uma ação
    """
    explanations = {
        "pe_ratio": {
            "value": stock.pe_ratio,
            "explanation": f"O P/L de {stock.pe_ratio:.1f} significa que você está pagando {stock.pe_ratio:.1f} reais para cada 1 real de lucro da empresa.",
            "interpretation": "Quanto menor, melhor. Abaixo de 15 é considerado barato."
        },
        "dividend_yield": {
            "value": stock.dividend_yield,
            "explanation": f"O Dividend Yield de {stock.dividend_yield:.1f}% significa que você receberá {stock.dividend_yield:.1f}% do valor investido em dividendos por ano.",
            "interpretation": "Acima de 6% é considerado bom para investidores focados em renda."
        },
        "roe": {
            "value": stock.roe,
            "explanation": f"O ROE de {stock.roe:.1f}% mostra que a empresa gera {stock.roe:.1f}% de retorno sobre o capital próprio.",
            "interpretation": "Acima de 15% indica uma empresa eficiente em gerar lucros."
        },
        "debt_to_ebitda": {
            "value": stock.debt_to_ebitda,
            "explanation": f"A relação Dívida/EBITDA de {stock.debt_to_ebitda:.1f} mostra que a dívida da empresa é {stock.debt_to_ebitda:.1f} vezes maior que seu lucro operacional.",
            "interpretation": "Abaixo de 2 é considerado saudável, acima de 4 é arriscado."
        }
    }
    
    return explanations

def generate_recommendation_text(stock: Stock, archetype: str) -> str:
    """
    Gera texto de recomendação personalizado
    """
    if not stock.final_score:
        return "Ação não analisada pelo sistema."
    
    score = stock.final_score
    
    if score >= 8:
        strength = "excelente"
    elif score >= 6:
        strength = "boa"
    elif score >= 4:
        strength = "regular"
    else:
        strength = "fraca"
    
    archetype_texts = {
        "construtor_renda": f"Esta ação tem uma {strength} pontuação para investidores focados em dividendos.",
        "cacador_valor": f"Esta ação apresenta uma {strength} oportunidade de valor com margem de segurança.",
        "socio_paciente": f"Esta ação oferece um {strength} equilíbrio entre valor, renda e qualidade."
    }
    
    base_text = archetype_texts.get(archetype, f"Esta ação tem uma {strength} pontuação geral.")
    
    if stock.dividend_yield and stock.dividend_yield > 6:
        base_text += f" O Dividend Yield de {stock.dividend_yield:.1f}% é atrativo para quem busca renda passiva."
    
    if stock.pe_ratio and stock.pe_ratio < 15:
        base_text += f" O P/L de {stock.pe_ratio:.1f} sugere que a ação pode estar subvalorizada."
    
    return base_text
