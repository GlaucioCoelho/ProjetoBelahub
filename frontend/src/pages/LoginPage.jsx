import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import {
  Eye, EyeOff, Scissors,
  Mail, Lock, User, Phone, Building2,
  ArrowRight, AlertCircle, Wifi, RefreshCw,
} from 'lucide-react';
import styles from './LoginPage.module.css';
import { MESSAGES, VALIDATION_PATTERNS } from '../constants/messages';

// Extrai e enriquece mensagens de erro vindas da API
function parseError(err, context = 'login') {
  // Sem conexão com o servidor
  if (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error') {
    return { msg: 'Sem conexão com o servidor.', hint: 'Verifique sua internet ou se o servidor está rodando.', icon: 'wifi' };
  }

  // Timeout
  if (err?.code === 'ECONNABORTED') {
    return { msg: 'O servidor demorou para responder.', hint: 'Tente novamente em alguns segundos.', icon: 'timeout' };
  }

  // Mensagem vinda do backend (authService já extrai response.data)
  const backendMsg = err?.mensagem || err?.message || '';
  const status     = err?.statusCode || err?.status || 0;

  const MAP = {
    'Email já cadastrado':              { msg: 'Este e-mail já está em uso.', hint: 'Tente fazer login ou use outro e-mail.', icon: 'email' },
    'Email ou senha inválidos':         { msg: 'E-mail ou senha incorretos.', hint: 'Verifique seus dados e tente novamente.', icon: 'auth' },
    'Usuário inativo':                  { msg: 'Conta desativada.', hint: 'Entre em contato com o suporte.', icon: 'auth' },
    'Nome, email e senha são obrigatórios': { msg: 'Preencha nome, e-mail e senha.', hint: 'Todos os campos marcados com * são obrigatórios.', icon: 'form' },
    'Email e senha são obrigatórios':   { msg: 'Preencha e-mail e senha.', hint: 'Os dois campos são necessários para entrar.', icon: 'form' },
  };

  for (const [key, val] of Object.entries(MAP)) {
    if (backendMsg.includes(key)) return val;
  }

  if (status === 500) {
    return { msg: 'Erro interno no servidor.', hint: 'Tente novamente. Se persistir, contate o suporte.', icon: 'server' };
  }
  if (status === 429) {
    return { msg: 'Muitas tentativas.', hint: 'Aguarde alguns minutos antes de tentar novamente.', icon: 'timeout' };
  }

  return { msg: backendMsg || (context === 'login' ? 'Não foi possível entrar.' : 'Não foi possível criar a conta.'), hint: 'Tente novamente ou entre em contato com o suporte.', icon: 'generic' };
}

