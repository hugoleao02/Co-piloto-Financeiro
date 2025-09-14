from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime
from app.models.stock import Stock
from app.services.scoring_engine import ScoringEngine

class DataProcessor:
    """
    Processador de dados ETL - Calcula métricas derivadas e aplica scoring
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    async def process_stock_data(self, stock_data: Dict[str, Any]) -> Stock:
        """
        Processa e salva dados de uma ação
        """
        ticker = stock_data['ticker']
        
        # Buscar ou criar ação
        stock = self.db.query(Stock).filter(Stock.ticker == ticker).first()
        
        if not stock:
            stock = Stock(ticker=ticker)
            self.db.add(stock)
        
        # Atualizar dados básicos
        stock.name = stock_data.get('name', stock.name)
        stock.sector = stock_data.get('sector', stock.sector)
        stock.subsector = stock_data.get('subsector', stock.subsector)
        stock.current_price = stock_data.get('current_price')
        stock.market_cap = stock_data.get('market_cap')
        stock.pe_ratio = stock_data.get('pe_ratio')
        stock.pb_ratio = stock_data.get('pb_ratio')
        stock.dividend_yield = stock_data.get('dividend_yield')
        stock.payout_ratio = stock_data.get('payout_ratio')
        stock.debt_to_ebitda = stock_data.get('debt_to_ebitda')
        stock.roe = stock_data.get('roe')
        stock.net_margin = stock_data.get('net_margin')
        stock.data_source = stock_data.get('source')
        stock.data_quality_score = stock_data.get('data_quality_score')
        stock.last_updated = datetime.now()
        
        # Calcular métricas derivadas
        self._calculate_derived_metrics(stock)
        
        # Aplicar filtros de qualidade
        self._apply_quality_filters(stock)
        
        self.db.commit()
        self.db.refresh(stock)
        
        return stock
    
    def _calculate_derived_metrics(self, stock: Stock):
        """
        Calcula métricas derivadas que não são diretamente extraídas
        """
        # Calcular CAGR dos dividendos (5 anos)
        # Implementar lógica de cálculo baseada em histórico
        stock.dividend_cagr_5y = self._calculate_dividend_cagr(stock)
        
        # Calcular Preço Teto de Bazin (DY 6%)
        if stock.current_price and stock.dividend_yield:
            # Assumindo dividendos constantes por ação
            # Preço Teto = Dividendo por Ação / 0.06
            # Por simplicidade, usar DY atual
            if stock.dividend_yield > 0:
                stock.bazin_price = stock.current_price * (6.0 / stock.dividend_yield)
        
        # Calcular Margem de Segurança de Graham
        if stock.pe_ratio and stock.pb_ratio:
            # Fórmula simplificada: Graham Value = sqrt(22.5 * EPS * BVPS)
            # Assumindo EPS = Preço / P/L e BVPS = Preço / P/VPA
            if stock.pe_ratio > 0 and stock.pb_ratio > 0:
                graham_value = (22.5 * (stock.current_price / stock.pe_ratio) * (stock.current_price / stock.pb_ratio)) ** 0.5
                if stock.current_price > 0:
                    stock.graham_margin = ((graham_value - stock.current_price) / graham_value) * 100
    
    def _calculate_dividend_cagr(self, stock: Stock) -> float:
        """
        Calcula CAGR dos dividendos dos últimos 5 anos
        """
        # Implementar coleta de histórico de dividendos
        # Por enquanto, retornar valor simulado baseado no DY atual
        if stock.dividend_yield:
            # Simular crescimento baseado no DY
            return max(0, stock.dividend_yield * 0.1)  # 10% do DY como CAGR simulado
        return 0.0
    
    def _apply_quality_filters(self, stock: Stock):
        """
        Aplica filtros de qualidade (Peneira Grossa)
        """
        if not all([
            stock.pe_ratio is not None,
            stock.pb_ratio is not None,
            stock.dividend_yield is not None,
            stock.payout_ratio is not None,
            stock.debt_to_ebitda is not None,
            stock.roe is not None,
            stock.net_margin is not None
        ]):
            stock.is_qualified = False
            return
        
        # Critérios de qualidade
        criteria = [
            stock.pe_ratio > 0 and stock.pe_ratio < 50,
            stock.pb_ratio > 0 and stock.pb_ratio < 5,
            stock.payout_ratio < 100,
            stock.debt_to_ebitda < 4,
            stock.roe > 0,
            stock.net_margin > 0,
        ]
        
        stock.is_qualified = all(criteria)
    
    async def recalculate_all_scores(self):
        """
        Recalcula scores para todas as ações qualificadas
        """
        qualified_stocks = self.db.query(Stock).filter(Stock.is_qualified == True).all()
        
        if not qualified_stocks:
            return
        
        # Aplicar motor de scoring
        scoring_engine = ScoringEngine(self.db)
        
        # Calcular notas
        scored_stocks = scoring_engine.calculate_scores(qualified_stocks)
        
        # Salvar no banco
        for stock in scored_stocks:
            self.db.add(stock)
        
        self.db.commit()
    
    async def update_stock_prices(self):
        """
        Atualiza preços atuais de todas as ações
        """
        # Implementar atualização de preços
        # Por enquanto, apenas marcar como atualizado
        stocks = self.db.query(Stock).all()
        
        for stock in stocks:
            stock.last_updated = datetime.now()
            self.db.add(stock)
        
        self.db.commit()
