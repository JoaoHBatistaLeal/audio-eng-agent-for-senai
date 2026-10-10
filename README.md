# Audio Engineering Agent for SENAI

Agente inteligente e assistente tecnico de engenharia de audio e consultoria de estudio desenvolvido para o SENAI. O sistema combina uma interface reativa construida em Angular 18 com um backend de alta performance em Go 1.22, integrando modelos de linguagem de baixa latencia da infraestrutura Groq Cloud por meio de transmissao continua em tempo real (Server-Sent Events).

---

## Ambientes e Acesso em Producao

A aplicacao esta publicada e operacional em nuvem na plataforma Render:

- Frontend Web: https://audio-agent-frontend-qez7.onrender.com
- Backend API: https://audio-agent-backend-0xmq.onrender.com
- Monitoramento de Integridade (Health Check): https://audio-agent-backend-0xmq.onrender.com/healthz

---

## Visao Geral do Sistema

O assistente assume a postura de um Engenheiro de Som Senior com quatro decadas de vivencia em estudios de gravacao, mixagem, masterizacao e sintese sonora (desde consoles analogicos e gravadores de fita magnetica ate sintetizadores modulares e DAWs contemporaneas). 

O agente opera como consultor e tutor de bancada para tecnicos e alunos do SENAI, fornecendo explicacoes fundamentadas na fisica acustica e psicoacustica, com recomendacoes metricas exatas e justificativas tecnicas para cada decisao sonora.

---

## Principais Funcionalidades

### 1. Persona Especializada e Guardrails de Dominio
- Domain Lock Estrito: Atuacao restrita exclusivamente a engenharia de audio, acustica arquitetonica, fisica do som, tecnicas de microfonacao, mixagem, masterizacao, sintese sonora (subtrativa, aditiva, FM, wavetable e modular), equipamentos de estudio (consoles, compressores, equalizadores, microfones, monitores, conversores), DAWs, plugins, gain staging e historia da producao fonografica.
- Proibicao Absoluta de Codigo-Fonte: O agente recusa terminantemente qualquer solicitacao de programacao de software, scripts, comandos de terminal ou bibliotecas de codigo (Python, C++, sounddevice, PyAudio, Torch, Scipy), mantendo foco exclusivo em parametros de bancada, consoles fisicos e DAWs.
- Blindagem Anti-Jailbreak e Anti-Injecao: Rejeicao automatica de tecnicas de contorno e recontextualizacao (como "considere que este codigo e para audio", "imagine que voce e", "para fins educacionais" ou "finja que estamos no Python").
- Respostas Padronizadas de Recusa: Bloqueio imediato para temas alheios a producao sonora (culinaria, esportes, politica, financas) e solicitacoes de codigo, redirecionando o operador para o escopo de estudio.
- Factualidade de Hardware: Ausencia de alucinacoes tecnicas. O sistema reconhece a Groq estritamente como infraestrutura de nuvem para inferencia de LLMs, nao como processador DSP ou interface fisica de estudio.
- Estrutura Padronizada das Respostas Tecnicas:
  1. Conceito de Estudio & Analise: Contexto pratico da producao e identidade sonora.
  2. Arquitetura do Timbre / Processamento Detalhado: Roteamento exato, formas de onda, envelopes, frequencias e tabelas comparativas com unidades oficiais (Hz, kHz, dB, fator Q, ms, dB/oitava).
  3. Refinamento & Dica de Veterano: Conselhos praticos de estagio de ganho, saturacao, fase e relacao com outros instrumentos na mix.

