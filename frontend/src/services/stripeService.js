import api from './api';
import { loadStripe } from '@stripe/stripe-js';

let stripePromise = null;

async function getStripe() {
  if (!stripePromise) {
    const { data } = await api.get('/stripe/key');
    stripePromise = loadStripe(data.publicKey);
  }
  return stripePromise;
}

const stripeService = {
  getStripe,

  // Redirect to Stripe Checkout for plan subscription
  async assinarPlano(planoId, intervalo = 'month') {
    const { data } = await api.post('/stripe/checkout', { planoId, intervalo });
    if (data.url) {
      window.location.href = data.url;
    }
    return data;
  },

  // Create a PaymentIntent for in-salon Comanda payment
  async criarPaymentIntent(valor, comandaId = null) {
    const { data } = await api.post('/stripe/payment-intent', { valor, comandaId });
    return data; // { clientSecret }
  },

  // Confirm a card payment using Stripe Elements
  async confirmarPagamento(clientSecret, cardElement, dadosPagamento = {}) {
    const stripe = await getStripe();
    return stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: dadosPagamento,
      },
    });
  },
};

export default stripeService;
