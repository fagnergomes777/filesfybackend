const { Pool } = require('pg');
require('dotenv').config();

// Configuração do pool PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'filesfy_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
});

pool.on('error', (err) => {
  console.error('⚠️ Erro na conexão PostgreSQL:', err.message);
  console.error('💡 PostgreSQL não está rodando. Inicie com: pg_ctl -D "C:\\Program Files\\PostgreSQL\\16\\data" start');
  console.error('Ou use SQLite para desenvolvimento.');
  // Não encerrar o processo - permitir desenvolvimento com mock data
});

// Testar conexão
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.warn('⚠️ Não foi possível conectar ao PostgreSQL');
    console.warn('Usando mock data para desenvolvimento. Para banco de dados real, inicie PostgreSQL.');
  } else {
    console.log('✅ Conexão PostgreSQL estabelecida');
  }
});

module.exports = pool;
