# 🧪 Testando a Autenticação do BelaHub

Este documento explica como testar toda a funcionalidade de autenticação que foi implementada na **Sprint 1**.

---

## ✅ O Que Foi Implementado

### Backend
- ✅ Modelo de Usuário (MongoDB)
- ✅ Endpoints de Registro e Login
- ✅ Middleware de Autenticação JWT
- ✅ Proteção de rotas

### Frontend
- ✅ Serviço de Autenticação
- ✅ Store Zustand para gerenciar estado
- ✅ Página de Login/Registro
- ✅ Integração com o App.js
- ✅ Dashboard com informações do usuário
- ✅ Navbar com opção de logout

---

## 🚀 Passo-a-Passo para Testar

### **1. Configurar Backend**

#### Passo 1.1: Configurar variáveis de ambiente
```bash
cd backend
nano .env  # ou abra em um editor de texto
```

Certifique-se que tem:
```env
MONGODB_URI=mongodb://localhost:27017/belahub
JWT_SECRET=sua_chave_secreta_aqui_use_algo_aleatorio
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

#### Passo 1.2: Instalar dependências
```bash
npm install
```

#### Passo 1.3: Iniciar o servidor
```bash
npm run dev
```

Você deve ver:
```
✅ MongoDB conectado: localhost
🚀 BelaHub Backend rodando em http://localhost:5000
📝 API Health: http://localhost:5000/api/health
🌍 CORS habilitado para: http://localhost:3000
📚 Endpoints disponíveis:
   POST   /api/auth/registro
   POST   /api/auth/login
   POST   /api/auth/logout
   GET    /api/auth/me (protegido)
```

---

### **2. Testar Backend com Postman/curl**

#### Teste 1: Health Check
```bash
curl http://localhost:5000/api/health
```

Resultado esperado:
```json
{
  "status": "OK",
  "timestamp": "2026-04-03T...",
  "database": "Conectado"
}
```

#### Teste 2: Registrar Novo Usuário
```bash
curl -X POST http://localhost:5000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "senha": "123456",
    "nomeEmpresa": "Salão da Maria",
    "telefone": "(11) 99999-9999"
  }'
```

Resultado esperado:
```json
{
  "sucesso": true,
  "mensagem": "Usuário registrado com sucesso",
  "token": "eyJhbGc...",
  "usuario": {
    "_id": "...",
    "nome": "João Silva",
    "email": "joao@example.com",
    "nomeEmpresa": "Salão da Maria"
  }
}
```

#### Teste 3: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "senha": "123456"
  }'
```

Resultado esperado:
```json
{
  "sucesso": true,
  "mensagem": "Login realizado com sucesso",
  "token": "eyJhbGc...",
  "usuario": { ... }
}
```

#### Teste 4: Obter Perfil (Protegido)
Copie o token do login e execute:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

Resultado esperado:
```json
{
  "sucesso": true,
  "usuario": { ... }
}
```

---

### **3. Configurar Frontend**

#### Passo 3.1: Instalar dependências
```bash
cd frontend
npm install
```

#### Passo 3.2: Verificar .env
```bash
cat .env
```

Deve ter:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

#### Passo 3.3: Iniciar o frontend
```bash
npm start
```

Você deve ver:
```
Compiled successfully!

You can now view belahub-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

---

### **4. Testar a Interface Completa**

#### Teste 1: Acessar a página de login
1. Abra `http://localhost:3000` no navegador
2. Você deve ver a página de login/registro com dois abas

#### Teste 2: Registrar novo usuário
1. Clique na aba "Registrar"
2. Preencha os campos:
   - Nome Completo: `Maria Silva`
   - Email: `maria@example.com`
   - Empresa: `Salão Maria` (opcional)
   - Telefone: (opcional)
   - Senha: `123456`
   - Confirmar Senha: `123456`
3. Clique em "Criar Conta"
4. Você deve ser redirecionado para o Dashboard

#### Teste 3: Verificar Dashboard
1. Você deve ver "Bem-vindo, Maria Silva! 👋"
2. Deve exibir o nome da empresa se foi preenchido
3. Cards mostrando:
   - 📅 Agendamentos Hoje: 0
   - 👥 Total de Clientes: 0
   - 💰 Receita do Mês: R$ 0,00
   - 💼 Profissionais: 0
