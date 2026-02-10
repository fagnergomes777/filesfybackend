const pool = require('../config/database');

class Payment {
  // Criar novo pagamento
  static async create(userId, subscriptionId, valor, metodo, stripeIntentId = null) {
    try {
      const query = `
        INSERT INTO pagamento (usuario_id, assinatura_id, valor, status, metodo, stripe_intent_id, criado_em)
        VALUES ($1, $2, $3, 'pendente', $4, $5, CURRENT_TIMESTAMP)
        RETURNING *;
      `;
      const result = await pool.query(query, [userId, subscriptionId, valor, metodo, stripeIntentId]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      throw error;
    }
  }

  // Buscar pagamento por ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM pagamento WHERE id = $1;';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar pagamento:', error);
      throw error;
    }
  }

  // Buscar pagamentos do usuário
  static async findByUserId(userId) {
    try {
      const query = `
        SELECT * FROM pagamento 
        WHERE usuario_id = $1 
        ORDER BY criado_em DESC;
      `;
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      throw error;
    }
  }

  // Buscar por Stripe Intent ID
  static async findByStripeIntentId(stripeIntentId) {
    try {
      const query = `
        SELECT * FROM pagamento 
        WHERE stripe_intent_id = $1;
      `;
      const result = await pool.query(query, [stripeIntentId]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar pagamento por Stripe ID:', error);
      throw error;
    }
  }

  // Atualizar status do pagamento
  static async updateStatus(id, status) {
    try {
      const query = `
        UPDATE pagamento 
        SET status = $1, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *;
      `;
      const result = await pool.query(query, [status, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao atualizar status do pagamento:', error);
      throw error;
    }
  }

  // Buscar histórico de pagamentos
  static async findPaidByUserId(userId) {
    try {
      const query = `
        SELECT * FROM pagamento 
        WHERE usuario_id = $1 AND status = 'pago'
        ORDER BY criado_em DESC;
      `;
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar pagamentos realizados:', error);
      throw error;
    }
  }
}

module.exports = Payment;
