const pool = require('../config/database');

class Subscription {
  static async create(userId, planType = 'FREE') {
    const query = `
      INSERT INTO assinaturas (usuario_id, tipo_plano, status, iniciado_em)
      VALUES ($1, $2, 'ativo', CURRENT_TIMESTAMP)
      RETURNING *;
    `;
    const result = await pool.query(query, [userId, planType]);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT * FROM assinaturas
      WHERE usuario_id = $1 AND status = 'ativo'
      ORDER BY iniciado_em DESC
      LIMIT 1;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  static async updatePlan(userId, planType) {
    const query = `
      UPDATE assinaturas
      SET tipo_plano = $1, iniciado_em = CURRENT_TIMESTAMP
      WHERE usuario_id = $2 AND status = 'ativo'
      RETURNING *;
    `;
    const result = await pool.query(query, [planType, userId]);
    return result.rows[0];
  }

  static async cancel(subscriptionId) {
    const query = `
      UPDATE assinaturas
      SET status = 'cancelado'
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [subscriptionId]);
    return result.rows[0];
  }
}

module.exports = Subscription;
