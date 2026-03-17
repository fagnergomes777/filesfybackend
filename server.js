const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/database');

const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payments');
const subscriptionRoutes = require('./routes/subscriptions');
const recoveryRoutes = require('./routes/recovery');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Permite conexões sem origem (ex: curl, postman, electron)
    if (!origin) {
      return callback(null, true);
    }
    
    // Tratamento para evitar falha por trailing slash ('/') e garantir que libere origens válidas
    const cleanOrigin = origin.replace(/\/$/, "");
    const allowed = allowedOrigins.map(o => o.replace(/\/$/, ""));
    
    if (allowed.includes(cleanOrigin) || allowed.includes('*')) {
      return callback(null, true);
    }
    console.warn(`[CORS Blocked] Origem não permitida: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/recovery', recoveryRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));
app.get('/api/test', (req, res) => {
  res.json({ status: 'OK', message: 'A rota de teste está funcionando.' });
});
app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada' }));
app.use((err, req, res) => {
  console.error('Erro:', err);
  res.status(500).json({ error: 'Erro interno' });
});

// Testar conexão PostgreSQL antes de iniciar
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', err.message);
    console.warn('⚠️ Servidor iniciado sem conexão com PostgreSQL');
    return;
  }
  console.log('✅ Conexão PostgreSQL estabelecida');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
