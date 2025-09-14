from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, users, portfolio, recommendations, etl, strategies, alerts, macroeconomic, brokerage_import, cost_analysis, corporate_actions, cvm_data, advanced_tax, currency, ai_chat, ai_insights
from app.core.config import settings
from app.core.database import engine
from app.models import Base

# Criar tabelas no banco de dados
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Co-piloto Financeiro API",
    description="API para mentor de investimentos baseado em Value Investing",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["portfolio"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])
app.include_router(strategies.router, prefix="/api/strategies", tags=["strategies"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(macroeconomic.router, prefix="/api/macroeconomic", tags=["macroeconomic"])
app.include_router(brokerage_import.router, prefix="/api/brokerage", tags=["brokerage"])
app.include_router(cost_analysis.router, prefix="/api/costs", tags=["costs"])
app.include_router(corporate_actions.router, prefix="/api/corporate-actions", tags=["corporate-actions"])
app.include_router(cvm_data.router, prefix="/api/cvm", tags=["cvm"])
app.include_router(advanced_tax.router, prefix="/api/tax", tags=["tax"])
app.include_router(currency.router, prefix="/api/currency", tags=["currency"])
app.include_router(etl.router, prefix="/api/etl", tags=["etl"])
app.include_router(ai_chat.router, prefix="/api/ai", tags=["ai-chat"])
app.include_router(ai_insights.router, prefix="/api/ai", tags=["ai-insights"])

@app.get("/")
async def root():
    return {"message": "Co-piloto Financeiro API está funcionando!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
