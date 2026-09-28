# GovData

Sistema de gestão de serviços públicos — projeto fictício construído para praticar SQL, back-end com Node.js/Express e consumo de API no front-end.

Simula o fluxo de solicitações de serviços públicos entre cidadãos e órgãos governamentais (emissão de documentos, atendimentos, prazos), com dashboard para acompanhar indicadores.

## Objetivo

Projeto de portfólio focado em demonstrar domínio de SQL (consultas, agregações, `JOIN`s) e construção de uma API REST sobre um banco relacional — voltado para oportunidades de estágio em TI, especialmente em órgãos públicos e instituições financeiras.

## Stack

- **Banco de dados:** MySQL
- **Back-end:** Node.js, Express, mysql2
- **Front-end:** HTML, CSS e JavaScript puro (dashboard consumindo a API)

## Modelo de dados

Seis tabelas relacionais:

| Tabela | Descrição |
|---|---|
| `cidadaos` | Pessoas que solicitam serviços públicos |
| `orgaos` | Órgãos públicos responsáveis pelos serviços |
| `funcionarios` | Funcionários vinculados a um órgão |
| `servicos` | Serviços oferecidos por cada órgão |
| `solicitacoes` | Pedidos de serviço feitos pelos cidadãos |
| `atendimentos` | Registro de atendimento de uma solicitação por um funcionário |

Relacionamentos principais: `orgaos` → `funcionarios`, `orgaos` → `servicos`, `cidadaos` → `solicitacoes`, `servicos` → `solicitacoes`, `solicitacoes` → `atendimentos`, `funcionarios` → `atendimentos`.

## Rotas da API

**Dados brutos**
```
GET /cidadaos
GET /orgaos
GET /funcionarios
GET /servicos
GET /solicitacoes
GET /atendimentos
```

**Relatórios**
```
GET /relatorios/demanda-cidade            → solicitações agrupadas por cidade
GET /relatorios/demanda-solicitacoes      → solicitações por data e cidadão
GET /relatorios/status-solicitacoes       → total de solicitações por status
GET /relatorios/pedidos-servicos          → total de solicitações por categoria de serviço
GET /relatorios/tempo-medio-atendimentos  → tempo médio (em dias) entre solicitação e conclusão
```

## Como rodar localmente

1. Clone o repositório e instale as dependências:
   ```bash
   npm install
   ```
2. Crie o banco `govdata` no MySQL e rode o script de criação das tabelas (`/database/schema.sql`, se você adicionar esse arquivo ao repo).
3. Ajuste as credenciais de conexão com o banco no arquivo do servidor (host, usuário, senha).
4. Inicie o servidor:
   ```bash
   node server.js
   ```
5. Acesse o dashboard em [http://localhost:3000](http://localhost:3000).

## Status

Em desenvolvimento — próximos passos incluem relatórios agrupados por órgão e por serviço específico, e páginas dedicadas no dashboard para cada entidade (cidadãos, solicitações, órgãos).

## Autor

Desenvolvido por Lucas como projeto de portfólio.