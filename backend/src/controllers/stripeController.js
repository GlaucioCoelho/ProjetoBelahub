import Stripe from 'stripe';
import Usuario from '../models/Usuario.js';
import Plano from '../models/Plano.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// GET /api/stripe/key
export const getPublicKey = (_req, res) => {
  res.json({ publicKey: process.env.STRIPE_PUBLISHABLE_KEY });
};

// POST /api/stripe/checkout
// Creates a Stripe Checkout Session for plan subscription (redirect flow)
export const createCheckoutSession = async (req, res) => {
  try {
    const { planoId, intervalo = 'month' } = req.body;

    const [usuario, plano] = await Promise.all([
      Usuario.findById(req.usuario.id),
      Plano.findById(planoId),
    ]);

    if (!usuario) return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
    if (!plano)   return res.status(404).json({ sucesso: false, mensagem: 'Plano não encontrado' });
    if (plano.preco === 0) return res.status(400).json({ sucesso: false, mensagem: 'Plano gratuito não requer pagamento' });

    // Get or create Stripe customer
    let customerId = usuario.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: usuario.email,
        name: usuario.nomeEmpresa || usuario.nome,
        metadata: { usuarioId: String(usuario._id) },
      });
      customerId = customer.id;
      await Usuario.findByIdAndUpdate(usuario._id, { stripeCustomerId: customerId });
    }

    const isAnual = intervalo === 'year';
    const precoEmCentavos = isAnual
      ? Math.round((plano.precoAnual || plano.preco * 12) * 100)
      : Math.round(plano.preco * 100);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: `BelaHub ${plano.nome}`,
            description: plano.descricao || undefined,
          },
          unit_amount: precoEmCentavos,
          recurring: { interval: isAnual ? 'year' : 'month' },
        },
        quantity: 1,
      }],
      success_url: `${frontendUrl}/assinatura/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/assinatura/cancelado`,
      metadata: {
        usuarioId: String(usuario._id),
        planoSlug: plano.slug,
        planoId: String(plano._id),
      },
    });

    res.json({ sucesso: true, url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Stripe Checkout error:', err.message);
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
};

// POST /api/stripe/portal
// Creates a Stripe Billing Portal session for self-service plan management
export const createBillingPortalSession = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);
    if (!usuario) return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
    if (!usuario.stripeCustomerId) {
      return res.status(400).json({ sucesso: false, mensagem: 'Nenhuma assinatura ativa para este usuário' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const session = await stripe.billingPortal.sessions.create({
      customer: usuario.stripeCustomerId,
      return_url: `${frontendUrl}/assinatura`,
    });

    res.json({ sucesso: true, url: session.url });
  } catch (err) {
    console.error('Billing Portal error:', err.message);
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
};

// POST /api/stripe/payment-intent
// Creates a PaymentIntent for in-salon payment
export const createPaymentIntent = async (req, res) => {
  try {
    const { valor } = req.body;

    if (!valor || Number(valor) <= 0) {
      return res.status(400).json({ sucesso: false, mensagem: 'Valor inválido' });
    }

    const valorEmCentavos = Math.round(Number(valor) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: valorEmCentavos,
      currency: 'brl',
      metadata: { usuarioId: String(req.usuario.id) },
    });

    res.json({ sucesso: true, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('PaymentIntent error:', err.message);
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
};

// POST /api/stripe/webhook
// Handles Stripe events — requires raw body (mounted before express.json in server.js)
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode === 'subscription' && session.metadata?.usuarioId) {
          await Usuario.findByIdAndUpdate(session.metadata.usuarioId, {
            plano: session.metadata.planoSlug,
            planoStatus: 'ativo',
            stripeSubscriptionId: session.subscription,
          });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const usuario = await Usuario.findOne({ stripeCustomerId: invoice.customer });
        if (usuario && usuario.planoStatus !== 'ativo') {
          await Usuario.findByIdAndUpdate(usuario._id, { planoStatus: 'ativo' });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const usuario = await Usuario.findOne({ stripeCustomerId: invoice.customer });
        if (usuario) {
          await Usuario.findByIdAndUpdate(usuario._id, { planoStatus: 'suspenso' });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const usuario = await Usuario.findOne({ stripeSubscriptionId: subscription.id });
        if (usuario) {
          await Usuario.findByIdAndUpdate(usuario._id, {
            planoStatus: 'cancelado',
            stripeSubscriptionId: null,
          });
        }
        break;
      }

    }
  } catch (err) {
    console.error('Webhook handler error:', err.message);
    return res.status(500).send('Webhook processing error');
  }

  res.json({ received: true });
};
