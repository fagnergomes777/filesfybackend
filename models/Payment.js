const pool = require('../config/database');

class Payment {
  static async create(userId, subscriptionId, amount, stripeId = null, status = 'pendente') {
    const query = `
      INSERT INTO pagamentos (usuario_id, assinatura_id, valor, stripe_id, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await pool.query(query, [userId, subscriptionId, amount, stripeId, status]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM pagamentos WHERE id = $1;';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = 'SELECT * FROM pagamentos WHERE usuario_id = $1 ORDER BY criado_em DESC;';
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async findByStripeId(stripeId) {
    const query = 'SELECT * FROM pagamentos WHERE stripe_id = $1;';
    const result = await pool.query(query, [stripeId]);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE pagamentos
      SET status = $1
      WHERE id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }
}

module.exports = Payment;
