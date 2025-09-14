from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, verify_token
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token, DNAFinanceiroRequest, DNAFinanceiroResponse
from app.services.dna_calculator import DNACalculator

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Registra um novo usuário
    """
    # Verificar se email já existe
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email já cadastrado"
        )
    
    # Criar usuário
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Autentica usuário e retorna token
    """
    # Buscar usuário
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Criar token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Obtém usuário atual a partir do token
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
    
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    
    return user

@router.post("/dna-financeiro", response_model=DNAFinanceiroResponse)
async def calculate_dna_financeiro(
    dna_data: DNAFinanceiroRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Calcula o DNA Financeiro do usuário
    """
    calculator = DNACalculator()
    result = calculator.calculate_archetype(dna_data)
    
    # Atualizar perfil do usuário
    current_user.investor_archetype = result["archetype"]
    current_user.risk_tolerance = dna_data.risk_tolerance
    current_user.investment_goal = dna_data.investment_goal
    current_user.investment_horizon = dna_data.investment_horizon
    current_user.monthly_contribution = dna_data.monthly_contribution
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return DNAFinanceiroResponse(
        archetype=result["archetype"],
        description=result["description"],
        investment_philosophy=result["investment_philosophy"],
        recommended_weights=result["recommended_weights"]
    )
