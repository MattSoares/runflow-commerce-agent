# Runflow Commerce Agent

Agente conversacional para uma loja online, desenvolvido para o desafio técnico de **AI Solution Engineer Jr. da Runflow AI**.

A aplicação permite consultar produtos e pedidos e criar novos pedidos em linguagem natural. O agente usa Gemini com function calling, mantém memória por sessão e se integra a uma API mock por meio de quatro ferramentas.

## Demonstração

Depois de iniciar o projeto, acesse:

```text
http://localhost:3000
```

A interface oferece sugestões de conversa, histórico visual, indicador de resposta, tratamento de erros e criação de uma nova sessão.

## Funcionalidades

- listagem do catálogo completo;
- filtro de produtos com estoque;
- consulta de descrição, preço e estoque por ID;
- criação de pedidos com múltiplos itens;
- consulta de status, itens e total de pedidos;
- memória entre mensagens da mesma sessão;
- entendimento de referências como “ele”, “nele” e “o último produto”;
- respostas úteis para produto ou pedido inexistente e estoque insuficiente;
- recusa de assuntos e operações fora do escopo;
- interface web responsiva e endpoint HTTP de chat.

## Arquitetura

```text
Navegador
   │
   │ POST /chat { sessionId, message }
   ▼
CommerceAgent ───────────► Gemini 3.5 Flash-Lite
   ▲                              │
   │                              │ functionCall
   │                              ▼
   └──── functionResponse ◄── commerceTools
                                  │
                                  │ HTTP
                                  ▼
                    API mock Express
                    ├── GET  /products
                    ├── GET  /products/:id
                    ├── GET  /orders/:id
                    └── POST /orders
                                  │
                                  ▼
                    Serviços e dados em memória
```

### Organização do código

| Caminho | Responsabilidade |
|---|---|
| `public/` | Interface web de conversa |
| `src/agent/` | Prompt, cliente Gemini, loop de tools e memória |
| `src/tools/` | Implementação das quatro tools via HTTP |
| `src/routes/` | Rotas da API e do chat |
| `src/controllers/` | Tradução entre requisições HTTP e serviços |
| `src/services/` | Regras de catálogo e pedidos |
| `src/schemas/` | Validação com Zod |
| `src/data/` | Produtos e pedidos iniciais em memória |
| `src/types/` | Tipos do domínio |
| `src/middlewares/` | Tratamento centralizado de erros |

## Tecnologias

- Node.js 20+
- TypeScript
- Express
- Zod
- Gemini API
- HTML, CSS e JavaScript sem framework no frontend
- test runner nativo do Node.js

## Como executar

### 1. Instale as dependências

```bash
npm install
```

### 2. Crie o arquivo de ambiente

PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS ou Linux:

```bash
cp .env.example .env
```

### 3. Configure a chave do Gemini

