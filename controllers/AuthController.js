const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

const client = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

class AuthController {
  static isTestLoginAllowed() {
    if (process.env.ALLOW_TEST_LOGIN === 'true') return true;
    return (process.env.NODE_ENV || 'development') !== 'production';
  }

  static buildTestUser(email, name) {
    const id = 'test_' + crypto.createHash('sha256').update(String(email).toLowerCase()).digest('hex').slice(0, 16);
    return {
      id,
      email,
      nome: name,
      avatar_url: null,
    };
  }

  static async register(req, res) {
    try {
      const { name, email, password } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, email e senha obrigatórios' });
      }

      // Verificar se usuário já existe
      let user = await User.findByEmail(email);
      if (user) {
        return res.status(400).json({ error: 'Email já registrado' });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Criar usuário
      user = await User.create(null, email, name, null, hashedPassword);
      
      // Criar assinatura padrão
      await Subscription.create(user.id, 'FREE');

      // Gerar token
      const subscription = await Subscription.findByUserId(user.id);
      const token = jwt.sign({ 
        userId: user.id, 
        email: user.email, 
        plan: subscription?.tipo_plano || 'FREE' 
      }, process.env.JWT_SECRET || 'seu_secret', { expiresIn: '7d' });

      res.json({
        token,
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.nome, 
          avatar_url: user.avatar_url 
        },
        subscription: { 
          id: subscription?.id, 
          plan_type: subscription?.tipo_plano, 
          status: subscription?.status 
        }
      });
    } catch (error) {
      console.error('Erro ao registrar:', error.message);
      res.status(500).json({ error: 'Erro ao registrar: ' + error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha obrigatórios' });
      }

      // Buscar usuário
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Email ou senha incorretos' });
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.senha || '');
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Email ou senha incorretos' });
      }

      // Gerar token
      const subscription = await Subscription.findByUserId(user.id);
      const token = jwt.sign({ 
        userId: user.id, 
        email: user.email, 
        plan: subscription?.tipo_plano || 'FREE' 
      }, process.env.JWT_SECRET || 'seu_secret', { expiresIn: '7d' });

      res.json({
        token,
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.nome, 
          avatar_url: user.avatar_url 
        },
        subscription: { 
          id: subscription?.id, 
          plan_type: subscription?.tipo_plano, 
          status: subscription?.status 
        }
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error.message);
      res.status(500).json({ error: 'Erro ao fazer login: ' + error.message });
    }
  }

  static async loginWithGoogle(req, res) {
    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ error: 'Token não fornecido' });
      if (!client) return res.status(400).json({ error: 'Google OAuth não configurado' });

      const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
      const { sub: googleId, email, name, picture } = ticket.getPayload();

      let user = await User.findByGoogleId(googleId);
      if (!user) {
        user = await User.create(googleId, email, name, picture);
        await Subscription.create(user.id, 'FREE');
      }

      const jwtToken = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'seu_secret', { expiresIn: '7d' });
      const subscription = await Subscription.findByUserId(user.id);

      res.json({
        token: jwtToken,
        user: { id: user.id, email: user.email, name: user.nome, avatar_url: user.avatar_url },
        subscription: { id: subscription?.id, plan_type: subscription?.tipo_plano, status: subscription?.status }
      });
    } catch (error) {
      console.error('Erro Google login:', error.message);
      res.status(401).json({ error: 'Autenticação falhou' });
    }
  }

  static async testLogin(req, res) {
    try {
      if (!AuthController.isTestLoginAllowed()) {
        return res.status(404).json({ error: 'Rota não encontrada' });
      }

      const { email, name } = req.body;
      if (!email || !name) return res.status(400).json({ error: 'Email e nome obrigatórios' });

      let user;
      let subscription;
      let isMock = false;

      try {
        user = await User.findByEmail(email);
        if (!user) {
          const testGoogleId = 'test_' + Date.now() + '_' + Math.random().toString(36).substring(7);
          user = await User.create(testGoogleId, email, name, null);
          await Subscription.create(user.id, 'FREE');
        }
        subscription = await Subscription.findByUserId(user.id);
      } catch (dbError) {
        // Sem banco (ou credenciais erradas): permitir login de teste para desenvolvimento.
        isMock = true;
        user = AuthController.buildTestUser(email, name);
        subscription = { id: null, tipo_plano: 'FREE', status: 'ACTIVE' };
      }

      const tokenPayload = {
        userId: user.id,
        email: user.email,
        name: user.nome,
        plan: subscription?.tipo_plano || 'FREE',
        testUser: isMock,
      };
      const jwtToken = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'seu_secret', { expiresIn: '7d' });

      res.json({
        token: jwtToken,
        user: { id: user.id, email: user.email, name: user.nome, avatar_url: user.avatar_url },
        subscription: { id: subscription?.id, plan_type: subscription?.tipo_plano, status: subscription?.status }
      });
    } catch (error) {
      // Última linha de defesa: se o banco falhar, ainda assim permitir modo teste.
      const message = String(error?.message || '');
      const looksLikeDbAuth = /senha\s+falhou|password\s+authentication\s+failed/i.test(message);
      if (AuthController.isTestLoginAllowed() && looksLikeDbAuth) {
        const { email, name } = req.body || {};
        if (!email || !name) return res.status(400).json({ error: 'Email e nome obrigatórios' });

        const user = AuthController.buildTestUser(email, name);
        const subscription = { id: null, tipo_plano: 'FREE', status: 'ACTIVE' };
        const tokenPayload = {
          userId: user.id,
          email: user.email,
          name: user.nome,
          plan: 'FREE',
          testUser: true,
        };
        const jwtToken = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'seu_secret', { expiresIn: '7d' });
        return res.json({
          token: jwtToken,
          user: { id: user.id, email: user.email, name: user.nome, avatar_url: user.avatar_url },
          subscription: { id: subscription.id, plan_type: subscription.tipo_plano, status: subscription.status }
        });
      }

      console.error('Erro test login:', message);
      res.status(500).json({ error: 'Erro ao fazer login: ' + message });
    }
  }

  static async verify(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'Token não fornecido' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_secret');

      if (decoded?.testUser) {
        return res.json({
          user: { id: decoded.userId, email: decoded.email, name: decoded.name, avatar_url: null },
          subscription: { id: null, plan_type: decoded.plan || 'FREE', status: 'ACTIVE' }
        });
      }

      const user = await User.findById(decoded.userId);
      if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });

      const subscription = await Subscription.findByUserId(user.id);
      res.json({
        user: { id: user.id, email: user.email, name: user.nome, avatar_url: user.avatar_url },
        subscription: { id: subscription?.id, plan_type: subscription?.tipo_plano, status: subscription?.status }
      });
    } catch (error) {
      console.error('Erro verify:', error.message);
      res.status(401).json({ error: 'Token inválido' });
    }
  }

  static async logout(req, res) {
    res.json({ success: true, message: 'Logout realizado' });
  }
}

module.exports = AuthController;