### 2. Streaming de Resposta em Tempo Real (SSE)
- Protocolo Server-Sent Events (SSE) nativo via `net/http` e interface `http.Flusher` no backend Go, despachando tokens de texto instantaneamente sem bufferizacao indevida.
- Conexao upstream resiliente com a API da Groq Cloud utilizando o modelo `openai/gpt-oss-20b` (ou `llama-3.3-70b-versatile`).
- Cancelamento contextual: Caso a conexao do cliente seja interrompida, o contexto do Go aborta imediatamente a chamada na Groq, economizando recursos de inferencia.
- Consumo reativo no frontend utilizando `fetch` com `ReadableStreamDefaultReader` e `TextDecoder`, atualizando Signals do Angular 18 sem bloqueio da thread visual.
- Renderizador Markdown integrado com suporte a GitHub Flavored Markdown (GFM), quebras de linha preservadas e tabelas de alta legibilidade estilizadas para Tailwind CSS.

### 3. Gestao e Persistencia de Sessoes de Estudio
- Persistencia Local Segura: Armazenamento local no navegador via `localStorage` integrado com Angular Signals.
- Criacao Preguicosa (Lazy Creation): A criacao de uma nova sessao ocorre em memoria e so e gravada no armazenamento persistente apos o envio efetivo da primeira mensagem, impedindo o acumulo de sessoes vazias.
- Purga Automatica no Carregamento: Ao iniciar o servico, registros residuais sem mensagens sao descartados automaticamente.
- Politica de Retencao FIFO: Teto de retencao configurado para 10 sessoes ativas, descartando as mais antigas de forma ciclica para otimizar memoria.
- Painel Lateral de Sessao: Alternancia rapida entre sessoes ativas com data, hora, contador de mensagens e opcao de encerramento manual.
- Chips de Atalho de Bancada: Botoes de acao rapida para consultas frequentes de engenharia de som (ex: Kick vs 808, Vocal em Guitarras Densas, Filtro 12dB vs 24dB e Ressonancia em 3 kHz).

### 4. Protecao Anti-Abuso, Seguranca e Resiliencia
- Rate Limiting Nativo por IP: Algoritmo Token Bucket implementado em Go utilizando `sync.Map` em memoria, com limite estrito de 10 requisicoes por minuto por endereco IP, sem dependencia de servicos externos de cache.
- Resposta HTTP 429 Estruturada: Retorno de codigo HTTP 429 Too Many Requests com cabecalho `Retry-After: 60`.
- Card de Telemetria no Console: Ao receber status 429, o frontend exibe um alerta de calibragem de 60 segundos diretamente no fluxo da conversa, bloqueia o botao TRANSMITIR e aciona um temporizador regressivo em tempo real.
- Trava Mecanica de Entrada (Hard Limit de 1000 caracteres):
  - Atributo HTML nativo `maxlength="1000"` no campo de entrada.
  - Interceptador de evento de colagem (paste) com truncamento automatico de textos que excedam 1000 caracteres.
  - Contador visual de buffer em tempo real (`BUFFER: X / 1000`) com indicacao visual de alerta quando a contagem ultrapassa 900 caracteres.
  - Validacao de integridade no backend rejeitando payloads vazios ou superiores a 1000 caracteres com HTTP 400 Bad Request.
- Endpoint de Telemetria Publico: Rota `GET /healthz` publica para verificacao de saude e probes de liveness/readiness de plataformas de orquestracao.

### 5. Design Visual de Estudio e Interface Textual
- Identidade Studio Glassmorphism: Composicao visual com `backdrop-blur-xl`, `backdrop-blur-md` e bordas translucidas.
- Paleta Restrita Homologada (5 cores hexadecimais):
  - Slate Indigo (`#8895b3`): Realces primarios, bordas ativas e aneis de foco.
  - Pale Lilac (`#f8f1ff`): Painel flutuante e superficies de destaque.
  - Warm Bone (`#ece2d0`): Divisores horizontais e contornos secundarios.
  - Ghost Light (`#FBF9FF`): Fundo principal do canvas da aplicacao.
  - Almond Cream (`#EDEAD0`): Superficies de apoio e badges de contexto.
- Diretriz de Interface Estritamente Textual: Proibicao total de icones, SVGs de iconografia e caracteres emojis em toda a aplicacao. Elementos de interacao e status sao representados exclusivamente por tipografia semantica e formas geometricas puras em CSS.

