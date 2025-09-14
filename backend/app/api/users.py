from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.api.auth import get_current_user

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Obtém perfil do usuário atual
    """
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Atualiza perfil do usuário atual
    """
    # Atualizar campos fornecidos
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.get("/profile-completion")
async def get_profile_completion(current_user: User = Depends(get_current_user)):
    """
    Verifica se o perfil do usuário está completo
    """
    required_fields = [
        'investor_archetype',
        'risk_tolerance',
        'investment_goal',
        'investment_horizon',
        'monthly_contribution'
    ]
    
    completed_fields = []
    missing_fields = []
    
    for field in required_fields:
        if getattr(current_user, field) is not None:
            completed_fields.append(field)
        else:
            missing_fields.append(field)
    
    completion_percentage = len(completed_fields) / len(required_fields) * 100
    
    return {
        "completion_percentage": completion_percentage,
        "completed_fields": completed_fields,
        "missing_fields": missing_fields,
        "is_complete": completion_percentage == 100
    }
