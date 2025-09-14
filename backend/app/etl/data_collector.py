import httpx
import asyncio
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class DataCollector:
    """
    Coletor de dados de mercado para múltiplas fontes
    """
    
    def __init__(self):
        self.session = httpx.AsyncClient(timeout=30.0)
        self.sources = {
            "status_invest": "https://statusinvest.com.br",
            "fundamentus": "https://www.fundamentus.com.br"
        }
    
    async def collect_stock_data(self, ticker: str) -> Dict[str, Any]:
        """
        Coleta dados de uma ação de múltiplas fontes
        """
        try:
            # Coletar dados de ambas as fontes
            status_data = await self._collect_from_status_invest(ticker)
            fundamentus_data = await self._collect_from_fundamentus(ticker)
            
            # Validar e consolidar dados
            consolidated_data = self._consolidate_data(ticker, status_data, fundamentus_data)
            
            return consolidated_data
            
        except Exception as e:
            logger.error(f"Erro ao coletar dados para {ticker}: {str(e)}")
            return {}
    
    async def _collect_from_status_invest(self, ticker: str) -> Dict[str, Any]:
        """
        Coleta dados do StatusInvest
        """
        try:
            url = f"{self.sources['status_invest']}/acoes/{ticker.lower()}"
            response = await self.session.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extrair dados fundamentais
            data = {}
            
            # Preço atual
            price_element = soup.find('h3', class_='value')
            if price_element:
                data['current_price'] = self._parse_float(price_element.get_text())
            
            # P/L
            pe_element = soup.find('div', string='P/L')
            if pe_element and pe_element.parent:
                pe_value = pe_element.parent.find('strong')
                if pe_value:
                    data['pe_ratio'] = self._parse_float(pe_value.get_text())
            
            # P/VPA
            pb_element = soup.find('div', string='P/VPA')
            if pb_element and pb_element.parent:
                pb_value = pb_element.parent.find('strong')
                if pb_value:
                    data['pb_ratio'] = self._parse_float(pb_value.get_text())
            
            # Dividend Yield
            dy_element = soup.find('div', string='Div. Yield')
            if dy_element and dy_element.parent:
                dy_value = dy_element.parent.find('strong')
                if dy_value:
                    data['dividend_yield'] = self._parse_float(dy_value.get_text())
            
            # ROE
            roe_element = soup.find('div', string='ROE')
            if roe_element and roe_element.parent:
                roe_value = roe_element.parent.find('strong')
                if roe_value:
                    data['roe'] = self._parse_float(roe_value.get_text())
            
            # Margem Líquida
            margin_element = soup.find('div', string='Marg. Líquida')
            if margin_element and margin_element.parent:
                margin_value = margin_element.parent.find('strong')
                if margin_value:
                    data['net_margin'] = self._parse_float(margin_value.get_text())
            
            # Dívida/EBITDA
            debt_element = soup.find('div', string='Dív. Líq. / EBIT')
            if debt_element and debt_element.parent:
                debt_value = debt_element.parent.find('strong')
                if debt_value:
                    data['debt_to_ebitda'] = self._parse_float(debt_value.get_text())
            
            # Payout
            payout_element = soup.find('div', string='Payout')
            if payout_element and payout_element.parent:
                payout_value = payout_element.parent.find('strong')
                if payout_value:
                    data['payout_ratio'] = self._parse_float(payout_value.get_text())
            
            data['source'] = 'status_invest'
            return data
            
        except Exception as e:
            logger.error(f"Erro ao coletar dados do StatusInvest para {ticker}: {str(e)}")
            return {}
    
    async def _collect_from_fundamentus(self, ticker: str) -> Dict[str, Any]:
        """
        Coleta dados do Fundamentus
        """
        try:
            url = f"{self.sources['fundamentus']}/detalhes.php?papel={ticker.upper()}"
            response = await self.session.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            data = {}
            
            # Procurar por tabelas com dados fundamentais
            tables = soup.find_all('table')
            
            for table in tables:
                rows = table.find_all('tr')
                for row in rows:
                    cells = row.find_all(['td', 'th'])
                    if len(cells) >= 2:
                        label = cells[0].get_text().strip()
                        value = cells[1].get_text().strip()
                        
                        # Mapear labels para campos
                        if 'P/L' in label:
                            data['pe_ratio'] = self._parse_float(value)
                        elif 'P/VP' in label:
                            data['pb_ratio'] = self._parse_float(value)
                        elif 'Div. Yield' in label:
                            data['dividend_yield'] = self._parse_float(value)
                        elif 'ROE' in label:
                            data['roe'] = self._parse_float(value)
                        elif 'Marg. Líquida' in label:
                            data['net_margin'] = self._parse_float(value)
                        elif 'Dív. Líq. / EBIT' in label:
                            data['debt_to_ebitda'] = self._parse_float(value)
                        elif 'Payout' in label:
                            data['payout_ratio'] = self._parse_float(value)
            
            data['source'] = 'fundamentus'
            return data
            
        except Exception as e:
            logger.error(f"Erro ao coletar dados do Fundamentus para {ticker}: {str(e)}")
            return {}
    
    def _consolidate_data(self, ticker: str, status_data: Dict, fundamentus_data: Dict) -> Dict[str, Any]:
        """
        Consolida dados de múltiplas fontes com validação cruzada
        """
        consolidated = {
            'ticker': ticker.upper(),
            'last_updated': datetime.now(),
            'data_quality_score': 0.0
        }
        
        # Campos para validação cruzada
        critical_fields = ['pe_ratio', 'pb_ratio', 'dividend_yield', 'roe', 'net_margin', 'debt_to_ebitda', 'payout_ratio']
        
        quality_score = 0
        total_fields = 0
        
        for field in critical_fields:
            status_value = status_data.get(field)
            fundamentus_value = fundamentus_data.get(field)
            
            if status_value is not None and fundamentus_value is not None:
                # Validação cruzada
                discrepancy = abs(status_value - fundamentus_value) / max(status_value, fundamentus_value)
                
                if discrepancy <= 0.05:  # 5% de tolerância
                    # Usar valor do StatusInvest como fonte primária
                    consolidated[field] = status_value
                    quality_score += 1
                else:
                    # Discrepância alta - usar StatusInvest mas marcar
                    consolidated[field] = status_value
                    logger.warning(f"Discrepância alta em {field} para {ticker}: Status={status_value}, Fundamentus={fundamentus_value}")
                    quality_score += 0.5
                
                total_fields += 1
                
            elif status_value is not None:
                consolidated[field] = status_value
                quality_score += 0.8
                total_fields += 1
                
            elif fundamentus_value is not None:
                consolidated[field] = fundamentus_value
                quality_score += 0.6
                total_fields += 1
        
        # Calcular score de qualidade
        if total_fields > 0:
            consolidated['data_quality_score'] = quality_score / total_fields
        
        # Adicionar campos únicos de cada fonte
        consolidated.update({
            'current_price': status_data.get('current_price'),
            'source': 'status_invest'  # Fonte primária
        })
        
        return consolidated
    
    def _parse_float(self, value: str) -> Optional[float]:
        """
        Converte string para float, lidando com formatação brasileira
        """
        if not value or value == '-':
            return None
        
        try:
            # Remover caracteres não numéricos exceto vírgula e ponto
            cleaned = value.replace('%', '').replace('R$', '').strip()
            
            # Substituir vírgula por ponto para conversão
            cleaned = cleaned.replace(',', '.')
            
            return float(cleaned)
        except (ValueError, TypeError):
            return None
    
    async def collect_dividend_history(self, ticker: str) -> List[Dict[str, Any]]:
        """
        Coleta histórico de dividendos
        """
        try:
            # Implementar coleta de histórico de dividendos
            # Por enquanto, retornar lista vazia
            return []
        except Exception as e:
            logger.error(f"Erro ao coletar histórico de dividendos para {ticker}: {str(e)}")
            return []
    
    async def close(self):
        """
        Fecha a sessão HTTP
        """
        await self.session.aclose()
