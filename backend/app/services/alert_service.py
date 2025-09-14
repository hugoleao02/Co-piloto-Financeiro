from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
from app.models.alert import Alert, AlertType, AlertStatus
from app.models.strategy import UserStrategy
from app.models.stock import Stock
from app.models.user import User
from app.services.scoring_engine import ScoringEngine

class AlertService:
    def __init__(self, db: Session):
        self.db = db
        self.scoring_engine = ScoringEngine(db)
    
    def check_strategy_alerts(self, user: User) -> List[Alert]:
        """
        Verifica se alguma ação atende aos critérios das estratégias do usuário
        e cria alertas se necessário
        """
        alerts_created = []
        
        # Buscar estratégias ativas do usuário com notificações habilitadas
        strategies = self.db.query(UserStrategy).filter(
            UserStrategy.user_id == user.id,
            UserStrategy.is_active == True,
            UserStrategy.is_notification_enabled == True
        ).all()
        
        if not strategies:
            return alerts_created
        
        # Buscar todas as ações
        stocks = self.db.query(Stock).all()
        
        for strategy in strategies:
            # Verificar se já existe um alerta recente para esta estratégia
            recent_alert = self.db.query(Alert).filter(
                Alert.user_id == user.id,
                Alert.strategy_id == strategy.id,
                Alert.alert_type == AlertType.STRATEGY_MATCH,
                Alert.created_at >= datetime.now() - timedelta(hours=24)  # Evitar spam
            ).first()
            
            if recent_alert:
                continue
            
            # Aplicar a estratégia personalizada
            qualified_stocks = self.scoring_engine.apply_custom_strategy(stocks, strategy)
            
            if qualified_stocks:
                # Criar alerta para a primeira ação que atende aos critérios
                top_stock = qualified_stocks[0]
                
                alert = Alert(
                    user_id=user.id,
                    strategy_id=strategy.id,
                    stock_id=top_stock.id,
                    alert_type=AlertType.STRATEGY_MATCH,
                    title=f"🎯 Nova oportunidade na estratégia '{strategy.name}'",
                    message=f"A ação {top_stock.ticker} ({top_stock.name}) atende aos critérios da sua estratégia '{strategy.name}'. Score: {top_stock.final_score:.1f}/10",
                    stock_ticker=top_stock.ticker,
                    stock_name=top_stock.name,
                    current_price=f"R$ {top_stock.current_price:.2f}" if top_stock.current_price else None,
                    score=f"{top_stock.final_score:.1f}" if top_stock.final_score else None,
                    status=AlertStatus.PENDING
                )
                
                self.db.add(alert)
                alerts_created.append(alert)
        
        self.db.commit()
        return alerts_created
    
    def check_score_alerts(self, user: User) -> List[Alert]:
        """
        Verifica se alguma ação atingiu um score alto e cria alertas
        """
        alerts_created = []
        
        # Buscar ações com score alto (>= 8.0) que não foram alertadas recentemente
        high_score_stocks = self.db.query(Stock).filter(
            Stock.final_score >= 8.0,
            Stock.is_qualified == True
        ).all()
        
        for stock in high_score_stocks:
            # Verificar se já existe um alerta recente para esta ação
            recent_alert = self.db.query(Alert).filter(
                Alert.user_id == user.id,
                Alert.stock_id == stock.id,
                Alert.alert_type == AlertType.SCORE_ALERT,
                Alert.created_at >= datetime.now() - timedelta(days=7)  # Evitar spam
            ).first()
            
            if recent_alert:
                continue
            
            alert = Alert(
                user_id=user.id,
                stock_id=stock.id,
                alert_type=AlertType.SCORE_ALERT,
                title=f"⭐ Ação com score excelente: {stock.ticker}",
                message=f"A ação {stock.ticker} ({stock.name}) atingiu um score de {stock.final_score:.1f}/10! Considere analisar esta oportunidade.",
                stock_ticker=stock.ticker,
                stock_name=stock.name,
                current_price=f"R$ {stock.current_price:.2f}" if stock.current_price else None,
                score=f"{stock.final_score:.1f}",
                status=AlertStatus.PENDING
            )
            
            self.db.add(alert)
            alerts_created.append(alert)
        
        self.db.commit()
        return alerts_created
    
    def check_dividend_alerts(self, user: User) -> List[Alert]:
        """
        Verifica ações com dividend yield alto e cria alertas
        """
        alerts_created = []
        
        # Buscar ações com dividend yield >= 6% (critério de Bazin)
        high_dividend_stocks = self.db.query(Stock).filter(
            Stock.dividend_yield >= 6.0,
            Stock.is_qualified == True
        ).all()
        
        for stock in high_dividend_stocks:
            # Verificar se já existe um alerta recente para esta ação
            recent_alert = self.db.query(Alert).filter(
                Alert.user_id == user.id,
                Alert.stock_id == stock.id,
                Alert.alert_type == AlertType.DIVIDEND_ALERT,
                Alert.created_at >= datetime.now() - timedelta(days=30)  # Evitar spam
            ).first()
            
            if recent_alert:
                continue
            
            alert = Alert(
                user_id=user.id,
                stock_id=stock.id,
                alert_type=AlertType.DIVIDEND_ALERT,
                title=f"💰 Alto dividend yield: {stock.ticker}",
                message=f"A ação {stock.ticker} ({stock.name}) tem um dividend yield de {stock.dividend_yield:.1f}%! Atende ao critério de Bazin (6%).",
                stock_ticker=stock.ticker,
                stock_name=stock.name,
                current_price=f"R$ {stock.current_price:.2f}" if stock.current_price else None,
                score=f"{stock.final_score:.1f}" if stock.final_score else None,
                status=AlertStatus.PENDING
            )
            
            self.db.add(alert)
            alerts_created.append(alert)
        
        self.db.commit()
        return alerts_created
    
    def generate_all_alerts(self, user: User) -> List[Alert]:
        """
        Gera todos os tipos de alertas para o usuário
        """
        all_alerts = []
        
        # Verificar alertas de estratégia
        strategy_alerts = self.check_strategy_alerts(user)
        all_alerts.extend(strategy_alerts)
        
        # Verificar alertas de score
        score_alerts = self.check_score_alerts(user)
        all_alerts.extend(score_alerts)
        
        # Verificar alertas de dividend yield
        dividend_alerts = self.check_dividend_alerts(user)
        all_alerts.extend(dividend_alerts)
        
        return all_alerts
