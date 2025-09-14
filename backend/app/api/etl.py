from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.models.stock import Stock
from app.api.auth import get_current_user
from app.etl.data_collector import DataCollector
from app.etl.data_processor import DataProcessor

router = APIRouter()

@router.post("/collect-stock-data")
async def collect_stock_data(
    ticker: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Coleta dados de uma ação específica
    """
    collector = DataCollector()
    
    try:
        # Coletar dados
        stock_data = await collector.collect_stock_data(ticker.upper())
        
        if not stock_data:
            raise HTTPException(
                status_code=404,
                detail="Dados não encontrados para esta ação"
            )
        
        # Processar e salvar dados
        processor = DataProcessor(db)
        await processor.process_stock_data(stock_data)
        
        await collector.close()
        
        return {"message": f"Dados coletados com sucesso para {ticker.upper()}"}
        
    except Exception as e:
        await collector.close()
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao coletar dados: {str(e)}"
        )

@router.post("/collect-all-stocks")
async def collect_all_stocks(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Inicia coleta de dados para todas as ações (tarefa em background)
    """
    # Lista de ações para coletar (implementar lista completa)
    tickers = [
        "PETR4", "VALE3", "ITUB4", "BBDC4", "ABEV3", "WEGE3", "MGLU3", "SUZB3", "RENT3", "LREN3"
    ]
    
    background_tasks.add_task(collect_all_stocks_task, tickers, db)
    
    return {"message": "Coleta de dados iniciada em background"}

@router.get("/etl-status")
async def get_etl_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtém status do sistema de ETL
    """
    # Contar ações no sistema
    total_stocks = db.query(Stock).count()
    qualified_stocks = db.query(Stock).filter(Stock.is_qualified == True).count()
    
    # Última atualização
    last_updated = db.query(Stock).order_by(Stock.last_updated.desc()).first()
    last_update_time = last_updated.last_updated if last_updated else None
    
    return {
        "total_stocks": total_stocks,
        "qualified_stocks": qualified_stocks,
        "last_update": last_update_time,
        "data_quality": calculate_data_quality(db)
    }

async def collect_all_stocks_task(tickers: List[str], db: Session):
    """
    Tarefa em background para coletar dados de todas as ações
    """
    collector = DataCollector()
    processor = DataProcessor(db)
    
    try:
        for ticker in tickers:
            try:
                stock_data = await collector.collect_stock_data(ticker)
                if stock_data:
                    await processor.process_stock_data(stock_data)
            except Exception as e:
                print(f"Erro ao coletar {ticker}: {str(e)}")
                continue
        
        await collector.close()
        
    except Exception as e:
        print(f"Erro na coleta em background: {str(e)}")
        await collector.close()

def calculate_data_quality(db: Session) -> dict:
    """
    Calcula métricas de qualidade dos dados
    """
    stocks = db.query(Stock).all()
    
    if not stocks:
        return {"score": 0, "details": {}}
    
    total_fields = 0
    filled_fields = 0
    
    critical_fields = ['pe_ratio', 'pb_ratio', 'dividend_yield', 'roe', 'net_margin', 'debt_to_ebitda']
    
    for stock in stocks:
        for field in critical_fields:
            total_fields += 1
            if getattr(stock, field) is not None:
                filled_fields += 1
    
    quality_score = (filled_fields / total_fields * 100) if total_fields > 0 else 0
    
    return {
        "score": quality_score,
        "details": {
            "total_fields": total_fields,
            "filled_fields": filled_fields,
            "completion_rate": f"{quality_score:.1f}%"
        }
    }
