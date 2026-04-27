import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';

// Mock do Zustand store de autenticação
const mockLogin    = jest.fn();
const mockRegistro = jest.fn();
const mockLimpar   = jest.fn();

jest.mock('../store/authStore', () => ({
  useAuthStore: () => ({
    login:          mockLogin,
    registro:       mockRegistro,
    erro:           null,
    limparErro:     mockLimpar,
    estaAutenticado: false,
  }),
}));

// Evita erros de import de CSS Module em testes
jest.mock('../pages/LoginPage.module.css', () => ({}), { virtual: true });

const renderPage = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );

// ── Renderização ───────────────────────────────────────────────────────────────
describe('LoginPage › renderização', () => {
  beforeEach(() => jest.clearAllMocks());

  test('exibe formulário de login por padrão', () => {
    renderPage();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  test('exibe formulário de registro ao clicar em "Criar conta"', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /criar conta/i }));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Seu nome')).toBeInTheDocument();
    });
  });
});

// ── Validação do formulário de login ──────────────────────────────────────────
describe('LoginPage › validação do login', () => {
  beforeEach(() => jest.clearAllMocks());

  test('exibe erro quando email está vazio', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getAllByText('Este campo é obrigatório').length).toBeGreaterThanOrEqual(1);
    });
  });

  test('exibe erro quando email é inválido', async () => {
    renderPage();
    await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'nao-e-email');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), '123456');
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
    });
  });

  test('exibe erro quando senha tem menos de 6 caracteres', async () => {
    renderPage();
    await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'ok@ok.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), '123');
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getByText('Senha deve ter no mínimo 6 caracteres')).toBeInTheDocument();
    });
  });

  test('chama login() quando dados são válidos', async () => {
    mockLogin.mockResolvedValue({});
    renderPage();
    await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'admin@belahub.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), '123456');
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@belahub.com', '123456');
    });
  });
});

// ── Validação do formulário de registro ───────────────────────────────────────
describe('LoginPage › validação do registro', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  const abrirRegistro = async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /criar conta/i }));
    await waitFor(() => screen.getByPlaceholderText('Seu nome'));
  };

  test('exibe erros quando campos obrigatórios estão vazios', async () => {
    await abrirRegistro();
    // Procura pelo botão "Criar conta" dentro do formulário (não o tab)
    const botoes = screen.getAllByRole('button', { name: /criar conta/i });
    fireEvent.click(botoes[botoes.length - 1]);
    await waitFor(() => {
      expect(screen.getAllByText('Este campo é obrigatório').length).toBeGreaterThanOrEqual(1);
    });
  });

  test('exibe erro quando senhas não conferem', async () => {
    await abrirRegistro();
    await userEvent.type(screen.getByPlaceholderText('Seu nome'), 'Ana');
    await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'ana@ok.com');

    const senhaInputs = screen.getAllByPlaceholderText('••••••••');
    await userEvent.type(senhaInputs[0], 'senha123');
    await userEvent.type(senhaInputs[1], 'diferente');

    const botoes = screen.getAllByRole('button', { name: /criar conta/i });
    fireEvent.click(botoes[botoes.length - 1]);
    await waitFor(() => {
      expect(screen.getByText('As senhas não conferem')).toBeInTheDocument();
    });
  });

  test('exibe erro quando telefone tem formato inválido', async () => {
    await abrirRegistro();
    await userEvent.type(screen.getByPlaceholderText('(11) 99999-9999'), '999');
    const botoes = screen.getAllByRole('button', { name: /criar conta/i });
    fireEvent.click(botoes[botoes.length - 1]);
    await waitFor(() => {
      expect(screen.getByText('Telefone inválido (use: (XX) 9XXXX-XXXX)')).toBeInTheDocument();
    });
  });

  test('chama registro() quando formulário é válido', async () => {
    mockRegistro.mockResolvedValue({});
    await abrirRegistro();
    await userEvent.type(screen.getByPlaceholderText('Seu nome'), 'Ana Silva');
    await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'ana@belahub.com');
    const senhaInputs = screen.getAllByPlaceholderText('••••••••');
    await userEvent.type(senhaInputs[0], 'senha123');
    await userEvent.type(senhaInputs[1], 'senha123');
    const botoes = screen.getAllByRole('button', { name: /criar conta/i });
    fireEvent.click(botoes[botoes.length - 1]);
    await waitFor(() => {
      expect(mockRegistro).toHaveBeenCalledWith(
        expect.objectContaining({ nome: 'Ana Silva', email: 'ana@belahub.com' })
      );
    });
  });
});
