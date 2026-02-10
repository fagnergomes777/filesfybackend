-- Adicionar coluna senha à tabela usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS senha VARCHAR(255);
