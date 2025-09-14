# Guia de Instalação - Co-piloto Financeiro

## Pré-requisitos

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker e Docker Compose (opcional)

## Instalação com Docker (Recomendado)

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd gestao-v2
```

### 2. Execute com Docker Compose
```bash
docker-compose up -d
```

Isso irá:
- Criar e configurar o banco PostgreSQL
- Configurar o Redis
- Construir e executar o backend Python
- Construir e executar o frontend React

### 3. Acesse a aplicação
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Documentação da API: http://localhost:8000/docs

## Instalação Manual

### Backend (Python)

#### 1. Navegue para a pasta do backend
```bash
cd backend
```

#### 2. Crie um ambiente virtual
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

#### 3. Instale as dependências
```bash
pip install -r requirements.txt
```

#### 4. Configure as variáveis de ambiente
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

#### 5. Configure o banco de dados
```bash
# Crie o banco de dados PostgreSQL
createdb copiloto_financeiro

# Execute as migrações (quando implementadas)
alembic upgrade head
```

#### 6. Execute o servidor
```bash
uvicorn main:app --reload
```

### Frontend (React)

#### 1. Navegue para a pasta do frontend
```bash
cd frontend
```

#### 2. Instale as dependências
```bash
npm install
```

#### 3. Configure as variáveis de ambiente
```bash
cp env.example .env
# Edite o arquivo .env se necessário
```

#### 4. Execute o servidor de desenvolvimento
```bash
npm run dev
```

## Configuração do Banco de Dados

### PostgreSQL

1. Instale o PostgreSQL 15+
2. Crie um banco de dados:
```sql
CREATE DATABASE copiloto_financeiro;
CREATE USER copiloto WITH PASSWORD 'copiloto123';
GRANT ALL PRIVILEGES ON DATABASE copiloto_financeiro TO copiloto;
```

### Redis

1. Instale o Redis 7+
2. Execute o servidor:
```bash
redis-server
```

## Primeiros Passos

### 1. Acesse a aplicação
Abra http://localhost:3000 no seu navegador

### 2. Crie uma conta
- Clique em "Cadastre-se aqui"
- Preencha os dados de registro

### 3. Complete o DNA Financeiro
- Após o login, complete o questionário do DNA Financeiro
- Isso definirá seu perfil de investidor

### 4. Explore as funcionalidades
- **Dashboard**: Visão geral do seu portfólio
- **Radar**: Recomendações de investimentos
- **Portfólio**: Gerencie suas posições
- **Análise**: Analise ações específicas

## Coleta de Dados

### Executar ETL manualmente
```bash
# Via API
curl -X POST http://localhost:8000/api/etl/collect-all-stocks

# Ou via código Python
python -c "
from app.etl.data_collector import DataCollector
import asyncio

async def main():
    collector = DataCollector()
    await collector.collect_stock_data('PETR4')
    await collector.close()

asyncio.run(main())
"
```

## Desenvolvimento

### Estrutura do Projeto
```
gestao-v2/
├── backend/                 # API Python
│   ├── app/
│   │   ├── api/            # Endpoints
│   │   ├── core/           # Configurações
│   │   ├── models/         # Modelos de dados
│   │   ├── services/       # Lógica de negócio
│   │   └── etl/            # Sistema de coleta
│   └── requirements.txt
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Componentes
│   │   ├── pages/          # Páginas
│   │   ├── services/       # Serviços de API
│   │   ├── hooks/          # Custom hooks
│   │   └── types/          # Tipos TypeScript
│   └── package.json
└── docker-compose.yml
```

### Comandos Úteis

#### Backend
```bash
# Executar testes
pytest

# Linting
flake8 app/

# Formatação
black app/
```

#### Frontend
```bash
# Executar testes
npm test

# Linting
npm run lint

# Build para produção
npm run build
```

## Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco de dados**
   - Verifique se o PostgreSQL está rodando
   - Confirme as credenciais no arquivo .env

2. **Erro de conexão com Redis**
   - Verifique se o Redis está rodando
   - Confirme a URL do Redis no arquivo .env

3. **Erro de CORS no frontend**
   - Verifique se o backend está rodando na porta 8000
   - Confirme a configuração de CORS no backend

4. **Dados não carregam**
   - Execute o ETL para coletar dados de mercado
   - Verifique os logs do backend para erros

### Logs

#### Backend
```bash
# Logs do Docker
docker-compose logs backend

# Logs locais
tail -f logs/app.log
```

#### Frontend
```bash
# Logs do Docker
docker-compose logs frontend

# Logs do navegador
# Abra as ferramentas de desenvolvedor (F12)
```

## Suporte

Para dúvidas ou problemas:
1. Verifique este guia
2. Consulte a documentação da API em http://localhost:8000/docs
3. Abra uma issue no repositório
