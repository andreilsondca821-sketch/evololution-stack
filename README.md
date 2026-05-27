# 🚀 Dermatech WhatsApp API

API REST completa para gerenciar WhatsApp integrada com Evolution API. Painel web interativo para gerenciar conversas, enviar mensagens e administrar instâncias WhatsApp.

## 🎯 Funcionalidades

- ✅ **Autenticação JWT** - Login seguro com tokens JWT
- ✅ **Gerenciamento de Instâncias** - Criar, conectar, desconectar WhatsApp
- ✅ **QR Code** - Gerar QR code para autenticação WhatsApp
- ✅ **Enviar Mensagens** - Texto, mídia, botões, templates
- ✅ **Receber Mensagens** - Webhooks para eventos em tempo real
- ✅ **Gerenciar Chats** - Listar, arquivar, mutar, fixar conversas
- ✅ **Painel Web Responsivo** - Interface moderna para gerenciar tudo

## 📋 Pré-requisitos

- Node.js >= 14
- npm ou yarn
- Uma conta na Evolution API (https://evolution.ai)
- MongoDB (opcional, para persistência de dados)

## 🔧 Instalação

### 1. Clone o repositório

\`\`\`bash
git clone https://github.com/andreilsondca821-sketch/evololution-stack.git
cd evololution-stack
\`\`\`

### 2. Instale as dependências

\`\`\`bash
npm install
\`\`\`

### 3. Configure as variáveis de ambiente

\`\`\`bash
cp .env.example .env
\`\`\`

Edite o arquivo \`.env\` com suas configurações:

\`\`\`env
# Servidor
PORT=3000
NODE_ENV=development

# Evolution API
EVOLUTION_API_URL=https://api.evolution.com
EVOLUTION_API_KEY=sua_chave_api_aqui
EVOLUTION_INSTANCE_NAME=dermatech

# JWT
JWT_SECRET=sua_chave_jwt_super_segura
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
\`\`\`

### 4. Inicie o servidor

\`\`\`bash
npm start
\`\`\`

Ou para desenvolvimento com hot-reload:

\`\`\`bash
npm run dev
\`\`\`

O servidor estará disponível em: **http://localhost:3000**

## 📚 API Endpoints

### Autenticação

\`\`\`bash
POST /api/auth/login
POST /api/auth/verify
POST /api/auth/logout
\`\`\`

### Instâncias WhatsApp

\`\`\`bash
POST   /api/instance/create
GET    /api/instance/list
GET    /api/instance/qrcode/:instanceName
GET    /api/instance/connect/:instanceName
GET    /api/instance/info/:instanceName
DELETE /api/instance/logout/:instanceName
PUT    /api/instance/settings/:instanceName
\`\`\`

### Mensagens

\`\`\`bash
POST /api/messages/send-text
POST /api/messages/send-media
POST /api/messages/send-button
POST /api/messages/send-template
GET  /api/messages/chat/:instanceName/:phoneNumber
POST /api/messages/read/:instanceName/:phoneNumber
\`\`\`

### Chats

\`\`\`bash
GET    /api/chats/list/:instanceName
GET    /api/chats/get/:instanceName/:phoneNumber
DELETE /api/chats/delete/:instanceName/:phoneNumber
POST   /api/chats/archive/:instanceName/:phoneNumber
POST   /api/chats/mute/:instanceName/:phoneNumber
GET    /api/chats/search/:instanceName
POST   /api/chats/pin/:instanceName/:phoneNumber
\`\`\`

### Webhooks

\`\`\`bash
POST /api/webhooks/messages
POST /api/webhooks/status
GET  /api/webhooks/events
\`\`\`

## 🔐 Autenticação

A API usa **JWT (JSON Web Tokens)** para autenticação.

### 1. Obter Token

\`\`\`bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dermatech.com",
    "password": "admin@123"
  }'
\`\`\`

**Resposta:**

\`\`\`json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "admin-1",
      "email": "admin@dermatech.com"
    }
  }
}
\`\`\`

### 2. Usar Token em Requisições

\`\`\`bash
curl -X GET http://localhost:3000/api/instance/list \
  -H "Authorization: Bearer seu_token_aqui"
\`\`\`

## 💬 Exemplos de Uso

### Enviar Mensagem de Texto

\`\`\`bash
curl -X POST http://localhost:3000/api/messages/send-text \
  -H "Authorization: Bearer seu_token" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "dermatech",
    "to": "5585987654321",
    "text": "Olá! Como podemos ajudar?"
  }'
\`\`\`

### Listar Conversas

\`\`\`bash
curl -X GET http://localhost:3000/api/chats/list/dermatech \
  -H "Authorization: Bearer seu_token"
\`\`\`

### Gerar QR Code

\`\`\`bash
curl -X GET http://localhost:3000/api/instance/qrcode/dermatech \
  -H "Authorization: Bearer seu_token"
\`\`\`

## 🎨 Painel Web

Acesse o painel em: **http://localhost:3000**

### Como usar:

1. **Configurar API**
   - Digite a URL da API (ex: http://localhost:3000)
   - Cole o token JWT
   - Digite o nome da instância

2. **Conectar WhatsApp**
   - Clique em "Gerar Novo QR Code"
   - Escaneie com seu WhatsApp

3. **Gerenciar Conversas**
   - Liste todas as conversas na esquerda
   - Selecione uma conversa para abrir
   - Envie mensagens usando o input na parte inferior

## 📁 Estrutura do Projeto

\`\`\`
evololution-stack/
├── server.js                    # Servidor principal
├── package.json                 # Dependências
├── .env.example                 # Template de variáveis
├── public/
│   ├── index.html              # Painel HTML
│   ├── app.js                  # JavaScript do frontend
│   └── style.css               # Estilos
├── routes/
│   ├── auth.js                 # Autenticação
│   ├── instance.js             # Gerenciar instâncias
│   ├── messages.js             # Enviar/receber mensagens
│   ├── chats.js                # Gerenciar conversas
│   └── webhooks.js             # Webhooks
├── middleware/
│   ├── auth.js                 # Middleware de autenticação
│   └── errorHandler.js         # Tratamento de erros
└── services/
    └── evolutionService.js     # Cliente da Evolution API
\`\`\`

## 🚀 Deploy

### Deploy no Heroku

\`\`\`bash
heroku create seu-app-name
heroku config:set NODE_ENV=production
heroku config:set EVOLUTION_API_KEY=sua_chave
heroku config:set JWT_SECRET=sua_chave_secreta
git push heroku main
\`\`\`

### Deploy no Railway

\`\`\`bash
railway link
railway variables
# Configure as variáveis
railway up
\`\`\`

## 🐛 Troubleshooting

### Erro: "API Key inválida"

- Verifique se a chave de API está correta no \`.env\`
- Verifique se a URL da Evolution API está correta

### Erro: "Token expirado"

- Faça login novamente para obter um novo token
- Aumente o \`JWT_EXPIRE\` no \`.env\` se necessário

### Webhooks não estão chegando

- Verifique se a URL do webhook está acessível
- Verifique os logs da Evolution API
- Teste o endpoint manualmente

## 📖 Documentação

- [Evolution API Docs](https://evolution.ai/docs)
- [Express.js Guide](https://expressjs.com)
- [JWT Authentication](https://jwt.io)

## 📝 Licença

MIT License - veja LICENSE.md para detalhes

## 🤝 Contribuindo

Pull requests são bem-vindos! Para grandes mudanças, abra uma issue primeiro.

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Consulte a documentação da Evolution API
- Verifique os logs do servidor

---

**Desenvolvido com ❤️ para Dermatech**