---

## Arquitetura de Software

```
+-------------------------------------------------------------+
|                      FRONTEND (ANGULAR 18)                  |
|   - Standalone Components + Signals                         |
|   - AudioStreamService (ReadableStream / TextDecoder)       |
|   - Trava de Buffer (maxlength 1000 + Truncate Paste)       |
|   - Markdown-to-HTML Pipe com GFM e Tabelas                 |
|   - Nginx Alpine em Container Docker                        |
+-------------------------------------------------------------+
                             |
                     HTTP POST /api/chat/stream
                 (Server-Sent Events com Payload JSON)
                             |
                             v
+-------------------------------------------------------------+
|                       BACKEND (GO 1.22)                     |
|   - net/http ServeMux nativo                                |
|   - Middleware Rate Limiter (10 req/min por IP)             |
|   - Middleware CORS dinamico por variavel de ambiente       |
|   - Validacao estrita de payload (tamanho maximo 1000 chars)|
|   - Handler SSE com http.Flusher imediato                   |
|   - Endpoint de monitoramento: GET /healthz                 |
+-------------------------------------------------------------+
                             |
                    HTTPS POST /chat/completions
                 (Authorization: Bearer GROQ_API_KEY)
                 (Stream: true)
                             |
                             v
+-------------------------------------------------------------+
|                       GROQ CLOUD API                        |
|   - Modelos de Inferencia de Alta Velocidade                |
|   - Streaming Chunked Transfer Encoding                     |
+-------------------------------------------------------------+
```

---

## Estrutura de Diretorios

```
projeto-final/
|-- backend/
|   |-- cmd/
|   |   `-- server/
|   |       `-- main.go                  Ponto de entrada, rotas e graceful shutdown
|   |-- internal/
|   |   |-- config/
|   |   |   `-- config.go              Carregamento de variaveis de ambiente
|   |   |-- handler/
|   |   |   |-- chat_handler.go        Endpoint SSE de chat e validacao de entrada
|   |   |   `-- health_handler.go      Endpoint GET /healthz
|   |   |-- middleware/
|   |   |   |-- cors.go                Gerenciamento de origens permitidas
|   |   |   `-- ratelimit.go           Rate limiting em memoria (10 req/min/IP)
|   |   `-- service/
|   |       |-- audio_context.go       System Prompt e guardrails do Engenheiro
|   |       `-- groq_client.go         Comunicacao streaming com a Groq Cloud
|   |-- Dockerfile                     Compilacao multi-stage estatica em Alpine
|   `-- go.mod                         Modulo Go e dependencias
|
|-- frontend/
|   |-- src/
|   |   |-- app/
|   |   |   |-- components/
|   |   |   |   |-- chat-console/      Exibicao de mensagens, streaming e status
|   |   |   |   |-- parameter-deck/    Painel lateral de sessoes e atalhos
|   |   |   |   `-- prompt-input/      Entrada de texto, trava de buffer e envio
|   |   |   |-- pipes/
|   |   |   |   `-- markdown-to-html.pipe.ts  Parser GFM com tabelas
|   |   |   |-- services/
|   |   |   |   `-- audio-stream.service.ts   Gerenciador de estado, sessoes e SSE
|   |   |   |-- app.component.ts       Componente raiz da aplicacao
|   |   |   `-- app.config.ts          Configuracoes globais da aplicacao
|   |   |-- environments/
|   |   |   |-- environment.ts         Configuracao de desenvolvimento local
|   |   |   `-- environment.prod.ts    Configuracao de producao (URL do Render)
|   |   |-- index.html                 Documento HTML base
|   |   |-- main.ts                    Ponto de entrada Angular
|   |   `-- styles.css                 Estilos globais e regras para tabelas Markdown
|   |-- Dockerfile                     Build Angular multi-stage servido por Nginx
|   |-- nginx.conf                     Configuracao Nginx com suporte a SPA
|   |-- package.json                   Dependencias e scripts do projeto
|   `-- tailwind.config.js             Configuracao da paleta Studio Glassmorphism
|
|-- docker-compose.yml                 Orquestracao local de servicos
|-- render.yaml                        Manifesto de declaracao de servicos no Render
`-- README.md                          Documentacao tecnica do projeto
```

