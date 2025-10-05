# 📋 Recursos REST Requeridos por el Frontend

## 🎯 Objetivo
Este documento especifica **exactamente** los endpoints REST que el frontend consume del backend. Mantener únicamente estos recursos para optimizar el backend.

---

## 🏗️ Estructura de URLs Base

```
Base URLs:
├── /api/config/income          → Configuración de ingresos
├── /api/config/pockets         → Gestión de bolsillos
├── /api/config/daily-budget    → Configuración presupuesto diario
├── /api/fixed-expenses         → Gastos fijos y transacciones híbridas
└── /api/daily-expenses         → Gastos diarios
```

---

## 📊 Endpoints Requeridos

### 1️⃣ **INGRESOS (Salario)**
**Base:** `/api/config/income`

| Método | Endpoint | Descripción | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/{month}` | Obtener salario del mes | - | `{monthly_amount: number}` |
| `PUT` | `/{month}` | Actualizar salario | `{monthly_amount: number}` | `{monthly_amount: number}` |

**Ejemplo:** `GET /api/config/income/2025-10`

---

### 2️⃣ **GASTOS FIJOS Y HÍBRIDOS**
**Base:** `/api/fixed-expenses`

| Método | Endpoint | Descripción | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/by-month/{month}` | Obtener gastos fijos del mes | - | `FixedExpense[]` |
| `POST` | `/` | Crear gasto fijo | `CreateFixedExpenseRequest` | `FixedExpense` |
| `PUT` | `/{id}` | Actualizar gasto fijo | `FixedExpense` | `FixedExpense` |
| `DELETE` | `/{id}` | Eliminar gasto fijo | - | `void` |
| `PUT` | `/{id}/status` | Cambiar estado de pago | `{is_paid: boolean}` | `{success: boolean}` |
| `PUT` | `/{id}/payment-status` | Actualizar estado y fecha | `{is_paid: boolean, paid_date?: string}` | `{success: boolean}` |
| `GET` | `/test` | Health check | - | `{status: string, message: string}` |

#### **Transacciones Híbridas:**
| Método | Endpoint | Descripción | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/{expenseId}/transactions` | Obtener transacciones | - | `HybridTransaction[]` |
| `POST` | `/{expenseId}/transactions` | Crear transacción | `CreateHybridTransactionRequest` | `HybridTransaction` |
| `PUT` | `/{expenseId}/transactions/{transactionId}` | Actualizar transacción | `UpdateHybridTransactionRequest` | `HybridTransaction` |
| `DELETE` | `/{expenseId}/transactions/{transactionId}` | Eliminar transacción | - | `void` |

---

### 3️⃣ **BOLSILLOS (Pockets)**
**Base:** `/api/config/pockets`

| Método | Endpoint | Descripción | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/` | Obtener todos los bolsillos | - | `Pocket[]` |
| `POST` | `/` | Crear bolsillo | `{name: string, description: string}` | `Pocket` |
| `PUT` | `/{id}` | Actualizar bolsillo | `Pocket` | `Pocket` |
| `DELETE` | `/{id}` | Eliminar bolsillo | - | `void` |
| `GET` | `/health` | Health check | - | `{status: string, timestamp: string}` |

---

### 4️⃣ **GASTOS DIARIOS**
**Base:** `/api/daily-expenses`

| Método | Endpoint | Descripción | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/{month}` | Obtener gastos del mes | - | `DailyExpense[]` |
| `POST` | `/` | Crear gasto diario | `CreateDailyExpenseRequest` | `DailyExpense` |
| `PUT` | `/{id}` | Actualizar gasto diario | `DailyExpense` | `DailyExpense` |
| `DELETE` | `/{id}` | Eliminar gasto diario | - | `{success: boolean}` |

---

### 5️⃣ **CONFIGURACIÓN PRESUPUESTO DIARIO**
**Base:** `/api/config/daily-budget`

| Método | Endpoint | Descripción | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/{month}` | Obtener configuración del mes | - | `DailyExpensesConfig` |
| `PUT` | `/{month}` | Actualizar presupuesto | `{monthly_budget: number}` | `DailyExpensesConfig` |

---

## 📝 Modelos de Datos Principales

### **FixedExpense**
```typescript
{
  id: number;
  concept_name: string;
  amount?: number;           // Para gastos fijos tradicionales
  payment_day?: number;      // Para gastos fijos tradicionales
  expense_type: 'fixed' | 'hybrid';
  budget_limit?: number;     // Para gastos híbridos
  current_spent?: number;    // Para gastos híbridos
  pocket_id: number;
  pocket_name?: string;
  is_paid: boolean;
  paid_date?: string;
  transactions?: HybridTransaction[];  // Para gastos híbridos
}
```

### **HybridTransaction**
```typescript
{
  id: number;
  fixed_expense_id: number;
  amount: number;
  description?: string;
  transaction_date: string;
  created_at: string;
}
```

### **DailyExpense**
```typescript
{
  id: number;
  amount: number;
  description: string;
  expense_date: string;
  pocket_id: number;
  pocket_name?: string;
}
```

### **Pocket**
```typescript
{
  id: number;
  name: string;
  description: string;
}
```

### **DailyExpensesConfig**
```typescript
{
  month: string;           // Formato: "YYYY-MM"
  monthly_budget: number;
}
```

---

## ⚠️ Consideraciones Importantes

### **Manejo de Errores:**
- **404**: Cuando no hay datos para un mes específico
- **200 con `null`**: El frontend maneja estos casos apropiadamente
- **Validaciones**: El frontend valida datos antes de enviar

### **Formato de Fechas:**
- **Meses**: `"YYYY-MM"` (ej: `"2025-10"`)
- **Fechas**: `"YYYY-MM-DD"` (ej: `"2025-10-15"`)

### **Headers Requeridos:**
```
Content-Type: application/json
```

---

## 🎯 Resumen de Endpoints por Funcionalidad

| **Funcionalidad** | **Endpoints** | **Prioridad** |
|-------------------|---------------|---------------|
| **Dashboard Principal** | `GET /api/fixed-expenses/by-month/{month}` | 🔴 Crítico |
| **Configuración Financiera** | `GET/PUT /api/config/income/{month}` | 🔴 Crítico |
| **Gastos Fijos** | `POST/PUT/DELETE /api/fixed-expenses/*` | 🔴 Crítico |
| **Gastos Híbridos** | `*/api/fixed-expenses/{id}/transactions/*` | 🟡 Nuevo |
| **Gastos Diarios** | `*/api/daily-expenses/*` | 🔴 Crítico |
| **Bolsillos** | `*/api/config/pockets/*` | 🔴 Crítico |
| **Health Checks** | `GET */test, */health` | 🟢 Opcional |

---

## ✅ Checklist de Implementación

- [ ] Todos los endpoints listados están implementados
- [ ] Modelos de datos coinciden con las interfaces TypeScript
- [ ] Manejo apropiado de errores 404 y respuestas `null`
- [ ] Headers CORS configurados para desarrollo local
- [ ] Health checks funcionando
- [ ] Validación de formatos de fecha
- [ ] Transacciones híbridas completamente funcionales

---

**📅 Generado:** $(date)  
**🎯 Objetivo:** Mantener únicamente los endpoints necesarios para el frontend  
**📋 Total Endpoints:** 25 endpoints distribuidos en 5 módulos principales