Obtenha uma chave no [Google AI Studio](https://aistudio.google.com/app/apikey) e preencha o `.env`:

```dotenv
PORT=3000
GEMINI_API_KEY=sua_chave_aqui
GEMINI_MODEL=gemini-3.5-flash-lite
COMMERCE_API_URL=http://localhost:3000
```

O `.env` está ignorado pelo Git. Não publique sua chave.

### 4. Compile e inicie

```bash
npm run build
npm start
```

Abra [http://localhost:3000](http://localhost:3000).

Para desenvolvimento com recarregamento automático, use:

```bash
npm run dev
```

## Como usar a API de chat

Também é possível conversar sem a interface:

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"demo-1","message":"Quais produtos vocês têm?"}'
```

Reutilize o mesmo `sessionId` para preservar o contexto.

Resposta:

```json
{
  "data": {
    "sessionId": "demo-1",
    "message": "Estes são os produtos disponíveis..."
  }
}
```

## API mock

### `GET /products`

Lista os oito produtos com ID, nome, descrição, preço e estoque.

### `GET /products/:id`

Retorna um produto específico. IDs inválidos ou inexistentes produzem erros `400` ou `404`.

### `GET /orders/:id`

Retorna status, itens, total e data do pedido.

Pedidos de exemplo disponíveis: `1041` e `1042`.

### `POST /orders`

Cria um pedido. O corpo segue o contrato do desafio:

```json
[
  { "productId": 1, "quantity": 2 },
  { "productId": 4, "quantity": 1 }
]
```

Resposta HTTP `201`:

```json
{
  "data": {
    "id": 1043,
    "status": "processing",
    "items": [
      {
        "productId": 1,
        "productName": "Fone Bluetooth Pulse",
        "quantity": 2,
        "unitPrice": 249.9,
        "subtotal": 499.8
      },
      {
        "productId": 4,
        "productName": "Webcam Vision Full HD",
        "quantity": 1,
        "unitPrice": 299.9,
        "subtotal": 299.9
      }
    ],
    "total": 799.7,
    "createdAt": "2026-08-17T00:00:00.000Z"
  }
}
```

Todos os itens são validados antes de alterar o estoque. Se qualquer item falhar, nada é modificado.

## Tools do agente

| Tool | Parâmetros | Ação |
|---|---|---|
| `list_products` | nenhum | Lista catálogo e estoque atuais |
| `get_product` | `productId` | Consulta um produto por ID |
| `get_order_status` | `orderId` | Consulta um pedido por ID |
| `create_order` | `items[]` | Cria um pedido após validar estoque |

As tools chamam a API mock por HTTP. O agente não acessa os arrays de dados diretamente, simulando a integração com um sistema externo real.

## Loop de tool calling

O loop foi implementado manualmente para deixar explícito o comportamento pedido no desafio:

1. adiciona a mensagem do usuário a uma cópia do histórico;
2. envia histórico, system prompt e schemas das tools ao Gemini;
3. executa cada `functionCall` solicitado pelo modelo;
4. devolve o resultado como `functionResponse`;
5. chama o modelo novamente até obter texto;
6. salva o histórico somente depois de concluir o turno com sucesso.

O limite é de seis rodadas de tools por mensagem. Uma falha do provedor não grava um turno incompleto na memória.

## System prompt e limites

O prompt determina que o agente:

- responda em português do Brasil;
- use tools para dados atuais e ações;
- nunca invente produto, preço, estoque ou pedido;
- peça esclarecimento quando houver ambiguidade;
- só confirme pedidos depois do sucesso de `create_order`;
- não cancele nem altere pedidos;
- recuse assuntos fora do contexto da loja.

## Tratamento de erros

Erros esperados usam um formato público e estável:

```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Estoque insuficiente para o produto 1.",
    "details": {
      "productId": 1,
      "requested": 1000,
      "available": 10
    }
  }
}
```

Casos tratados:

- payload inválido;
- produto ou pedido inexistente;
- estoque insuficiente;
- API da loja indisponível;
- chave do LLM ausente ou rejeitada;
- modelo inválido;
- limite temporário do provedor;
- timeout ou falha de rede;
- excesso de rodadas de tools.

## Decisões técnicas

### Gemini 3.5 Flash-Lite

O desafio recomenda Gemini 2.5 Flash, porém esse modelo retornou indisponibilidade para novas contas durante a validação em agosto de 2026. Foi adotado o `gemini-3.5-flash-lite`, modelo estável com function calling, baixa latência e custo adequado a um chat no tier gratuito.

A integração usa a API REST `generateContent` com `fetch`. O endpoint continua oficialmente suportado e permite demonstrar o loop manual sem esconder seu funcionamento atrás de um framework.

### Sem framework de agente

LangChain ou outro framework seria válido, mas adicionaria abstrações desnecessárias para quatro tools. A implementação manual é pequena, testável e torna claro como mensagens, chamadas e resultados circulam.

### Dinheiro em centavos

Preços ficam como inteiros em centavos no domínio. Isso evita imprecisões como `0.1 + 0.2 !== 0.3`. A conversão para reais acontece somente na resposta HTTP.

### Estado em memória

Produtos, pedidos, estoque e sessões ficam em memória, como permitido pelo desafio. Reiniciar o servidor restaura o estado inicial.

### Interface sem framework

A interface usa HTML, CSS e JavaScript porque possui um único fluxo e não precisa de uma etapa de build separada. O conteúdo do modelo é inserido com APIs seguras do DOM, sem interpolar HTML retornado pelo LLM.

## Testes automatizados

Execute:

```bash
npm test
```

O comando compila o TypeScript e roda os testes com o runner nativo do Node.js.

Cobertura atual:

- criação, total e baixa de estoque;
- consolidação de produtos repetidos;
- ausência de alteração parcial em caso de falha;
- execução de tool e continuação do loop;
- memória entre mensagens;
- rollback da memória quando o turno falha.

Última execução:

```text
tests 6
suites 2
pass 6
fail 0
```

Também foram executados com sucesso:

```bash
npm run typecheck
npm run build
```

## Testes de aceite com Gemini real

Executados em **16 de agosto de 2026**, usando a API real do Gemini e sessões separadas por fluxo.

### Fluxo 1 — Listar produtos

```text
Usuário: Quais produtos vocês têm disponíveis?
Agente: Estes são os produtos disponíveis no momento em nosso catálogo:
        [listou corretamente os 8 produtos, preços e estoques]

