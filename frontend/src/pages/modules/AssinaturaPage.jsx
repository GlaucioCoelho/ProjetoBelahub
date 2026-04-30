import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import stripeService from '../../services/stripeService';
import adminService from '../../services/adminService';

// ── Subscription result pages ──────────────────────────────────────────────

export function AssinaturaSucesso() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h1 style={{ color: '#2e7d32', marginBottom: 8 }}>Assinatura confirmada!</h1>
        <p style={{ color: '#555', marginBottom: 24 }}>
          Seu plano foi ativado com sucesso. Aproveite todos os recursos do BelaHub.
        </p>
        {sessionId && (
          <p style={{ fontSize: 12, color: '#aaa', marginBottom: 24 }}>
            Session: {sessionId}
          </p>
        )}
        <button style={btnPrimaryStyle} onClick={() => navigate('/')}>
          Ir para o Dashboard
        </button>
      </div>
    </div>
  );
}

export function AssinaturaCancelado() {
  const navigate = useNavigate();

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>❌</div>
        <h1 style={{ color: '#c62828', marginBottom: 8 }}>Assinatura cancelada</h1>
        <p style={{ color: '#555', marginBottom: 24 }}>
          O processo de pagamento foi cancelado. Você pode tentar novamente a qualquer momento.
        </p>
        <button style={btnPrimaryStyle} onClick={() => navigate('/planos')}>
          Ver Planos
        </button>
      </div>
    </div>
  );
}

// ── Plan selection page ────────────────────────────────────────────────────

export default function AssinaturaPage() {
  const [planos, setPlanos]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [assindo, setAssindo]   = useState(null);
  const [erro, setErro]         = useState('');
  const [intervalo, setIntervalo] = useState('month');

  useEffect(() => {
    adminService.listarPlanos()
      .then((lista) => setPlanos(lista.filter((p) => p.ativo && p.preco > 0)))
      .catch(() => setErro('Erro ao carregar planos.'))
      .finally(() => setLoading(false));
  }, []);

  async function assinar(plano) {
    setAssindo(plano._id);
    setErro('');
    try {
      await stripeService.assinarPlano(plano._id, intervalo);
      // assinarPlano redirects to Stripe Checkout — execution stops here on success
    } catch (err) {
      setErro(err?.response?.data?.mensagem || err.message || 'Erro ao iniciar assinatura.');
      setAssindo(null);
    }
  }

  if (loading) return <div style={containerStyle}><p>Carregando planos...</p></div>;

  return (
    <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 8 }}>Escolha seu plano</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: 24 }}>
        Assinatura segura via Stripe. Cancele quando quiser.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
        {['month', 'year'].map((iv) => (
          <button
            key={iv}
            onClick={() => setIntervalo(iv)}
            style={{
              padding: '8px 20px',
              borderRadius: 20,
              border: '2px solid #7c3aed',
              cursor: 'pointer',
              fontWeight: 600,
              background: intervalo === iv ? '#7c3aed' : '#fff',
              color: intervalo === iv ? '#fff' : '#7c3aed',
            }}
          >
            {iv === 'month' ? 'Mensal' : 'Anual (economize)'}
          </button>
        ))}
      </div>

      {erro && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: 12, borderRadius: 6, marginBottom: 20, textAlign: 'center' }}>
          {erro}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        {planos.map((p) => {
          const preco = intervalo === 'year'
            ? (p.precoAnual || p.preco * 12)
            : p.preco;
          const isAssindo = assindo === p._id;

          return (
            <div
              key={p._id}
              style={{
                border: p.destaque ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                borderRadius: 12,
                padding: 24,
                position: 'relative',
                background: '#fff',
                boxShadow: p.destaque ? '0 4px 24px rgba(124,58,237,0.12)' : 'none',
              }}
            >
              {p.destaque && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#7c3aed', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 20 }}>
                  Mais popular
                </div>
              )}

              <div style={{ marginBottom: 8 }}>
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: p.cor, marginRight: 6 }} />
                <strong>{p.nome}</strong>
              </div>

              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                R$ {preco.toLocaleString('pt-BR')}
                <span style={{ fontSize: 14, fontWeight: 400, color: '#888' }}>
                  /{intervalo === 'year' ? 'ano' : 'mês'}
                </span>
              </div>

              {p.descricao && <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>{p.descricao}</p>}

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', fontSize: 13 }}>
                <li>✅ {p.limites?.funcionarios} profissionais</li>
                <li>✅ {p.limites?.clientes} clientes</li>
                <li>✅ {p.limites?.agendamentosMes} agend./mês</li>
                {(p.recursos || []).map((r, i) => <li key={i}>✅ {r}</li>)}
              </ul>

              <button
                onClick={() => assinar(p)}
                disabled={isAssindo}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: isAssindo ? '#ccc' : '#7c3aed',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: isAssindo ? 'not-allowed' : 'pointer',
                }}
              >
                {isAssindo ? 'Redirecionando...' : 'Assinar agora'}
              </button>
            </div>
          );
        })}
      </div>

      {planos.length === 0 && (
        <p style={{ textAlign: 'center', color: '#888' }}>Nenhum plano disponível no momento.</p>
      )}
    </div>
  );
}

const containerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' };
const cardStyle = { textAlign: 'center', padding: '48px 32px', maxWidth: 480, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' };
const btnPrimaryStyle = { padding: '12px 32px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer' };
