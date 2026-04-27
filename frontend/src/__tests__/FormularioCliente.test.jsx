import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormularioCliente from '../components/forms/FormularioCliente';

// Evita que o formulário faça chamadas HTTP reais durante os testes
jest.mock('axios');

const renderForm = () => render(<FormularioCliente onSucesso={jest.fn()} />);

// ── Renderização ───────────────────────────────────────────────────────────────
describe('FormularioCliente › renderização', () => {
  test('exibe os campos obrigatórios', () => {
    renderForm();
    expect(screen.getByPlaceholderText('Nome completo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('email@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('(11) 99999-9999')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar cliente/i })).toBeInTheDocument();
  });

  test('exibe a seção de endereço', () => {
    renderForm();
    expect(screen.getByPlaceholderText('00000-000')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nome da rua')).toBeInTheDocument();
  });
});

// ── Validação de campos obrigatórios ──────────────────────────────────────────
describe('FormularioCliente › validação de campos obrigatórios', () => {
  test('exibe erro quando nome está vazio', async () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: /criar cliente/i }));
    await waitFor(() => {
      expect(screen.getAllByText('Este campo é obrigatório').length).toBeGreaterThanOrEqual(1);
    });
  });

  test('exibe erro quando email está vazio', async () => {
    renderForm();
    await userEvent.type(screen.getByPlaceholderText('Nome completo'), 'Ana Silva');
    await userEvent.type(screen.getByPlaceholderText('(11) 99999-9999'), '(11) 99999-9999');
    fireEvent.click(screen.getByRole('button', { name: /criar cliente/i }));
    await waitFor(() => {
      expect(screen.getByText('Este campo é obrigatório')).toBeInTheDocument();
    });
  });

  test('exibe erro quando telefone está vazio', async () => {
    renderForm();
    await userEvent.type(screen.getByPlaceholderText('Nome completo'), 'Ana Silva');
    await userEvent.type(screen.getByPlaceholderText('email@example.com'), 'ana@teste.com');
    fireEvent.click(screen.getByRole('button', { name: /criar cliente/i }));
    await waitFor(() => {
      expect(screen.getByText('Este campo é obrigatório')).toBeInTheDocument();
    });
  });
});

// ── Validação de formato ───────────────────────────────────────────────────────
describe('FormularioCliente › validação de formato', () => {
  test('exibe erro quando email é inválido', async () => {
    renderForm();
    await userEvent.type(screen.getByPlaceholderText('Nome completo'), 'Ana Silva');
    await userEvent.type(screen.getByPlaceholderText('email@example.com'), 'email-invalido');
    await userEvent.type(screen.getByPlaceholderText('(11) 99999-9999'), '(11) 99999-9999');
    fireEvent.click(screen.getByRole('button', { name: /criar cliente/i }));
    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
    });
  });

  test('exibe erro quando telefone não segue o padrão', async () => {
    renderForm();
    await userEvent.type(screen.getByPlaceholderText('Nome completo'), 'Ana Silva');
    await userEvent.type(screen.getByPlaceholderText('email@example.com'), 'ana@teste.com');
    await userEvent.type(screen.getByPlaceholderText('(11) 99999-9999'), '11999999999');
    fireEvent.click(screen.getByRole('button', { name: /criar cliente/i }));
    await waitFor(() => {
      expect(screen.getByText('Telefone inválido (use: (XX) 9XXXX-XXXX)')).toBeInTheDocument();
    });
  });

  test('exibe erro quando CEP é inválido', async () => {
    renderForm();
    await userEvent.type(screen.getByPlaceholderText('00000-000'), '12345');
    fireEvent.click(screen.getByRole('button', { name: /criar cliente/i }));
    await waitFor(() => {
      expect(screen.getByText('CEP inválido (use: XXXXX-XXX)')).toBeInTheDocument();
    });
  });

  test('não exibe erro de CEP quando campo está vazio (opcional)', async () => {
    renderForm();
    await userEvent.type(screen.getByPlaceholderText('Nome completo'), 'Ana');
    await userEvent.type(screen.getByPlaceholderText('email@example.com'), 'ana@ok.com');
    await userEvent.type(screen.getByPlaceholderText('(11) 99999-9999'), '(11) 99999-9999');
    fireEvent.click(screen.getByRole('button', { name: /criar cliente/i }));
    await waitFor(() => {
      expect(screen.queryByText('CEP inválido (use: XXXXX-XXX)')).not.toBeInTheDocument();
    });
  });
});
