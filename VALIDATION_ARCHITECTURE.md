# Arquitetura de Validação - SISPOU

## Princípio Fundamental

**Validação é responsabilidade do Backend. Frontend é apenas UX.**

```
┌─────────────────────────────────────────────────────────────────┐
│                   CAMADAS DE VALIDAÇÃO                          │
└─────────────────────────────────────────────────────────────────┘

CAMADA 1: FRONTEND (UX & Feedback em Tempo Real)
├─ Localização: public/js/validator.js
├─ Responsabilidade: Masking + Feedback visual
├─ Funções:
│  ├─ FrontendValidator.formatCPF()        → Aplica máscara
│  ├─ FrontendValidator.formatTelefone()   → Aplica máscara
│  ├─ FrontendValidator.isValidCPF()       → Valida dígitos (feedback)
│  ├─ FrontendValidator.isValidEmail()     → Valida format (feedback)
│  ├─ FrontendValidator.cleanCPF()         → Remove formatação
│  └─ FrontendValidator.cleanTelefone()    → Remove formatação
├─ Por que?
│  ├─ Melhor UX: feedback instantâneo
│  ├─ Reduz erros: usuário vê o que está digitando
│  ├─ Não confia no cliente: qualquer um pode burlar
│  └─ Frontend pode ser inspecionado/modificado
└─ Conclusão: É apenas "orientativo", não definitivo

CAMADA 2: BACKEND - CONTROLLERS (Validação de Negócio)
├─ Localização: controllers/*.js
├─ Responsabilidade: Validar ALL rules de negócio
├─ Funções:
│  ├─ Validator.isValidCPF()        → Valida de verdade
│  ├─ Validator.isValidEmail()      → Valida de verdade
│  ├─ Validator.isValidTelefone()   → Valida de verdade
│  ├─ Validator.isValidCargo()      → Valida enum
│  ├─ Validator.isValidCapacidade() → Valida range
│  ├─ Validator.isValidStatus()     → Valida enum
│  └─ Validator.isValidTipo()       → Valida enum
├─ Por que?
│  ├─ Segurança: frontend não é confiável
│  ├─ Consistência: mesmas regras para API/Web/Mobile
│  ├─ Responsabilidade: controllers validam antes de usar
│  └─ Reutilização: Validator.js é usado por todos
└─ Resultado: ✅ CONFIÁVEL & ✅ SEGURO

CAMADA 3: BACKEND - MODELS (Verificação de Duplicação)
├─ Localização: models/*.js
├─ Responsabilidade: Verificar regras de integridade
├─ Funções:
│  ├─ findCPFInSystem(cpf)     → Busca em TODAS as tabelas
│  ├─ findEmailInSystem(email) → Busca em TODAS as tabelas
│  ├─ findByEmail(email)       → Busca na tabela específica
│  └─ findByCPF(cpf)           → Busca na tabela específica
├─ Por que?
│  ├─ Regra de negócio: CPF/Email devem ser únicos GLOBALMENTE
│  ├─ Integridade: impossível ter duplicação
│  ├─ Banco de dados: constraints (UNIQUE) como backup
│  └─ Consultas: findXXXInSystem() consultam múltiplas tabelas
└─ Resultado: ✅ INTEGRIDADE de Dados

CAMADA 4: DATABASE (Constraints & Índices)
├─ Localização: sispou_spring1.sql
├─ Responsabilidade: Última linha de defesa
├─ Constraints:
│  ├─ UNIQUE(email)  → Rejeita duplicação no DB
│  ├─ UNIQUE(cpf)    → Rejeita duplicação no DB
│  └─ PRIMARY KEY    → Garante identidade única
├─ Por que?
│  ├─ Proteção: race conditions, bugs, corrupção
│  ├─ Confiabilidade: DB sempre protegido
│  └─ Auditoria: impossível burlar via SQL direto
└─ Resultado: ✅ PROTEÇÃO Final
```

---

## Fluxo Detalhado: Cadastro de Cliente

### CENÁRIO 1: Usuário digita CPF válido mas que já existe no sistema