4. Seção de próximas etapas

#### Teste 4: Testar Logout
1. Clique no botão "🚪 Sair" na sidebar
2. Você deve ser redirecionado para a página de login

#### Teste 5: Fazer Login
1. Clique na aba "Login"
2. Preencha:
   - Email: `maria@example.com`
   - Senha: `123456`
3. Clique em "Entrar"
4. Você deve voltar ao Dashboard

#### Teste 6: Testar Erro de Senha
1. Na página de login, tente:
   - Email: `maria@example.com`
   - Senha: `999999` (errado)
2. Deve aparecer mensagem de erro: "Email ou senha inválidos"

#### Teste 7: Testar Validações de Registro
1. Clique em "Registrar"
2. Tente submeter sem preencher campos obrigatórios
3. Tente colocar senhas diferentes em "Senha" e "Confirmar Senha"
4. Deve aparecer mensagens de erro apropriadas

---

## 🔄 Fluxo Completo de Autenticação

```
[Usuário não autenticado]
        ↓
[Acessa http://localhost:3000]
        ↓
[Vê página de login/registro]
        ↓
[Escolhe: Login OU Registro]
        ↓
    [LOGIN]                    [REGISTRO]
      ↓                              ↓
[Preenche email/senha]      [Preenche dados]
      ↓                              ↓
[POST /api/auth/login] ←→ [POST /api/auth/registro]
      ↓                              ↓
[Backend valida credenciais] [Backend cria usuário]
      ↓                              ↓
[Gera JWT token]             [Gera JWT token]
      ↓                              ↓
[Frontend salva em localStorage] [Frontend salva em localStorage]
      ↓                              ↓
[Redireciona para Dashboard]  [Redireciona para Dashboard]
      ↓
[Usuário autenticado]
      ↓
[Pode acessar todas as rotas protegidas]
      ↓
[Ao sair, token é removido do localStorage]
```

---

## 🛠️ Troubleshooting

### Erro: "Cannot GET /api/auth/login"
- Verifique se o backend está rodando em `http://localhost:5000`
- Verifique se a porta não está em uso
- Execute: `npm run dev` na pasta `backend`

### Erro: "MongoDB connection refused"
- Verifique se MongoDB está instalado e rodando
- Execute: `mongod` em outro terminal
- Ou use MongoDB Atlas (cloud)

### Erro: "CORS error"
- Verifique se `FRONTEND_URL` em `.env` do backend está correto
- Deve ser `http://localhost:3000`

### Erro: "Token inválido"
- O token pode ter expirado
- Faça login novamente

### Token não está sendo salvo
- Verifique se localStorage está habilitado no navegador
- Abra DevTools (F12) → Console → execute: `localStorage.getItem('token')`

---

## 📊 Verificar Dados no MongoDB

Para ver os usuários criados no MongoDB:

```bash
# Conectar ao MongoDB local
mongo

# Usar banco
use belahub

# Ver usuários
db.usuarios.find()

# Ver usuário específico
db.usuarios.findOne({ email: 'maria@example.com' })
```

---

## ✅ Checklist de Testes

- [ ] Backend inicia sem erros
- [ ] Health check retorna "Conectado"
- [ ] Pode registrar novo usuário
- [ ] Pode fazer login com credenciais corretas
- [ ] Erro ao tentar login com senha errada
- [ ] Pode ver dashboard após login
- [ ] Dashboard exibe nome do usuário
- [ ] Pode fazer logout
- [ ] Após logout, redirecionado para login
- [ ] Token é salvo em localStorage
- [ ] Validações de registro funcionam
- [ ] Não pode acessar dashboard sem login

---

## 🎉 Parabéns!

Se todos os testes passaram, você tem a autenticação completa funcionando!

**Próxima Sprint:** Implementar agendamentos

---

## 📝 Notas Importantes

- ⚠️ A senha é **hasheada** com bcryptjs (segura)
- ⚠️ O token **expira em 7 dias** (configurável em JWT_EXPIRE)
- ⚠️ Não armazene senhas em localStorage (apenas token JWT)
- ⚠️ Em produção, use **HTTPS** (não HTTP)

---

**Status:** ✅ Sprint 1 - Autenticação Completa

Boa sorte com o BelaHub! 🚀
