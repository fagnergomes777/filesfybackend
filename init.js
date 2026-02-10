const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

async function init() {
  try {
    console.log('🔧 Inicializando banco de dados...\n');

    // Dropar qualquer tabela/índice legado antes de recriar
    const legacyTables = [
      'payments',
      'subscriptions',
      'users',
      'usuario',
      'pagamentos',
      'assinaturas',
      'usuarios',
      'plano',
      'planos',
      'assinatura',
      'pagamento',
      'sessao',
      'session',
      'sessions',
      'transactions',
      'transaction'
    ];

    for (const table of legacyTables) {
      try {
        await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
      } catch (err) {
        // Ignorar falhas ao remover tabelas inexistentes
      }
    }

    // Remover índices órfãos antigos
    const legacyIndexes = ['idx_sessao_expires_at'];
    for (const index of legacyIndexes) {
      try {
        await pool.query(`DROP INDEX IF EXISTS ${index};`);
      } catch (err) {
        // Ignorar falhas ao remover índices inexistentes
      }
    }

    console.log('✅ Tabelas e índices legados removidos');

    const sql = fs.readFileSync(path.join(__dirname, 'migrations/001_create_tables.sql'), 'utf-8');
    const statements = sql.split(';').filter(s => s.trim());

    for (const statement of statements) {
      if (statement.trim()) await pool.query(statement);
    }

    console.log('✅ Banco criado com sucesso!\n');
    console.log('📊 Tabelas: usuarios, assinaturas, pagamentos\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

init();