```
1. FRONTEND (register-client.js)
   ├─ Usuário digita: "123.456.789-09"
   ├─ Evento 'input':
   │  ├─ formatCPF("123456789xx") → "123.456.789-09"
   │  └─ Se 11 dígitos:
   │     └─ isValidCPF() → ✅ true (dígitos verificadores OK)
   │        └─ Remove feedback de erro (se havia)
   ├─ Usuário clica submit
   ├─ cleanCPF("123.456.789-09") → "12345678909"
   └─ POST /api/clients {cpf: "12345678909", ...}

2. BACKEND - ClienteController.create()
   ├─ Recebe: cpf = "12345678909"
   ├─ Step 1: Validator.isValidCPF("12345678909")
   │  └─ ✅ Pass (já foi validado no frontend, mas backend valida de novo)
   ├─ Step 2: ClienteModel.findCPFInSystem("12345678909")
   │  ├─ Query Cliente: SELECT * FROM Cliente WHERE cpf = "12345678909"
   │  └─ Encontrou! (CPF já existe em Cliente)
   ├─ Retorna erro:
   │  └─ 409 {message: "Este CPF já está cadastrado.", field: "cpf"}
   └─ NÃO persiste no banco

3. FRONTEND (register-client.js)
   ├─ Recebe: 409 {message, field}
   ├─ Cria elemento erro dinamicamente:
   │  └─ <div class="error-message">Este CPF já está cadastrado.</div>
   ├─ Insere após o input de CPF
   └─ Usuário vê mensagem de erro clara

RESULTADO: ✅ CPF DUPLICADO BLOQUEADO
```

### CENÁRIO 2: Usuário tenta burlar enviando CPF inválido via Postman

```
1. POSTMAN (atacante bypassa frontend)
   ├─ POST /api/clients
   └─ Body: {cpf: "00000000000", ...}  ← CPF inválido!

2. BACKEND - ClienteController.create()
   ├─ Recebe: cpf = "00000000000"
   ├─ Step 1: Validator.isValidCPF("00000000000")
   │  └─ ❌ Fail (dígitos verificadores inválidos)
   ├─ Retorna erro:
   │  └─ 400 {message: "CPF inválido. Verifique o CPF digitado.", field: "cpf"}
   └─ NÃO persiste no banco

3. POSTMAN (atacante)
   ├─ Recebe: 400 Error
   └─ ❌ Não conseguiu burlar!

RESULTADO: ✅ SEGURANÇA FUNCIONANDO
```

### CENÁRIO 3: Race condition - Dois usuários registram o mesmo CPF

```
Timing:
T1: User A envia POST /api/clients {cpf: "12345678909"}
T2: User B envia POST /api/clients {cpf: "12345678909"}
T3: A checa BD: ❌ Não encontrado (ainda não foi inserido)
T4: B checa BD: ❌ Não encontrado (ainda não foi inserido)
T5: A insere no BD: ✅ INSERT sucesso
T6: B insere no BD: ❌ ERRO! UNIQUE constraint violated

Database Response:
├─ A: 201 Created ✅
└─ B: 500 Erro - "Duplicate entry '12345678909' for key 'cpf'" ❌

RESULTADO: ✅ DATABASE CONSTRAINT PROTEGE
```

---

## Fluxo de Dados: Validação em Camadas

```
┌─────────────────────────────────────────────────────────────────┐
│  USUÁRIO DIGITA NO FRONTEND                                     │
│  "123456789xx" (formatando para "123.456.789-XX")              │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
         ┌───────────────────────┐
         │  FRONTEND VALIDATION  │
         │  (validator.js)       │
         ├───────────────────────┤
         │ • formatCPF()         │
         │ • isValidCPF()        │
         │ • cleanCPF()          │
         │                       │
         │ Resultado: UX feedback│
         └────────────┬──────────┘
                      │
                      ↓
         ┌───────────────────────┐
         │  FORM SUBMISSION      │
         │  POST /api/clients    │
         │  Body: clean data     │
         └────────────┬──────────┘
                      │
                      ↓
         ┌───────────────────────────────┐
         │  BACKEND - CONTROLLER         │
         │  (ClienteController.create)   │
         ├───────────────────────────────┤
         │ 1. Check required fields      │
         │ 2. Validator.isValidEmail()   │
         │ 3. Validator.isValidCPF()     │
         │ 4. Validator.isValidTelefone()│
         │                               │
         │ Resultado: Format OK?         │
         └────────────┬──────────────────┘
                      │
                      ↓ (if format OK)
         ┌───────────────────────────────┐
         │  BACKEND - MODEL              │
         │  (ClienteModel)               │
         ├───────────────────────────────┤
         │ • findCPFInSystem(cpf)        │
         │ • findEmailInSystem(email)    │
         │                               │
         │ Resultado: Unique?            │
         └────────────┬──────────────────┘
                      │
                      ↓ (if unique)
         ┌───────────────────────────────┐
         │  DATABASE                     │
         │  (MySQL sispou)               │
         ├───────────────────────────────┤
         │ INSERT INTO Cliente (...)     │
         │ UNIQUE(cpf), UNIQUE(email)    │
         │                               │
         │ Resultado: Inserted OK?       │
         └────────────┬──────────────────┘
                      │
                      ↓
         ┌───────────────────────────────┐
         │  RESPONSE                     │
         │ • 201 Success ✅              │
         │ • 400 Format Error ❌         │
         │ • 409 Duplicate Error ❌      │
         │ • 500 DB Error ❌             │
         └───────────────────────────────┘
```

