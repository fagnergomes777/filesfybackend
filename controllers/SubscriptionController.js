const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const User = require('../models/User');
const pool = require('../config/database');

class SubscriptionController {
  // Buscar assinatura ativa do usuário
  static async getSubscription(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(parseInt(userId));
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const subscription = await Subscription.findByUserId(parseInt(userId));

      res.json({
        success: true,
        subscription: {
          id: subscription?.id,
          userId: subscription?.usuario_id,
          planName: subscription?.nome,
          planType: subscription?.nome,
          status: subscription?.status,
          startsAt: subscription?.inicio_em,
          expiresAt: subscription?.fim_em,
          limiteRestauracoes: subscription?.limite_restauracoes,
          valor: subscription?.valor,
        },
        user: {
          id: user.id,
          email: user.email,
          name: user.nome,
        },
      });
    } catch (error) {
      console.error('Erro ao buscar assinatura:', error);
      res.status(500).json({ error: 'Erro ao buscar assinatura' });
    }
  }

  // Listar todos os planos disponíveis
  static async listPlans(req, res) {
    try {
      const plans = await Plan.findAll();

      res.json({
        success: true,
        plans: plans.map(p => ({
          id: p.id,
          name: p.nome,
          limiteRestauracoes: p.limite_restauracoes,
          valor: p.valor,
          ativo: p.ativo,
        })),
      });
    } catch (error) {
      console.error('Erro ao listar planos:', error);
      res.status(500).json({ error: 'Erro ao listar planos' });
    }
  }

  // Fazer upgrade para PRO
  static async upgradePlan(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(parseInt(userId));
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const subscription = await Subscription.upgradeToPro(parseInt(userId));

      res.json({
        success: true,
        message: 'Plano atualizado para PRO com sucesso',
        subscription: {
          id: subscription.id,
          userId: subscription.usuario_id,
          planName: subscription.nome,
          status: subscription.status,
          startsAt: subscription.inicio_em,
        },
      });
    } catch (error) {
      console.error('Erro ao fazer upgrade:', error);
      res.status(500).json({ error: 'Erro ao fazer upgrade do plano' });
    }
  }

  // Fazer downgrade para FREE
  static async downgradePlan(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(parseInt(userId));
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const subscription = await Subscription.downgradeToFree(parseInt(userId));

      res.json({
        success: true,
        message: 'Plano revertido para FREE',
        subscription: {
          id: subscription.id,
          userId: subscription.usuario_id,
          planName: subscription.nome,
          status: subscription.status,
        },
      });
    } catch (error) {
      console.error('Erro ao fazer downgrade:', error);
      res.status(500).json({ error: 'Erro ao fazer downgrade do plano' });
    }
  }

  // Cancelar assinatura
  static async cancelSubscription(req, res) {
    try {
      const { subscriptionId } = req.params;

      const subscription = await Subscription.cancel(parseInt(subscriptionId));

      res.json({
        success: true,
        message: 'Assinatura cancelada com sucesso',
        subscription,
      });
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      res.status(500).json({ error: 'Erro ao cancelar assinatura' });
    }
  }

  // Verificar e atualizar assinaturas expiradas
  static async checkExpiredSubscriptions(req, res) {
    try {
      // Não há expiração automática no novo modelo
      // Assinaturas continuam ativas até cancelamento
      // Esta função é mantida para compatibilidade

      res.json({ 
        success: true, 
        message: 'Verificação de assinaturas completada',
        note: 'O novo modelo não tem expiração automática'
      });
    } catch (error) {
      console.error('Erro ao verificar assinaturas:', error);
      res.status(500).json({ error: 'Erro na verificação' });
    }
  }
}

module.exports = SubscriptionController;
