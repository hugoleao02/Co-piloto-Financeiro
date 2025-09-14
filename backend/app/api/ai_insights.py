"""
API para Insights de IA (Projeção de Dividendos e Detecção de Anomalias)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.user import User
from app.models.ai_models import UserAlert
from app.api.auth import get_current_user
from app.services.dividend_forecaster import DividendForecaster
from app.services.anomaly_detector import AnomalyDetector

router = APIRouter()

@router.get("/dividend-forecast")
async def get_dividend_forecast(
    months: int = 12,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém projeção de dividendos para os próximos N meses"""
    
    if months < 1 or months > 24:
        raise HTTPException(status_code=400, detail="Meses deve estar entre 1 e 24")
    
    forecaster = DividendForecaster(db)
    forecast = forecaster.forecast_user_dividends(current_user, months)
    
    return forecast

@router.get("/dividend-insights")
async def get_dividend_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém insights sobre dividendos do usuário"""
    
    forecaster = DividendForecaster(db)
    insights = forecaster.get_dividend_insights(current_user)
    
    return insights

@router.get("/anomaly-alerts")
async def get_anomaly_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém alertas de anomalias do usuário"""
    
    alerts = db.query(UserAlert).filter(
        UserAlert.user_id == current_user.id,
        UserAlert.alert_type == "anomaly"
    ).order_by(UserAlert.created_at.desc()).limit(50).all()
    
    return [
        {
            "id": alert.id,
            "title": alert.title,
            "message": alert.message,
            "severity": alert.severity,
            "is_read": alert.is_read,
            "stock_ticker": alert.stock.ticker if alert.stock else None,
            "stock_name": alert.stock.name if alert.stock else None,
            "created_at": alert.created_at.isoformat(),
            "metadata": alert.alert_metadata
        }
        for alert in alerts
    ]

@router.get("/anomaly-summary")
async def get_anomaly_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém resumo de anomalias do usuário"""
    
    detector = AnomalyDetector(db)
    summary = detector.get_anomaly_summary(current_user)
    
    return summary

@router.post("/anomaly-alerts/{alert_id}/read")
async def mark_alert_as_read(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marca um alerta como lido"""
    
    alert = db.query(UserAlert).filter(
        UserAlert.id == alert_id,
        UserAlert.user_id == current_user.id
    ).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta não encontrado")
    
    alert.is_read = True
    db.commit()
    
    return {"message": "Alerta marcado como lido"}

@router.post("/anomaly-alerts/mark-all-read")
async def mark_all_alerts_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marca todos os alertas como lidos"""
    
    db.query(UserAlert).filter(
        UserAlert.user_id == current_user.id,
        UserAlert.is_read == False
    ).update({"is_read": True})
    
    db.commit()
    
    return {"message": "Todos os alertas foram marcados como lidos"}

@router.get("/ai-dashboard")
async def get_ai_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém dados consolidados para o dashboard de IA"""
    
    # Projeção de dividendos
    forecaster = DividendForecaster(db)
    dividend_forecast = forecaster.forecast_user_dividends(current_user, 12)
    dividend_insights = forecaster.get_dividend_insights(current_user)
    
    # Resumo de anomalias
    detector = AnomalyDetector(db)
    anomaly_summary = detector.get_anomaly_summary(current_user)
    
    # Alertas recentes
    recent_alerts = db.query(UserAlert).filter(
        UserAlert.user_id == current_user.id,
        UserAlert.created_at >= datetime.now() - timedelta(days=7)
    ).order_by(UserAlert.created_at.desc()).limit(5).all()
    
    return {
        "dividend_forecast": dividend_forecast,
        "dividend_insights": dividend_insights,
        "anomaly_summary": anomaly_summary,
        "recent_alerts": [
            {
                "id": alert.id,
                "title": alert.title,
                "message": alert.message,
                "severity": alert.severity,
                "is_read": alert.is_read,
                "stock_ticker": alert.stock.ticker if alert.stock else None,
                "created_at": alert.created_at.isoformat()
            }
            for alert in recent_alerts
        ]
    }

@router.post("/detect-anomalies")
async def trigger_anomaly_detection(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Força detecção de anomalias para o usuário atual"""
    
    detector = AnomalyDetector(db)
    anomalies = detector.detect_anomalies_for_user(current_user)
    
    # Criar alertas para as anomalias encontradas
    alerts_created = 0
    for anomaly in anomalies:
        try:
            detector.create_user_alert(current_user, anomaly)
            alerts_created += 1
        except Exception as e:
            print(f"Erro ao criar alerta: {str(e)}")
            continue
    
    return {
        "anomalies_detected": len(anomalies),
        "alerts_created": alerts_created,
        "timestamp": datetime.now().isoformat()
    }
