# 📋 Boas Práticas de Desenvolvimento - BelaHub

## 🎯 Padrões de Código Implementados

### 1. Tratamento de Erros
Todos os erros devem seguir o padrão abaixo para garantir mensagens consistentes:

```javascript
try {
  // operação
} catch (erro) {
  const msg = erro.response?.data?.mensagem || erro.message || 'Mensagem padrão';
  setErro(msg);
}
```

### 2. Armazenamento de Token
- **Token JWT**: `localStorage.getItem('authToken')`
- **Dados do Usuário**: `localStorage.getItem('userData')`
- **Recuperação segura**: Use try-catch ao fazer JSON.parse

```javascript
const userData = (() => {
  try {
    return JSON.parse(localStorage.getItem('userData') || '{}');
  } catch {
    return {};
  }
})();
```

### 3. Mensagens Padronizadas
Sempre usar constantes em `src/constants/messages.js`:

```javascript
import { MESSAGES } from '../constants/messages';

setErro(MESSAGES.VALIDATION.INVALID_EMAIL);
setMensagem(MESSAGES.SUCCESS.CLIENT_CREATED);
```

### 4. Validação de Entrada
Use os validadores fornecidos em `src/constants/messages.js`:

```javascript
import { validators } from '../constants/messages';

if (!validators.isValidEmail(email)) {
  setErro(MESSAGES.VALIDATION.INVALID_EMAIL);
  return;
}
```

### 5. Estados de Erro em Páginas
Todas as páginas que fazem chamadas de API devem ter um estado de erro:

```javascript
const [erro, setErro] = useState('');

const carregarDados = async () => {
  setErro(''); // Limpar erro anterior
  try {
    // operação
  } catch (erro) {
    const msg = erro.response?.data?.mensagem || erro.message || 'fallback';
    setErro(msg);
  }
};
```

## ✅ Checklist para Novos Componentes

- [ ] Usar `useState` para loading, erro, dados
- [ ] Limpar estado de erro antes de operações
- [ ] Usar padrão de erro robusto com fallback
- [ ] Usar 'authToken' para recuperar token
- [ ] Usar 'userData' para recuperar dados do usuário
- [ ] Importar e usar MESSAGES para feedback ao usuário
- [ ] Adicionar validações com `validators`
- [ ] Adicionar `key` prop em listas `.map()`
- [ ] Adicionar comentários em lógica complexa
- [ ] Testar em console (F12) para erros

## 🔧 Estrutura de Pastas

```
src/
├── components/        # Componentes reutilizáveis
├── pages/             # Páginas/telas
├── services/          # Serviços (API, auth)
├── store/             # Zustand stores
├── constants/         # Constantes e validadores
├── styles/            # Estilos globais
└── utils/             # Funções auxiliares
```

## 🚀 Padrão de Uma Nova Feature

1. **Criar componente** com validações
2. **Usar MESSAGES** para feedback
3. **Adicionar erro state** na página
4. **Tratamento de erro robusto**
5. **Adicionar key props** em listas
6. **Testar no navegador**

## 📝 Exemplo Completo

```javascript
import { MESSAGES, validators } from '../constants/messages';

export default function MeuFormulario() {
  const [dados, setDados] = useState({ email: '', nome: '' });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');
    setSucesso('');

    try {
      // Validar
      if (!dados.nome) {
        setErro(MESSAGES.VALIDATION.REQUIRED_FIELD);
        setCarregando(false);
        return;
      }

      if (!validators.isValidEmail(dados.email)) {
        setErro(MESSAGES.VALIDATION.INVALID_EMAIL);
        setCarregando(false);
        return;
      }

      // Chamada API
      const token = localStorage.getItem('authToken');
      const res = await axios.post('/api/endpoint', dados, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSucesso(MESSAGES.SUCCESS.OPERATION_SUCCESS);
      // Reset form
      setDados({ email: '', nome: '' });
    } catch (erro) {
      const msg = erro.response?.data?.mensagem || erro.message || 'Erro ao salvar';
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {erro && <div className="erro">{erro}</div>}
      {sucesso && <div className="sucesso">{sucesso}</div>}

      <input
        value={dados.nome}
        onChange={(e) => setDados({ ...dados, nome: e.target.value })}
        placeholder="Nome"
      />

      <input
        type="email"
        value={dados.email}
        onChange={(e) => setDados({ ...dados, email: e.target.value })}
        placeholder="Email"
      />

      <button disabled={carregando}>
        {carregando ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
```

## 🧪 Testando Localmente

1. Abra DevTools (F12)
2. Vá para Console
3. Procure por erros em vermelho
4. Teste fluxos de erro e sucesso

## 🔒 Segurança

- Nunca commit `.env` ou chaves secretas
- Sempre usar `localStorage.getItem('authToken')` para recuperar token
- Sempre validar entrada do usuário
- Nunca mostrar erro bruto do servidor (use MESSAGES)

---

**Última atualização**: 5 de Abril de 2026