const LoginPage = () => {
  const [mode,     setMode]     = useState('login');
  const [showPwd,  setShowPwd]  = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const { login, registro, erro, limparErro } = useAuthStore();

  const loginForm = useForm({
    defaultValues: { email: '', senha: '' },
  });

  const registerForm = useForm({
    defaultValues: { nome: '', email: '', nomeEmpresa: '', telefone: '', senha: '', confirmarSenha: '' },
  });

  const [loginLoading,    setLoginLoading]    = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [errorInfo,       setErrorInfo]       = useState(null);  // { msg, hint, icon }
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleLogin = async (data) => {
    setLoginLoading(true);
    setErrorInfo(null);
    try {
      await login(data.email, data.senha);
    } catch (err) {
      setErrorInfo(parseError(err, 'login'));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (data) => {
    setRegisterLoading(true);
    setErrorInfo(null);
    try {
      await registro({
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        telefone: data.telefone,
        nomeEmpresa: data.nomeEmpresa,
      });
      setRegisterSuccess(true);
      setTimeout(() => {
        setRegisterSuccess(false);
        switchMode('login');
        loginForm.setValue('email', data.email);
      }, 2000);
    } catch (err) {
      setErrorInfo(parseError(err, 'registro'));
    } finally {
      setRegisterLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setErrorInfo(null);
    limparErro();
    loginForm.clearErrors();
    registerForm.clearErrors();
  };

  const errStyle = { color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' };

  const FEATURES = [
    { icon: '📅', title: 'Agenda inteligente',  desc: 'Agendamentos online e controle de horários' },
    { icon: '👥', title: 'Gestão de clientes',   desc: 'Histórico, preferências e fidelização' },
    { icon: '💰', title: 'Controle financeiro',  desc: 'Receitas, despesas e fluxo de caixa' },
    { icon: '📊', title: 'Relatórios completos', desc: 'Métricas de desempenho em tempo real' },
  ];

  return (
    <div className={styles.root}>

      {/* ══ PAINEL ESQUERDO — MARCA ══ */}
      <div className={styles.brandPanel}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />

        <div className={styles.brandLogo}>
          <div className={styles.brandIconWrap}>
            <Scissors size={24} strokeWidth={2.5} />
          </div>
          <span className={styles.brandName}>BelaHub</span>
        </div>

        <div className={styles.brandCenter}>
          <h1 className={styles.brandTagline}>
            Gerencie seu salão
            <span>com inteligência e estilo</span>
          </h1>
          <p className={styles.brandDesc}>
            Tudo que o seu negócio precisa em um só lugar — agenda, clientes,
            equipe e financeiro integrados de forma simples e eficiente.
          </p>
          <div className={styles.featureList}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureItem}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <div className={styles.featureText}>
                  <strong>{f.title}</strong>
                  <span>{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.brandFooter}>
          © {new Date().getFullYear()} BelaHub · Todos os direitos reservados
        </div>
      </div>

      {/* ══ PAINEL DIREITO — FORMULÁRIO ══ */}
      <div className={styles.formPanel}>
        <div className={styles.formInner}>

          <div className={styles.formLogoRow}>
            <div className={styles.formLogoIcon}>
              <Scissors size={20} strokeWidth={2.5} />
            </div>
            <span className={styles.formLogoText}>BelaHub</span>
          </div>

          <h2 className={styles.formTitle}>
            {mode === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}
          </h2>
          <p className={styles.formSubtitle}>
            {mode === 'login'
              ? 'Acesse o painel do seu salão'
              : 'Comece grátis, sem cartão de crédito'}
          </p>

          <div className={styles.tabs}>
            <button type="button" aria-label="tab-login"
              className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
              onClick={() => switchMode('login')}>
              Entrar
            </button>
            <button type="button"
              className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
              onClick={() => switchMode('register')}>
              Criar conta
            </button>
          </div>

          {registerSuccess && (
            <div className={styles.successBox}>
              ✅ Conta criada com sucesso! Redirecionando para o login…
            </div>
          )}

          {!registerSuccess && errorInfo && (
            <div className={styles.errorBox}>
              <div className={styles.errorBoxTop}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <strong>{errorInfo.msg}</strong>
              </div>
              {errorInfo.hint && (
                <div className={styles.errorBoxHint}>{errorInfo.hint}</div>
              )}
            </div>
          )}

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className={styles.form}>
              <div className={styles.field}>
                <label>E-mail</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><Mail size={15} /></span>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    className={styles.input}
                    {...loginForm.register('email', {
                      required: MESSAGES.VALIDATION.REQUIRED_FIELD,
                      pattern: { value: VALIDATION_PATTERNS.EMAIL, message: MESSAGES.VALIDATION.INVALID_EMAIL },
                    })}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <span style={errStyle}>{loginForm.formState.errors.email.message}</span>
                )}
              </div>

              <div className={styles.field}>
                <label>Senha</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><Lock size={15} /></span>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={styles.input}
                    {...loginForm.register('senha', {
                      required: MESSAGES.VALIDATION.REQUIRED_FIELD,
                      minLength: { value: 6, message: MESSAGES.VALIDATION.WEAK_PASSWORD },
                    })}
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd(v => !v)}>
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {loginForm.formState.errors.senha && (
                  <span style={errStyle}>{loginForm.formState.errors.senha.message}</span>
                )}
              </div>

<button type="submit" className={styles.btnPrimary} disabled={loginLoading}>
                {loginLoading
                  ? <><div className={styles.spinner} /> Entrando…</>
                  : <>Entrar <ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          {/* ── REGISTRO ── */}
          {mode === 'register' && (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className={styles.form}>
              <div className={styles.field}>
                <label>Nome completo</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><User size={15} /></span>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    className={styles.input}
                    {...registerForm.register('nome', { required: MESSAGES.VALIDATION.REQUIRED_FIELD })}
                  />
                </div>
                {registerForm.formState.errors.nome && (
                  <span style={errStyle}>{registerForm.formState.errors.nome.message}</span>
                )}
              </div>

              <div className={styles.field}>
                <label>E-mail</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><Mail size={15} /></span>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    className={styles.input}
                    {...registerForm.register('email', {
                      required: MESSAGES.VALIDATION.REQUIRED_FIELD,
                      pattern: { value: VALIDATION_PATTERNS.EMAIL, message: MESSAGES.VALIDATION.INVALID_EMAIL },
                    })}
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <span style={errStyle}>{registerForm.formState.errors.email.message}</span>
                )}
              </div>

              <div className={styles.field}>
                <label>Nome do salão</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><Building2 size={15} /></span>
                  <input
                    type="text"
                    placeholder="Ex: Studio Glamour"
                    className={styles.input}
                    {...registerForm.register('nomeEmpresa')}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label>Telefone</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><Phone size={15} /></span>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    className={styles.input}
                    {...registerForm.register('telefone', {
                      pattern: { value: VALIDATION_PATTERNS.PHONE, message: MESSAGES.VALIDATION.INVALID_PHONE },
                    })}
                  />
                </div>
                {registerForm.formState.errors.telefone && (
                  <span style={errStyle}>{registerForm.formState.errors.telefone.message}</span>
                )}
              </div>

              <div className={styles.field}>
                <label>Senha</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><Lock size={15} /></span>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={styles.input}
                    {...registerForm.register('senha', {
                      required: MESSAGES.VALIDATION.REQUIRED_FIELD,
                      minLength: { value: 6, message: MESSAGES.VALIDATION.WEAK_PASSWORD },
                    })}
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd(v => !v)}>
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {registerForm.formState.errors.senha && (
                  <span style={errStyle}>{registerForm.formState.errors.senha.message}</span>
                )}
              </div>

              <div className={styles.field}>
                <label>Confirmar senha</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><Lock size={15} /></span>
                  <input
                    type={showPwd2 ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={styles.input}
                    {...registerForm.register('confirmarSenha', {
                      required: MESSAGES.VALIDATION.REQUIRED_FIELD,
                      validate: (v) => v === registerForm.getValues('senha') || MESSAGES.VALIDATION.PASSWORD_MISMATCH,
                    })}
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd2(v => !v)}>
                    {showPwd2 ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {registerForm.formState.errors.confirmarSenha && (
                  <span style={errStyle}>{registerForm.formState.errors.confirmarSenha.message}</span>
                )}
              </div>

              <button type="submit" className={styles.btnPrimary} disabled={registerLoading}>
                {registerLoading
                  ? <><div className={styles.spinner} /> Criando conta…</>
                  : <>Criar conta <ArrowRight size={16} /></>}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
