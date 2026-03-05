const { admin, initializeFirebaseAdmin } = require('../config/firebaseAdmin');

initializeFirebaseAdmin();

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Token não enviado.' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido.' });
  }
}

module.exports = authMiddleware;