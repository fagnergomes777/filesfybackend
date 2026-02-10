# Filesfy - Recuperação de Dados

Sistema completo de gerenciamento de planos e recuperação de arquivos com duas versões:
- **Versão Web**: Gerenciamento de assinaturas e planos
- **Versão Desktop (Electron)**: Recuperação completa de arquivos deletados

## 🚀 Início Rápido

```bash
# 1. Instalar dependências
npm install

# 2. Inicializar banco de dados
psql -U postgres -d filesfy_db -f backend/migrations/001_create_tables.sql

# 3. Inserir planos
psql -U postgres -d filesfy_db -c "INSERT INTO plano (nome, limite_restauracoes, valor, ativo) VALUES ('FREE', 5, 0.00, true), ('PRO', NULL, 29.90, true) ON CONFLICT (nome) DO NOTHING;"

# 4. Iniciar versão Desktop (Electron com recuperação)
npm start

# 5. Iniciar versão Web (apenas planos)
npm run start:web
```

## ⚙️ Configuração

Crie `.env` na raiz com as credenciais do PostgreSQL:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=filesfy_db
DB_USER=postgres
DB_PASSWORD=sua_senha

JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRATION=7d

STRIPE_SECRET_KEY=sk_test_xxx

PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 📁 Estrutura do Projeto

```
backend/              # Express API (porta 3001)
  ├── server.js       # Servidor principal
  ├── config/         # Configuração (database)
  ├── controllers/    # Lógica de negócio
  ├── models/         # Queries SQL
  ├── routes/         # Endpoints
  └── migrations/     # Schema SQL

electron/            # Electron main process
  ├── main.js         # Processo principal do Electron
  └── preload.js      # Script de preload

src/                 # Frontend Electron (Desktop)
  ├── index.html      # Interface principal Desktop
  ├── renderer.js     # Lógica da aplicação Desktop
  ├── api.js          # Cliente HTTP
  ├── auth.js         # Autenticação
  └── styles.css      # Estilos Desktop

frontend/            # Frontend Web
  ├── server.js       # Servidor estático (porta 3000)
  └── public/         # Arquivos públicos da versão Web
      ├── index.html  # Interface Web
      ├── app.js      # Lógica da versão Web
      ├── api.js      # Cliente HTTP Web
      ├── auth.js     # Autenticação Web
      └── styles.css  # Estilos Web
```

## ✨ Funcionalidades

### Versão Web (frontend/)
- ✅ Visualização e seleção de planos (FREE e PRO)
- ✅ Autenticação Google OAuth + Modo Teste
- ✅ Sistema de pagamentos (PIX, Crédito, Débito)
- ✅ Botão para download da versão Desktop
- ✅ Acessibilidade (Zoom, Alto Contraste, Leitura por Voz)
- ✅ Interface responsiva e moderna

### Versão Desktop (src/ + electron/)
- ✅ Recuperação completa de arquivos deletados
- ✅ Suporte a múltiplos dispositivos:
  - 💾 HDD/SSD (Discos internos e externos)
  - 📱 Dispositivos Móveis (Smartphones e Tablets)
  - 🔌 USB/Pen Drives
- ✅ Recuperação por tipo de arquivo:
  - 🖼️ Imagens (JPG, PNG, GIF, etc.)
  - 🎬 Vídeos (MP4, AVI, MOV, etc.)  
  - 📄 Documentos (PDF, DOC, TXT, etc.)
  - 🎵 Áudio (MP3, WAV, FLAC, etc.)
- ✅ Autenticação Google OAuth + Modo Teste
- ✅ Planos FREE (5 arquivos) e PRO (ilimitado)
- ✅ Pagamentos integrados com Stripe
- ✅ Acessibilidade completa
- ✅ Temas claro/escuro automáticos

## 🔐 Autenticação

- **Teste local**: Clique em "Continuar em Modo Teste"
- **Google OAuth**: Configure em `.env` com credenciais do Google Cloud Console

## 💳 Planos

| Recurso | FREE | PRO |
|---------|------|-----|
| Varreduras/mês | 15 | Ilimitado |
| Limite/varredura | 300MB | 128GB |
| Arquivos | 5 max | Ilimitado |
| Preço | Grátis | R$ 15,99/mês |

## 🖥️ Scripts Disponíveis

```bash
# Desenvolvimento
npm start              # Inicia versão Desktop (Electron)
npm run start:web      # Inicia versão Web (porta 3000)
npm run dev:web        # Alias para start:web

# Servidores individuais
npm run server:dev     # Backend API (porta 3001)
npm run frontend:dev   # Frontend Web (porta 3000)
npm run electron:dev   # Apenas Electron

# Banco de dados
npm run init-db        # Inicializa banco de dados
```

## 🔄 Diferenças entre Versões

### Versão Web
- Foco em gerenciamento de planos e assinaturas
- Não possui funcionalidade de recuperação de arquivos
- Botão para download da versão Desktop
- Interface leve e responsiva
- Ideal para consulta rápida e upgrade de planos

### Versão Desktop  
- Recuperação completa de arquivos
- Detecção automática de dispositivos
- Varredura profunda do sistema
- Suporte a todos os tipos de arquivo
- Interface nativa do sistema operacional
- Melhor performance para operações pesadas

## 📜 Licença

MIT © 2026 Filesfy Inc.

