const pool = require('./config/database');

// Executar migration para adicionar coluna senha
pool.query('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS senha VARCHAR(255);')
  .then(() => {
    console.log('✅ Coluna senha adicionada/verificada na tabela usuarios');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  });
