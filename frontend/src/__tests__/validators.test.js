import { validators, VALIDATION_PATTERNS } from '../constants/messages';

// ── VALIDATION_PATTERNS ───────────────────────────────────────────────────────
describe('VALIDATION_PATTERNS', () => {
  describe('EMAIL', () => {
    test.each([
      ['usuario@dominio.com',     true],
      ['user.name+tag@sub.org',   true],
      ['@sem-usuario.com',        false],
      ['semdominio@',             false],
      ['sem-arroba.com',          false],
      ['',                        false],
    ])('"%s" → %s', (email, esperado) => {
      expect(VALIDATION_PATTERNS.EMAIL.test(email)).toBe(esperado);
    });
  });

  describe('PHONE', () => {
    test.each([
      ['(11) 99999-9999',  true],
      ['(21) 98765-4321',  true],
      ['(11) 9999-9999',   false],  // celular sem o 9 extra
      ['11 99999-9999',    false],  // sem parênteses
      ['11999999999',      false],  // sem formatação
      ['',                 false],
    ])('"%s" → %s', (phone, esperado) => {
      expect(VALIDATION_PATTERNS.PHONE.test(phone)).toBe(esperado);
    });
  });

  describe('CPF', () => {
    test.each([
      ['123.456.789-09',  true],
      ['000.000.000-00',  true],
      ['12345678909',     false],  // sem máscara
      ['123.456.789',     false],  // incompleto
      ['',                false],
    ])('"%s" → %s', (cpf, esperado) => {
      expect(VALIDATION_PATTERNS.CPF.test(cpf)).toBe(esperado);
    });
  });

  describe('CEP', () => {
    test.each([
      ['01310-100',  true],
      ['99999-999',  true],
      ['01310100',   false],  // sem hífen
      ['1310-100',   false],  // 4 dígitos antes
      ['',           false],
    ])('"%s" → %s', (cep, esperado) => {
      expect(VALIDATION_PATTERNS.CEP.test(cep)).toBe(esperado);
    });
  });
});

// ── validators ────────────────────────────────────────────────────────────────
describe('validators', () => {
  describe('isValidEmail', () => {
    test('aceita email válido', () => {
      expect(validators.isValidEmail('contato@belahub.com')).toBe(true);
    });
    test('rejeita email sem @', () => {
      expect(validators.isValidEmail('invalido.com')).toBe(false);
    });
    test('rejeita string vazia', () => {
      expect(validators.isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    test('aceita celular formatado', () => {
      expect(validators.isValidPhone('(11) 99999-9999')).toBe(true);
    });
    test('rejeita telefone fixo sem 9', () => {
      expect(validators.isValidPhone('(11) 3333-3333')).toBe(false);
    });
    test('rejeita número sem máscara', () => {
      expect(validators.isValidPhone('11999999999')).toBe(false);
    });
  });

  describe('isValidCPF', () => {
    test('aceita CPF com máscara', () => {
      expect(validators.isValidCPF('123.456.789-09')).toBe(true);
    });
    test('rejeita CPF sem máscara', () => {
      expect(validators.isValidCPF('12345678909')).toBe(false);
    });
  });

  describe('isValidCEP', () => {
    test('aceita CEP com hífen', () => {
      expect(validators.isValidCEP('01310-100')).toBe(true);
    });
    test('rejeita CEP sem hífen', () => {
      expect(validators.isValidCEP('01310100')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    test('aceita senha com 6+ caracteres', () => {
      expect(validators.isValidPassword('abc123')).toBe(true);
      expect(validators.isValidPassword('senha_longa_valida')).toBe(true);
    });
    test('rejeita senha com menos de 6 caracteres', () => {
      expect(validators.isValidPassword('abc')).toBe(false);
      expect(validators.isValidPassword('12345')).toBe(false);
    });
    test('rejeita valor nulo ou vazio', () => {
      expect(validators.isValidPassword('')).toBeFalsy();
      expect(validators.isValidPassword(null)).toBeFalsy();
    });
  });

  describe('isNotEmpty', () => {
    test('aceita string com conteúdo', () => {
      expect(validators.isNotEmpty('texto')).toBe(true);
      expect(validators.isNotEmpty('  espaço  ')).toBe(true);
    });
    test('rejeita string vazia ou só espaços', () => {
      expect(validators.isNotEmpty('')).toBeFalsy();
      expect(validators.isNotEmpty('   ')).toBeFalsy();
    });
    test('rejeita null/undefined', () => {
      expect(validators.isNotEmpty(null)).toBeFalsy();
      expect(validators.isNotEmpty(undefined)).toBeFalsy();
    });
  });
});
