from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://copiloto:copiloto123@localhost:5432/copiloto_financeiro"
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # JWT
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # ETL
    etl_schedule_hour: int = 18  # 18:00 para atualização diária
    
    # Fontes de dados
    status_invest_url: str = "https://statusinvest.com.br"
    fundamentus_url: str = "https://www.fundamentus.com.br"
    
    class Config:
        env_file = ".env"

settings = Settings()
