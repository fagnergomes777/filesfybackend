-- Tabela: sessao
-- Armazena sessões JWT para controle de logout e invalidação de tokens
CREATE TABLE IF NOT EXISTS sessao (
  id          BIGSERIAL PRIMARY KEY,
  usuario_id  BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  jwt_token   TEXT NOT NULL UNIQUE,
  refresh_token TEXT,
  expires_at  TIMESTAMP NOT NULL,
  criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessao_usuario_id ON sessao(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessao_jwt_token  ON sessao(jwt_token);
CREATE INDEX IF NOT EXISTS idx_sessao_expires_at ON sessao(expires_at);
