const express = require('express');
const jwt = require('jsonwebtoken');
const Subscription = require('../models/Subscription');

const router = express.Router();

// IMPORTANTE: Rotas específicas DEVEM VIR ANTES de rotas parametrizadas
// Caso contrário, /plans será interpretado como /:userId

router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Filesfy FREE',
        price: 0,
        interval: 'mês',
        originalPrice: null,
        discount: null,
        duration: 'Para sempre',
        button: 'Começar Grátis',
        storage: 0.3,
        recoveries: 1,
        support: 'básico',
        features: [
          { name: 'Até 1 varreduras por mês', included: true },
          { name: 'Limite 2GB por varredura', included: true },
          { name: 'Máximo 5 arquivos', included: true },
          { name: 'Recuperação básica', included: true },
          { name: 'Com anúncios', included: true },
          { name: 'Sem limite de arquivos', included: false },
          { name: 'Suporte por email', included: false },
          { name: 'Suporte por telefone', included: false },
        ]
      },
      {
        id: 'pro',
        name: 'Filesfy PRO',
        price: 1499,
        originalPrice: 2999,
        discount: '50%',
        interval: 'mês',
        duration: 'primeiro mês',
        button: 'Comprar Agora',
        badge: 'Mais Popular',
        storage: 128,
        recoveries: 30,
        support: '24/7 por email',
        features: [
          { name: 'Até 30 varreduras por mês', included: true },
          { name: 'Limite 128GB por varredura', included: true },
          { name: 'Recuperação avançada', included: true },
          { name: 'Histórico 90 dias', included: true },
          { name: 'Sem anúncios', included: true },
          { name: 'Armazenamento 5GB', included: true },  
          { name: 'Varreduras ilimitadas', included: true },
          { name: 'Sem limite de arquivos', included: true },
          { name: 'Suporte por email', included: true },
        ]
      },
      {
        id: 'anual',
        name: 'Filesfy PRO Anual',
        price: 20930,
        originalPrice: 29999,
        discount: '30%',
        interval: 'ano',
        duration: 'cobrança anual',
        button: '🔐 Fazer Login',
        badge: 'Melhor Custo-Benefício',
        storage: 5,
        recoveries: 50,
        support: '24/7 por email',
        features: [
          { name: 'Varreduras ilimitadas', included: true },
          { name: 'Arquivos ilimitados', included: true },
          { name: 'Recuperação avançada', included: true },
          { name: 'Sem anúncios', included: true },
          { name: 'Suporte prioritário', included: true },
          { name: 'Suporte por email', included: true },
          { name: 'Atualizações Automáticas', included: true },
        ]
      }
    ];
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/current', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const token = authHeader.slice(7);
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'filesfy_jwt_secret_key_super_secura_12345');
    } catch (e) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const userId = decoded.userId;
    if (!userId) return res.status(401).json({ error: 'Não autenticado' });
    
    const subscription = await Subscription.findByUserId(userId);
    res.json(subscription || { tipo_plano: 'FREE', status: 'ativo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/subscribe', async (req, res) => {
  try {
    const { planId } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.substring(7); // Remove "Bearer "
    let decoded;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'filesfy_jwt_secret_key_super_secura_12345');
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const userId = decoded.userId;
    const userEmail = decoded.email;
    
    if (!userId) return res.status(401).json({ error: 'Usuário não identificado' });
    if (!planId) return res.status(400).json({ error: 'Plano não especificado' });

    const planMap = { 'free': 'FREE', 'pro': 'PRO', 'pro_annual': 'PRO', 'enterprise': 'ENTERPRISE' };
    const planType = planMap[planId] || 'FREE';

    const subscription = await Subscription.updatePlan(userId, planType);
    
    // Gerar novo token com plano atualizado
    const newToken = jwt.sign({ 
      userId, 
      email: userEmail, 
      plan: planType 
    }, process.env.JWT_SECRET || 'filesfy_jwt_secret_key_super_secura_12345', { expiresIn: '7d' });
    
    res.json({ 
      success: true, 
      token: newToken,
      subscription: {
        id: subscription.id,
        plan_type: subscription.tipo_plano,
        status: subscription.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rotas parametrizadas DEVEM VIR POR ÚLTIMO
router.get('/:userId', async (req, res) => {
  try {
    const subscription = await Subscription.findByUserId(req.params.userId);
    res.json(subscription || { tipo_plano: 'FREE', status: 'ativo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:userId/upgrade', async (req, res) => {
  try {
    const subscription = await Subscription.updatePlan(req.params.userId, 'PRO');
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
