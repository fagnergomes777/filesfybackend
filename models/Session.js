const pool = require('../config/database');

class Session {
  // Criar nova sessão (JWT)
  static async create(userId, jwtToken, refreshToken, expiresAt) {
    try {
      const query = `
        INSERT INTO sessao (usuario_id, jwt_token, refresh_token, expires_at, criado_em)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING *;
      `;
      const result = await pool.query(query, [userId, jwtToken, refreshToken, expiresAt]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      throw error;
    }
  }

  // Buscar sessão por token JWT
  static async findByToken(token) {
    try {
      const query = `
        SELECT * FROM sessao 
        WHERE jwt_token = $1 AND expires_at > CURRENT_TIMESTAMP;
      `;
      const result = await pool.query(query, [token]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar sessão:', error);
      throw error;
    }
  }

  // Buscar todas as sessões do usuário
  static async findByUserId(userId) {
    try {
      const query = `
        SELECT * FROM sessao 
        WHERE usuario_id = $1 AND expires_at > CURRENT_TIMESTAMP
        ORDER BY criado_em DESC;
      `;
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar sessões do usuário:', error);
      throw error;
    }
  }

  // Invalidar sessão por token
  static async invalidateByToken(token) {
    try {
      const query = `
        DELETE FROM sessao WHERE jwt_token = $1;
      `;
      await pool.query(query, [token]);
      return true;
    } catch (error) {
      console.error('Erro ao invalidar sessão:', error);
      throw error;
    }
  }

  // Invalidar todas as sessões do usuário (logout everywhere)
  static async invalidateByUserId(userId) {
    try {
      const query = `
        DELETE FROM sessao WHERE usuario_id = $1;
      `;
      await pool.query(query, [userId]);
      return true;
    } catch (error) {
      console.error('Erro ao invalidar sessões:', error);
      throw error;
    }
  }

  // Limpar sessões expiradas (housekeeping)
  static async cleanupExpired() {
    try {
      const query = `
        DELETE FROM sessao WHERE expires_at < CURRENT_TIMESTAMP;
      `;
      const result = await pool.query(query);
      return result.rowCount;
    } catch (error) {
      console.error('Erro ao limpar sessões expiradas:', error);
      throw error;
    }
  }
}

module.exports = Session;
