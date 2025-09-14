from typing import Dict, Any
from app.models.user import InvestorArchetype
from app.schemas.user import DNAFinanceiroRequest

class DNACalculator:
    """
    Calculadora do DNA Financeiro - Define o arquétipo do investidor
    """
    
    def calculate_archetype(self, dna_data: DNAFinanceiroRequest) -> Dict[str, Any]:
        """
        Calcula o arquétipo do investidor baseado nas respostas do questionário
        """
        scores = self._calculate_scores(dna_data)
        archetype = self._determine_archetype(scores)
        
        return {
            "archetype": archetype,
            "description": self._get_archetype_description(archetype),
            "investment_philosophy": self._get_investment_philosophy(archetype),
            "recommended_weights": self._get_recommended_weights(archetype),
            "scores": scores
        }
    
    def _calculate_scores(self, dna_data: DNAFinanceiroRequest) -> Dict[str, float]:
        """
        Calcula pontuações para cada dimensão
        """
        # Normalizar respostas para 0-1
        def normalize(value: int, min_val: int = 1, max_val: int = 10) -> float:
            return (value - min_val) / (max_val - min_val)
        
        # Pontuação de Renda (dividendos)
        income_score = (
            normalize(dna_data.dividend_preference) * 0.4 +
            normalize(dna_data.investment_goal == "renda_passiva" and 10 or 1) * 0.3 +
            normalize(dna_data.long_term_commitment) * 0.3
        )
        
        # Pontuação de Valor (margem de segurança)
        value_score = (
            normalize(dna_data.value_preference) * 0.4 +
            normalize(dna_data.risk_tolerance, 1, 10) * 0.3 +  # Menor tolerância = mais valor
            normalize(dna_data.investment_experience) * 0.3
        )
        
        # Pontuação de Qualidade (empresas sólidas)
        quality_score = (
            normalize(dna_data.quality_preference) * 0.4 +
            normalize(dna_data.market_volatility_tolerance, 1, 10) * 0.3 +  # Menor tolerância = mais qualidade
            normalize(dna_data.investment_horizon, 1, 30) * 0.3
        )
        
        return {
            "income": income_score,
            "value": value_score,
            "quality": quality_score
        }
    
    def _determine_archetype(self, scores: Dict[str, float]) -> InvestorArchetype:
        """
        Determina o arquétipo baseado nas pontuações
        """
        income = scores["income"]
        value = scores["value"]
        quality = scores["quality"]
        
        # Lógica de decisão baseada nas pontuações
        if income > 0.7 and income > value and income > quality:
            return InvestorArchetype.CONSTRUTOR_RENDA
        elif value > 0.7 and value > income and value > quality:
            return InvestorArchetype.CACADOR_VALOR
        else:
            return InvestorArchetype.SOCIO_PACIENTE
    
    def _get_archetype_description(self, archetype: InvestorArchetype) -> str:
        """
        Retorna descrição do arquétipo
        """
        descriptions = {
            InvestorArchetype.CONSTRUTOR_RENDA: (
                "Você é um Construtor de Renda! Seu foco está em construir um fluxo de renda passiva "
                "através de dividendos consistentes e crescentes. Você valoriza a estabilidade e a "
                "previsibilidade dos proventos, seguindo a filosofia de Décio Bazin e Luiz Barsi."
            ),
            InvestorArchetype.CACADOR_VALOR: (
                "Você é um Caçador de Valor! Seu foco está em encontrar empresas com grande margem "
                "de segurança, comprando ativos por menos do que valem. Você segue os princípios "
                "de Benjamin Graham, buscando oportunidades de compra com desconto significativo."
            ),
            InvestorArchetype.SOCIO_PACIENTE: (
                "Você é um Sócio Paciente! Seu perfil é equilibrado, combinando valor, renda e "
                "qualidade. Você investe para o longo prazo, buscando empresas sólidas que "
                "ofereçam tanto crescimento quanto dividendos consistentes."
            )
        }
        return descriptions[archetype]
    
    def _get_investment_philosophy(self, archetype: InvestorArchetype) -> str:
        """
        Retorna a filosofia de investimento do arquétipo
        """
        philosophies = {
            InvestorArchetype.CONSTRUTOR_RENDA: (
                "Foque em empresas com histórico de dividendos crescentes, payout sustentável "
                "e setores perenes. Priorize a consistência dos proventos sobre o crescimento "
                "do preço das ações."
            ),
            InvestorArchetype.CACADOR_VALOR: (
                "Busque empresas com P/L e P/VPA baixos, margem de segurança significativa e "
                "fundamentos sólidos. Compre quando o mercado está pessimista e venda quando "
                "está otimista demais."
            ),
            InvestorArchetype.SOCIO_PACIENTE: (
                "Invista em empresas de alta qualidade com boa governança, setores defensivos "
                "e histórico de crescimento sustentável. Mantenha o foco no longo prazo e "
                "reinvista os dividendos para acelerar o crescimento."
            )
        }
        return philosophies[archetype]
    
    def _get_recommended_weights(self, archetype: InvestorArchetype) -> Dict[str, float]:
        """
        Retorna os pesos recomendados para o sistema de scoring
        """
        weights = {
            InvestorArchetype.CONSTRUTOR_RENDA: {
                "value": 0.2,
                "income": 0.6,
                "quality": 0.2,
                "description": "60% foco em renda, 20% valor, 20% qualidade"
            },
            InvestorArchetype.CACADOR_VALOR: {
                "value": 0.6,
                "income": 0.2,
                "quality": 0.2,
                "description": "60% foco em valor, 20% renda, 20% qualidade"
            },
            InvestorArchetype.SOCIO_PACIENTE: {
                "value": 0.4,
                "income": 0.3,
                "quality": 0.3,
                "description": "40% valor, 30% renda, 30% qualidade"
            }
        }
        return weights[archetype]
