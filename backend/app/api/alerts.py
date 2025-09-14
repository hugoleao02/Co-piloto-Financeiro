from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.user import User
from app.models.alert import Alert, AlertType, AlertStatus
from app.schemas.alert import AlertResponse, AlertUpdate, AlertSummary
from app.api.auth import get_current_user
from app.services.alert_service import AlertService

router = APIRouter()

@router.get("/alerts", response_model=List[AlertResponse])
async def get_user_alerts(
    status: Optional[AlertStatus] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista os alertas do usuário
    """
    query = db.query(Alert).filter(Alert.user_id == current_user.id)
    
    if status:
        query = query.filter(Alert.status == status)
    
    alerts = query.order_by(Alert.created_at.desc()).offset(offset).limit(limit).all()
    
    return alerts

@router.get("/alerts/summary", response_model=AlertSummary)
async def get_alerts_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtém resumo dos alertas do usuário
    """
    total_alerts = db.query(Alert).filter(Alert.user_id == current_user.id).count()
    unread_alerts = db.query(Alert).filter(
        Alert.user_id == current_user.id,
        Alert.status.in_([AlertStatus.PENDING, AlertStatus.SENT])
    ).count()
    pending_alerts = db.query(Alert).filter(
        Alert.user_id == current_user.id,
        Alert.status == AlertStatus.PENDING
    ).count()
    
    recent_alerts = db.query(Alert).filter(
        Alert.user_id == current_user.id
    ).order_by(Alert.created_at.desc()).limit(5).all()
    
    return AlertSummary(
        total_alerts=total_alerts,
        unread_alerts=unread_alerts,
        pending_alerts=pending_alerts,
        recent_alerts=recent_alerts
    )

@router.get("/alerts/{alert_id}", response_model=AlertResponse)
async def get_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtém um alerta específico
    """
    alert = db.query(Alert).filter(
        Alert.id == alert_id,
        Alert.user_id == current_user.id
    ).first()
    
    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alerta não encontrado"
        )
    
    return alert

@router.put("/alerts/{alert_id}", response_model=AlertResponse)
async def update_alert(
    alert_id: int,
    alert_data: AlertUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Atualiza um alerta (marcar como lido, etc.)
    """
    alert = db.query(Alert).filter(
        Alert.id == alert_id,
        Alert.user_id == current_user.id
    ).first()
    
    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alerta não encontrado"
        )
    
    if alert_data.status:
        alert.status = alert_data.status
        
        if alert_data.status == AlertStatus.READ:
            alert.read_at = datetime.now()
        elif alert_data.status == AlertStatus.SENT:
            alert.sent_at = datetime.now()
    
    db.commit()
    db.refresh(alert)
    
    return alert

@router.delete("/alerts/{alert_id}")
async def delete_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Exclui um alerta
    """
    alert = db.query(Alert).filter(
        Alert.id == alert_id,
        Alert.user_id == current_user.id
    ).first()
    
    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alerta não encontrado"
        )
    
    db.delete(alert)
    db.commit()
    
    return {"message": "Alerta excluído com sucesso"}

@router.post("/alerts/mark-all-read")
async def mark_all_alerts_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Marca todos os alertas como lidos
    """
    db.query(Alert).filter(
        Alert.user_id == current_user.id,
        Alert.status.in_([AlertStatus.PENDING, AlertStatus.SENT])
    ).update({
        "status": AlertStatus.READ,
        "read_at": datetime.now()
    })
    
    db.commit()
    
    return {"message": "Todos os alertas foram marcados como lidos"}

@router.get("/alerts/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtém o número de alertas não lidos
    """
    count = db.query(Alert).filter(
        Alert.user_id == current_user.id,
        Alert.status.in_([AlertStatus.PENDING, AlertStatus.SENT])
    ).count()
    
    return {"unread_count": count}

@router.post("/alerts/generate")
async def generate_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Gera alertas para o usuário baseado nas estratégias e critérios
    """
    alert_service = AlertService(db)
    new_alerts = alert_service.generate_all_alerts(current_user)
    
    return {
        "message": f"{len(new_alerts)} novos alertas gerados",
        "alerts_created": len(new_alerts),
        "alerts": new_alerts
    }