---

## Comparação: Antes vs Depois

### ANTES (Duplicação de Código)

```javascript
// auth.js - Função isValidCPF
function isValidCPF(cpf) { ... 40 linhas ... }

// register-client.js - Função isValidCPF (DUPLICADA!)
function isValidCPF(cpf) { ... 40 linhas ... }

// Validator.js (backend) - Função isValidCPF (OUTRA VEZ!)
static isValidCPF(cpf) { ... 40 linhas ... }

PROBLEMA: 3 cópias da mesma função = DRY violation
```

### DEPOIS (Reutilização)

```javascript
// validator.js (frontend - compartilhado)
class FrontendValidator {
    static isValidCPF(cpf) { ... }
    static formatCPF(cpf) { ... }
    static cleanCPF(cpf) { ... }
}

// auth.js
├─ Importa: <script src="/js/validator.js"></script>
└─ Usa: FrontendValidator.isValidCPF(cpf)

// register-client.js
├─ Importa: <script src="/js/validator.js"></script>
└─ Usa: FrontendValidator.isValidCPF(cpf)

// Validator.js (backend - Node.js)
class Validator {
    static isValidCPF(cpf) { ... }
}

// Controllers
├─ AuthController: Validator.isValidCPF(cpf)
└─ ClienteController: Validator.isValidCPF(cpf)

BENEFÍCIO: ✅ DRY (Don't Repeat Yourself)
           ✅ Single Source of Truth (para cada camada)
           ✅ Manutenção facilitada
           ✅ Menos bugs
```

---

## Responsabilidades Claras

| Componente | Responsabilidade | O que NÃO faz |
|---|---|---|
| **validator.js (frontend)** | Formatar campos + feedback visual | Validação de segurança |
| **auth.js** | Coletar dados + enviar POST | Validação de formato |
| **register-client.js** | Coletar dados + enviar POST | Validação de formato |
| **Validator.js (backend)** | Validar TODAS as regras | Nada - confia no Controller |
| **ClienteController** | Orquestrar fluxo + chamar Model | Validação de formato |
| **ClienteModel** | Verificar duplicação global | Validação de formato |
| **Database** | Guardar dados + constraints | Validação de negócio |

---

## Princípios Aplicados

### 1. **Separation of Concerns** ✅
- Frontend: UX/Masking
- Backend: Validação real
- Database: Integridade final

### 2. **Defense in Depth** ✅
- Camada 1 (Frontend): UX feedback
- Camada 2 (Controller): Validação de formato
- Camada 3 (Model): Validação de regra
- Camada 4 (Database): Constraints

### 3. **DRY (Don't Repeat Yourself)** ✅
- validator.js: uma única fonte de verdade (frontend)
- Validator.js: uma única fonte de verdade (backend)
- Reutilização em todos os controllers

### 4. **Security by Default** ✅
- Backend SEMPRE valida (frontend pode ser burlado)
- Database tem constraints (Model pode falhar)
- Validação é obrigatória em 3 camadas

### 5. **Single Responsibility** ✅
- Cada arquivo tem uma responsabilidade clara
- Não mistura lógica de UI com validação
- Não mistura validação com persistência

---

## Verificação de Qualidade

```javascript
✅ Validação é feita no backend
   └─ Controllers usam Validator.js

✅ Frontend não duplica validação pesada
   └─ Apenas feedback visual

✅ Código reutilizado (FrontendValidator)
   └─ Importado por auth.js e register-client.js

✅ Sem repetição de lógica
   └─ isValidCPF definido uma vez por camada

✅ Separação clara de responsabilidades
   └─ Frontend: UX
   └─ Backend: Segurança
   └─ Database: Integridade

✅ Defesa em profundidade
   └─ 4 camadas de validação
```

---

## Conclusão

A arquitetura de validação do SISPOU segue o padrão **Defense in Depth**:

1. **Frontend** formateia e dá feedback visual (UX)
2. **Controller** valida todas as regras de formato
3. **Model** verifica integridade global
4. **Database** é a última linha de defesa

Isso garante que:
- ✅ **Usuários honestos** têm feedback em tempo real
- ✅ **Atacantes** não conseguem burlar (múltiplas camadas)
- ✅ **Dados** são sempre íntegros
- ✅ **Código** é reutilizado e mantível
