-- Dropar tabelas existentes
DROP TABLE IF EXISTS pagamentos CASCADE;
DROP TABLE IF EXISTS assinaturas CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- Tabela: usuarios
CREATE TABLE usuarios (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  google_id VARCHAR(255) UNIQUE,
  avatar_url TEXT,
  senha VARCHAR(255),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_google_id ON usuarios(google_id);

-- Tabela: assinaturas
CREATE TABLE assinaturas (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo_plano VARCHAR(50) NOT NULL DEFAULT 'FREE',
  status VARCHAR(50) NOT NULL DEFAULT 'ativo',
  iniciado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expira_em TIMESTAMP,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_tipo_plano CHECK (tipo_plano IN ('FREE', 'PRO')),
  CONSTRAINT chk_status CHECK (status IN ('ativo', 'cancelado'))
);

CREATE INDEX idx_assinaturas_usuario_id ON assinaturas(usuario_id);
CREATE INDEX idx_assinaturas_status ON assinaturas(status);

-- Tabela: pagamentos
CREATE TABLE pagamentos (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  assinatura_id BIGINT REFERENCES assinaturas(id) ON DELETE SET NULL,
  stripe_id VARCHAR(255) UNIQUE,
  valor NUMERIC(10,2) NOT NULL,
  moeda VARCHAR(3) DEFAULT 'BRL',
  status VARCHAR(50) NOT NULL DEFAULT 'pendente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_status_pagamento CHECK (status IN ('pendente', 'pago', 'falhou'))
);

CREATE INDEX idx_pagamentos_usuario_id ON pagamentos(usuario_id);
CREATE INDEX idx_pagamentos_assinatura_id ON pagamentos(assinatura_id);
CREATE INDEX idx_pagamentos_stripe_id ON pagamentos(stripe_id);