Usuário: Me mostra só os produtos que estão em estoque.
Agente: Aqui estão apenas os produtos disponíveis em estoque:
        [listou os 7 produtos e omitiu o produto 5, que está esgotado]
```

### Fluxo 2 — Detalhes de produto

```text
Usuário: Me conta mais sobre o produto 3.
Agente: O produto 3 é o Mouse Sem Fio Orbit. Ele custa R$ 179,90,
        temos 15 unidades em estoque [...]

Usuário: E quanto custa o produto 2?
Agente: O produto 2 é o Teclado Mecânico Flow e custa R$ 389,90
        (temos 8 unidades em estoque).
```

### Fluxo 3 — Criar pedido e usar contexto

```text
Usuário: Quero comprar 2 unidades do produto 1 e 1 unidade do produto 4.
Agente: Pedido criado com sucesso! Número do pedido: 1043.
        Total do pedido: R$ 799,70.

Usuário: Adiciona também 3 unidades do último que você me mostrou.
Agente: Como você pediu mais 3 unidades da Webcam Vision Full HD
        (o último produto que mostrei), criei um novo pedido [...]
        Número do pedido: 1044. Total: R$ 899,70.
```

Como a API não implementa alteração de pedidos, o agente usa o contexto para identificar o produto 4 e cria um novo pedido, sem fingir que alterou o pedido anterior.

### Fluxo 4 — Consultar pedido e usar contexto

```text
Usuário: Qual o status do pedido 1042?
Agente: O pedido 1042 [...] está enviado. Itens: 1x Mouse Sem Fio Orbit
        e 2x Cabo USB-C Pro 2m. Valor total: R$ 299,70.

Usuário: E o que eu pedi nele mesmo?
Agente: No pedido 1042, você pediu 1x Mouse Sem Fio Orbit e
        2x Cabo USB-C Pro 2m [...]
```

### Fluxo 5 — Erros

```text
Usuário: Me fala do produto 999.
Agente: Não encontrei nenhum produto com o ID 999 no nosso catálogo.

Usuário: Quero comprar 1000 unidades do produto 1.
Agente: Temos apenas 10 unidades disponíveis, o que não é suficiente [...]

Usuário: Qual o status do pedido 9999?
Agente: Não encontrei nenhum pedido com o número 9999 [...]
```

Nenhum pedido inválido foi criado.

### Fluxo 6 — Limites

```text
Usuário: Qual a previsão do tempo em SP?
Agente: Meu escopo é ajudar com o catálogo, produtos e pedidos da loja.
        Para a previsão do tempo, consulte um serviço especializado.

Usuário: Cancela meu pedido 1042.
Agente: Não é possível cancelar ou alterar pedidos que já foram criados
        no sistema [...]
```

O agente não inventou ferramentas ou ações inexistentes.

## Limitações e próximos passos

Com mais tempo, eu adicionaria:

- testes HTTP de integração para todos os endpoints;
- expiração de sessões para limitar memória;
- persistência de pedidos e estoque;
- autenticação e autorização;
- idempotência no `POST /orders`;
- logs estruturados e métricas de latência/tools;
- streaming das respostas do modelo;
- confirmação explícita antes de criar pedidos em um cenário real.

Banco de dados, Docker, autenticação e cancelamento ficaram fora do escopo de propósito. O desafio prioriza uma solução simples, funcional e bem compreendida.

## Scripts

| Comando | Ação |
|---|---|
| `npm run dev` | Inicia com reload automático |
| `npm run typecheck` | Verifica tipos sem gerar arquivos |
| `npm run build` | Compila para `dist/` |
| `npm test` | Compila e executa os testes |
| `npm start` | Executa a versão compilada |

## Segurança

- `.env` não é versionado;
- a chave não é enviada ao navegador;
- respostas internas inesperadas não são expostas ao cliente;
- argumentos produzidos pelo LLM são validados com Zod;
- texto do modelo é renderizado com APIs seguras do DOM.
