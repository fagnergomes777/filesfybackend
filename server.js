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

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/recovery', recoveryRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));
app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada' }));
app.use((err, req, res) => {
  console.error('Erro:', err);
  res.status(500).json({ error: 'Erro interno' });
});

// Testar conexão PostgreSQL antes de iniciar
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', err.message);
    process.exit(1);
  }
  console.log('✅ Conexão PostgreSQL estabelecida');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