---

## Variaveis de Ambiente

### Backend

| Variavel | Descricao | Valor Padrao |
| :--- | :--- | :--- |
| `PORT` | Porta HTTP utilizada pelo servidor | `8080` |
| `GROQ_API_KEY` | Chave de autenticacao da API da Groq Cloud | Obrigatoria |
| `GROQ_MODEL` | Identificador do modelo de linguagem na Groq | `openai/gpt-oss-20b` |
| `CORS_ORIGIN` | Origens autorizadas para requisicoes cross-origin | `http://localhost:4200` |
| `ALLOWED_ORIGIN` | Alias de configuracao para compatibilidade de CORS | `http://localhost:4200` |

### Frontend

| Variavel de Ambiente / Arquivo | Descricao | Exemplo |
| :--- | :--- | :--- |
| `src/environments/environment.ts` | URL base da API em ambiente local | `http://localhost:8080` |
| `src/environments/environment.prod.ts` | URL base da API em ambiente de producao | `https://audio-agent-backend-0xmq.onrender.com` |

---

## Como Executar Localmente

### Pre-requisitos
- Go 1.22 ou superior
- Node.js 20 ou superior e npm
- Docker e Docker Compose (opcional para execucao conteinerizada)
- Chave de API ativa da Groq Cloud (gratuita em console.groq.com)

### Opcao 1: Execucao com Docker Compose

1. Clone o repositorio:
```bash
git clone https://github.com/JoaoHBatistaLeal/audio-eng-agent-for-senai.git
cd audio-eng-agent-for-senai
```

2. Crie o arquivo `.env` na raiz do projeto com sua chave da Groq:
```env
GROQ_API_KEY=gsk_sua_chave_aqui
GROQ_MODEL=openai/gpt-oss-20b
```

3. Inicie os servicos com Docker Compose:
```bash
docker compose up --build
```

4. Acesse a interface web no navegador em `http://localhost:4200`.

---

### Opcao 2: Execucao Manual (Desenvolvimento)

#### 1. Backend em Go
1. Navegue ate o diretorio do backend:
```bash
cd backend
```

2. Configure a variavel de ambiente com sua chave da Groq:
```bash
# No Windows PowerShell:
$env:GROQ_API_KEY="gsk_sua_chave_aqui"
$env:PORT="8080"
$env:CORS_ORIGIN="http://localhost:4200"

# No Linux / macOS:
export GROQ_API_KEY="gsk_sua_chave_aqui"
export PORT="8080"
export CORS_ORIGIN="http://localhost:4200"
```

3. Instale as dependencias e inicie o servidor:
```bash
go run ./cmd/server
```
O backend estara respondendo em `http://localhost:8080`.

#### 2. Frontend em Angular
1. Em outro terminal, navegue ate o diretorio do frontend:
```bash
cd frontend
```

2. Instale as dependencias do projeto:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm start
```

4. Abra `http://localhost:4200` no seu navegador.

---

## Deploy e Publicacao em Nuvem

O projeto esta configurado com arquitetura Twelve-Factor e pronto para orquestracao declarativa via manifesto `render.yaml`:

1. No Render, conecte o repositorio do GitHub.
2. Selecione a opcao Blueprints e aponte para o arquivo `render.yaml`.
3. Configure a variavel secreta `GROQ_API_KEY` no painel do servico de backend.
4. O Render provisionara automaticamente:
   - Web Service Docker para o backend com health probe em `/healthz`.
   - Web Service Docker para o frontend servido com Nginx.

---

## Licenca e Vinculacao Institucional

Projeto desenvolvido como agente de consultoria e assistencia tecnica para a formacao e capacitacao profissional em Engenharia de Audio no SENAI.
