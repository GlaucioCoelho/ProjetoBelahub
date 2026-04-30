# Plan Limits Enforcement

## Overview

The application enforces plan-based limits on resource creation for multi-tenant salons using a middleware-based approach. When a tenant reaches their plan limit, the API returns a 403 Forbidden response with details about the upgrade path.

## Implementation

### Middleware Location
`/src/middlewares/verificarLimitesPlano.js`

### Protected Endpoints

The following endpoints now check plan limits before allowing resource creation:

1. **POST /api/funcionarios/** - Create employee
   - Middleware: `verificarLimiteFuncionarios`
   - Limit field: `plano.limites.funcionarios`

2. **POST /api/clientes/** - Create client
   - Middleware: `verificarLimiteClientes`
   - Limit field: `plano.limites.clientes`

3. **POST /api/agendamentos/** - Create appointment
   - Middleware: `verificarLimiteAgendamentos`
   - Limit field: `plano.limites.agendamentosMes` (monthly)

### Plan Limits

Plan limits are defined in the `Plano` model:

```javascript
limites: {
  funcionarios:     Number,  // Max employees
  clientes:         Number,  // Max clients
  agendamentosMes:  Number,  // Max appointments per month
}
```

Example limits by plan:
- **Starter**: 5 funcionários, 200 clientes, 500 agendamentos/mês
- **Pro**: 10 funcionários, 500 clientes, 1000 agendamentos/mês
- **Enterprise**: 50 funcionários, 5000 clientes, 2000 agendamentos/mês

### Response Format

When a limit is reached, the API returns:

```json
{
  "status": 403,
  "body": {
    "sucesso": false,
    "mensagem": "Limite de X <recurso> atingido",
    "codigo": "LIMITE_<RECURSO>_ATINGIDO",
    "limite": <number>,
    "atual": <number>,
    "upgradePath": "/pricing"
  }
}
```

Example for employees:
```json
{
  "status": 403,
  "body": {
    "sucesso": false,
    "mensagem": "Limite de 5 funcionários atingido",
    "codigo": "LIMITE_FUNCIONARIOS_ATINGIDO",
    "limite": 5,
    "atual": 5,
    "upgradePath": "/pricing"
  }
}
```

### How It Works

1. **Identify Tenant**: Extract tenant ID from `req.usuario.id` (set by auth middleware)
2. **Fetch Plan**: Query `Usuario` model to get tenant's plan slug
3. **Get Limits**: Query `Plano` model using plan slug to get resource limits
4. **Count Resources**: Count existing resources for the tenant
5. **Check Limit**: If count >= limit, return 403; otherwise, call `next()`

### Monthly Appointment Limit

The agendamento (appointment) limit is enforced on a monthly basis:
- Counts only appointments created in the current month
- Uses `createdAt` timestamp with month boundaries
- Resets automatically on the first day of each month

### Error Handling

All middleware functions include try-catch blocks to handle:
- User not found (404)
- Plan not found (500)
- Database query errors (500)

### Integration with Frontend

The frontend should:
1. Handle 403 responses with code `LIMITE_*_ATINGIDO`
2. Display upgrade prompt/button using `upgradePath`
3. Show user-friendly message from `mensagem` field
4. Optionally show current/limit values for context

### Testing Limits

To test plan limits in development:

1. Create a test user with a plan that has low limits (e.g., 2 funcionários)
2. Try to create resources until the limit is reached
3. Verify 403 response with correct error code and details

Example with starter plan:
```bash
# Create 5 employees (hits limit after 5th attempt)
POST /api/funcionarios/ → 201 (employees 1-5)
POST /api/funcionarios/ → 403 (employee 6 - limit reached)
```

## Future Enhancements

- [ ] Add a flag to bypass limits for testing/debugging
- [ ] Add billing integration to automatically upgrade plan on demand
- [ ] Add analytics to track usage per plan
- [ ] Implement soft limits with warnings at 80% usage
- [ ] Add admin override capability
