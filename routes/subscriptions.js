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
          { name: 'Até 15 varreduras por mês', included: true },
          { name: 'Limite 1GB por varredura', included: true },
          { name: 'Máximo 50 arquivos', included: true },
          { name: 'Recuperação básica', included: true },
          { name: 'Histórico 14 dias', included: true },
          { name: 'Com anúncios', included: true },
          { name: 'Armazenamento 300MB', included: true },
          { name: 'Sem limite de arquivos', included: false },
          { name: 'Suporte por email', included: false },
        ]
      },
      {
        id: 'pro',
        name: 'Filesfy PRO',
        price: 1599,
        originalPrice: 1999,
        discount: '20%',
        interval: 'mês',
        duration: 'primeiro mês',
        button: 'Fazer Upgrade PRO',
        storage: 5,
        recoveries: 50,
        support: '24/7 por email',
        features: [
          { name: 'Limite 128GB por varredura', included: true },
          { name: 'Recuperação avançada', included: true },
          { name: 'Histórico 90 dias', included: true },
          { name: 'Sem anúncios', included: true },
          { name: 'Armazenamento 5GB', included: true },  
          { name: 'Varreduras ilimitadas', included: true },
          { name: 'Sem limite de arquivos', included: true },
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
    const userId = req.headers.authorization?.split(' ')[1];
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
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua-chave-secreta-aqui');
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const userId = decoded.userId;
    const userEmail = decoded.email;
    
    if (!userId) return res.status(401).json({ error: 'Usuário não identificado' });
    if (!planId) return res.status(400).json({ error: 'Plano não especificado' });

    const planMap = { 'free': 'FREE', 'pro': 'PRO', 'enterprise': 'ENTERPRISE' };
    const planType = planMap[planId] || 'FREE';

    const subscription = await Subscription.updatePlan(userId, planType);
    
    // Gerar novo token com plano atualizado
    const newToken = jwt.sign({ 
      userId, 
      email: userEmail, 
      plan: planType 
    }, process.env.JWT_SECRET || 'sua-chave-secreta-aqui', { expiresIn: '7d' });
    
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
