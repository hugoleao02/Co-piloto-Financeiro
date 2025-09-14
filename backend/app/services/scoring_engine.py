from typing import List, Dict, Any
import numpy as np
from sqlalchemy.orm import Session
from app.models.stock import Stock
from app.models.user import InvestorArchetype
from app.models.strategy import UserStrategy, FilterOperator

class ScoringEngine:
    """
    Motor de scoring baseado nos princípios de Value Investing e Dividend Investing
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def apply_gross_filter(self, stocks: List[Stock]) -> List[Stock]:
        """
        R3.1 - A Peneira Grossa - Filtros de Qualidade Inegociáveis
        """
        qualified_stocks = []
        
        for stock in stocks:
            if self._is_qualified(stock):
                stock.is_qualified = True
                qualified_stocks.append(stock)
        
        return qualified_stocks
    
    def _is_qualified(self, stock: Stock) -> bool:
        """
        Verifica se uma ação atende aos critérios de qualidade inegociáveis
        """
        # Verificações básicas de existência de dados
        if not all([
            stock.pe_ratio is not None,
            stock.pb_ratio is not None,
            stock.dividend_yield is not None,
            stock.payout_ratio is not None,
            stock.debt_to_ebitda is not None,
            stock.roe is not None,
            stock.net_margin is not None
        ]):
            return False
        
        # Critérios de qualidade
        criteria = [
            stock.pe_ratio > 0 and stock.pe_ratio < 50,  # P/L positivo e razoável
            stock.pb_ratio > 0 and stock.pb_ratio < 5,   # P/VPA positivo e razoável
            stock.payout_ratio < 100,                     # Payout < 100%
            stock.debt_to_ebitda < 4,                     # Dívida/EBITDA < 4
            stock.roe > 0,                                # ROE positivo
            stock.net_margin > 0,                         # Margem líquida positiva
        ]
        
        return all(criteria)
    
    def calculate_scores(self, qualified_stocks: List[Stock]) -> List[Stock]:
        """
        R3.2 - A Peneira Fina - Sistema de Pontuação
        """
        if not qualified_stocks:
            return qualified_stocks
        
        # Calcular notas de valor (Graham)
        self._calculate_value_scores(qualified_stocks)
        
        # Calcular notas de renda (Bazin/Barsi)
        self._calculate_income_scores(qualified_stocks)
        
        # Calcular notas de qualidade
        self._calculate_quality_scores(qualified_stocks)
        
        return qualified_stocks
    
    def _calculate_value_scores(self, stocks: List[Stock]):
        """
        Nota de Valor baseada em P/L e P/VPA (quanto mais baixos, maior a nota)
        """
        pe_ratios = [s.pe_ratio for s in stocks if s.pe_ratio is not None]
        pb_ratios = [s.pb_ratio for s in stocks if s.pb_ratio is not None]
        
        if not pe_ratios or not pb_ratios:
            return
        
        # Normalizar P/L (inverter: menor P/L = maior nota)
        pe_percentiles = self._calculate_percentiles(pe_ratios, reverse=True)
        
        # Normalizar P/VPA (inverter: menor P/VPA = maior nota)
        pb_percentiles = self._calculate_percentiles(pb_ratios, reverse=True)
        
        for i, stock in enumerate(stocks):
            if stock.pe_ratio is not None and stock.pb_ratio is not None:
                pe_score = pe_percentiles[i] * 5  # 0-5
                pb_score = pb_percentiles[i] * 5  # 0-5
                stock.value_score = (pe_score + pb_score) / 2
    
    def _calculate_income_scores(self, stocks: List[Stock]):
        """
        Nota de Renda baseada em Dividend Yield, CAGR e consistência
        """
        dividend_yields = [s.dividend_yield for s in stocks if s.dividend_yield is not None]
        cagrs = [s.dividend_cagr_5y for s in stocks if s.dividend_cagr_5y is not None]
        
        if not dividend_yields:
            return
        
        # Normalizar Dividend Yield
        dy_percentiles = self._calculate_percentiles(dividend_yields)
        
        # Normalizar CAGR (se disponível)
        cagr_percentiles = []
        if cagrs:
            cagr_percentiles = self._calculate_percentiles(cagrs)
        
        for i, stock in enumerate(stocks):
            if stock.dividend_yield is not None:
                dy_score = dy_percentiles[i] * 4  # 0-4
                
                # Adicionar bônus por CAGR se disponível
                cagr_bonus = 0
                if cagrs and i < len(cagr_percentiles):
                    cagr_bonus = cagr_percentiles[i] * 2  # 0-2
                
                # Bônus por consistência (payout < 80%)
                consistency_bonus = 0
                if stock.payout_ratio and stock.payout_ratio < 80:
                    consistency_bonus = 2
                elif stock.payout_ratio and stock.payout_ratio < 100:
                    consistency_bonus = 1
                
                stock.income_score = min(10, dy_score + cagr_bonus + consistency_bonus)
    
    def _calculate_quality_scores(self, stocks: List[Stock]):
        """
        Nota de Qualidade baseada em ROE, Margem Líquida e baixo endividamento
        """
        roes = [s.roe for s in stocks if s.roe is not None]
        margins = [s.net_margin for s in stocks if s.net_margin is not None]
        debts = [s.debt_to_ebitda for s in stocks if s.debt_to_ebitda is not None]
        
        if not roes or not margins or not debts:
            return
        
        # Normalizar ROE
        roe_percentiles = self._calculate_percentiles(roes)
        
        # Normalizar Margem Líquida
        margin_percentiles = self._calculate_percentiles(margins)
        
        # Normalizar Dívida (inverter: menor dívida = maior nota)
        debt_percentiles = self._calculate_percentiles(debts, reverse=True)
        
        for i, stock in enumerate(stocks):
            if all([stock.roe is not None, stock.net_margin is not None, stock.debt_to_ebitda is not None]):
                roe_score = roe_percentiles[i] * 4  # 0-4
                margin_score = margin_percentiles[i] * 3  # 0-3
                debt_score = debt_percentiles[i] * 3  # 0-3
                
                stock.quality_score = min(10, roe_score + margin_score + debt_score)
    
    def _calculate_percentiles(self, values: List[float], reverse: bool = False) -> List[float]:
        """
        Calcula percentis para normalização
        """
        if not values:
            return []
        
        sorted_values = sorted(values, reverse=reverse)
        percentiles = []
        
        for value in values:
            rank = sorted_values.index(value) + 1
            percentile = rank / len(sorted_values)
            percentiles.append(percentile)
        
        return percentiles
    
    def calculate_final_scores(self, stocks: List[Stock], archetype: InvestorArchetype) -> List[Stock]:
        """
        R3.3 - Ponderação Dinâmica baseada no arquétipo do usuário
        """
        # Pesos por arquétipo
        weights = {
            InvestorArchetype.CONSTRUTOR_RENDA: {"value": 0.2, "income": 0.6, "quality": 0.2},
            InvestorArchetype.CACADOR_VALOR: {"value": 0.6, "income": 0.2, "quality": 0.2},
            InvestorArchetype.SOCIO_PACIENTE: {"value": 0.4, "income": 0.3, "quality": 0.3}
        }
        
        weight = weights.get(archetype, weights[InvestorArchetype.SOCIO_PACIENTE])
        
        for stock in stocks:
            if all([stock.value_score is not None, stock.income_score is not None, stock.quality_score is not None]):
                final_score = (
                    stock.value_score * weight["value"] +
                    stock.income_score * weight["income"] +
                    stock.quality_score * weight["quality"]
                )
                stock.final_score = round(final_score, 2)
        
        return stocks
    
    def apply_diversification_bonus(self, stocks: List[Stock], user_portfolio: Dict[str, float]) -> List[Stock]:
        """
        R3.4 - Bônus de Diversificação
        """
        # Calcular alocação setorial atual do usuário
        current_allocation = self._calculate_sector_allocation(user_portfolio)
        
        for stock in stocks:
            if stock.sector and stock.final_score:
                # Bônus pequeno para setores sub-representados
                sector_weight = current_allocation.get(stock.sector, 0)
                if sector_weight < 0.1:  # Menos de 10% do portfólio
                    stock.final_score = min(10, stock.final_score + 0.5)
        
        return stocks
    
    def _calculate_sector_allocation(self, portfolio: Dict[str, float]) -> Dict[str, float]:
        """
        Calcula alocação setorial do portfólio atual
        """
        # Implementar lógica de cálculo de alocação setorial
        # Por enquanto, retornar dicionário vazio
        return {}
    
    def get_top_recommendations(self, stocks: List[Stock], limit: int = 10) -> List[Stock]:
        """
        Retorna as melhores recomendações ordenadas por nota final
        """
        qualified_stocks = [s for s in stocks if s.is_qualified and s.final_score is not None]
        sorted_stocks = sorted(qualified_stocks, key=lambda x: x.final_score, reverse=True)
        return sorted_stocks[:limit]
    
    def apply_custom_strategy(self, stocks: List[Stock], strategy: UserStrategy) -> List[Stock]:
        """
        Aplica os filtros de uma estratégia personalizada do usuário
        """
        qualified_stocks = []
        
        for stock in stocks:
            is_qualified = True
            
            for filter_obj in strategy.filters:
                # Obter o valor do indicador na ação
                stock_value = getattr(stock, filter_obj.indicator.value, None)
                
                if stock_value is None:
                    is_qualified = False
                    break
                
                # Aplicar o filtro baseado no operador
                if not self._apply_filter(stock_value, filter_obj):
                    is_qualified = False
                    break
            
            if is_qualified:
                qualified_stocks.append(stock)
        
        return qualified_stocks
    
    def _apply_filter(self, stock_value: Any, filter_obj) -> bool:
        """
        Aplica um filtro individual a um valor da ação
        """
        if filter_obj.operator == FilterOperator.GREATER_THAN:
            return stock_value > filter_obj.value_numeric
        elif filter_obj.operator == FilterOperator.LESS_THAN:
            return stock_value < filter_obj.value_numeric
        elif filter_obj.operator == FilterOperator.EQUALS:
            if filter_obj.value_numeric is not None:
                return stock_value == filter_obj.value_numeric
            else:
                return stock_value == filter_obj.value_string
        elif filter_obj.operator == FilterOperator.GREATER_EQUAL:
            return stock_value >= filter_obj.value_numeric
        elif filter_obj.operator == FilterOperator.LESS_EQUAL:
            return stock_value <= filter_obj.value_numeric
        elif filter_obj.operator == FilterOperator.IN:
            # Para filtros de setor/subsector
            allowed_values = filter_obj.value_string.split(',') if filter_obj.value_string else []
            return stock_value in allowed_values
        elif filter_obj.operator == FilterOperator.NOT_IN:
            # Para filtros de exclusão
            excluded_values = filter_obj.value_string.split(',') if filter_obj.value_string else []
            return stock_value not in excluded_values
        
        return False
