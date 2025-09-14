# Co-piloto Financeiro

## Visão Geral

O Co-piloto Financeiro é um mentor de investimentos digital para investidores iniciantes, baseado nos princípios do Value Investing e Dividend Investing de Benjamin Graham, Décio Bazin e Luiz Barsi.

## Arquitetura do Sistema

### Backend (Python)
- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy** - ORM para banco de dados
- **Celery** - Processamento assíncrono para ETL
- **Redis** - Cache e broker de mensagens
- **PostgreSQL** - Banco de dados principal

### Frontend (React TypeScript)
- **React 18** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Vite** - Build tool moderno
- **Tailwind CSS** - Framework de estilos
- **React Query** - Gerenciamento de estado servidor

## Estrutura do Projeto

```
gestao-v2/
├── backend/                 # API Python
│   ├── app/
│   │   ├── api/            # Endpoints da API
│   │   ├── core/           # Configurações e segurança
│   │   ├── models/         # Modelos de dados
│   │   ├── services/       # Lógica de negócio
│   │   ├── etl/            # Sistema de coleta de dados
│   │   └── utils/          # Utilitários
│   ├── requirements.txt
│   └── main.py
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Serviços de API
│   │   ├── hooks/          # Custom hooks
│   │   ├── types/          # Definições TypeScript
│   │   └── utils/          # Utilitários
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml      # Orquestração de serviços
└── README.md
```

## Funcionalidades Principais

1. **Sistema de Perfil (DNA Financeiro)** - Questionário para definir arquétipo do investidor
2. **Motor de Recomendações** - Análise baseada em Value Investing e Dividend Investing
3. **Gestão de Portfólio** - Acompanhamento de investimentos e dividendos
4. **Simulador de Investimentos** - Teste de impacto antes de investir
5. **ETL de Dados** - Coleta automática de dados de mercado

## Como Executar

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Serviços (Docker)
```bash
docker-compose up -d
```

## Regras de Negócio

O sistema opera com base em três arquétipos de investidor:
- **Construtor de Renda** (60% renda, 20% valor, 20% qualidade)
- **Caçador de Valor** (60% valor, 20% renda, 20% qualidade)  
- **Sócio Paciente** (40% valor, 30% renda, 30% qualidade)

Cada ação recebe notas de 0-10 em Valor, Renda e Qualidade, ponderadas pelo arquétipo do usuário.
