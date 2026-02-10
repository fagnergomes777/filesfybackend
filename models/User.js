const pool = require('../config/database');

class User {
  static async create(googleId, email, name, avatarUrl = null, password = null) {
    const query = `
      INSERT INTO usuarios (google_id, email, nome, avatar_url, senha)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await pool.query(query, [googleId, email, name, avatarUrl, password]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM usuarios WHERE email = $1;';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findByGoogleId(googleId) {
    const query = 'SELECT * FROM usuarios WHERE google_id = $1;';
    const result = await pool.query(query, [googleId]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM usuarios WHERE id = $1;';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) return null;

    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    const query = `
      UPDATE usuarios 
      SET ${setClause}, atualizado_em = CURRENT_TIMESTAMP
      WHERE id = $${fields.length + 1}
      RETURNING *;
    `;
    
    const result = await pool.query(query, [...values, id]);
    return result.rows[0];
  }
}

module.exports = User;
