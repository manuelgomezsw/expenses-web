# Especificación Backend: Gastos Fijos Híbridos

## Resumen Ejecutivo

Implementar soporte para **Gastos Fijos Híbridos** en el backend existente. Esta funcionalidad permite manejar gastos que tienen un presupuesto mensual fijo pero se consumen en múltiples transacciones variables durante el mes (ej: gasolina, mercado, etc.).

## Arquitectura de Solución

### 1. Extensión del Modelo `FixedExpense`

```sql
-- Agregar campos a la tabla fixed_expenses
ALTER TABLE fixed_expenses ADD COLUMN expense_type VARCHAR(10) DEFAULT 'fixed' CHECK (expense_type IN ('fixed', 'hybrid'));
ALTER TABLE fixed_expenses ADD COLUMN budget_limit DECIMAL(10,2) NULL;
ALTER TABLE fixed_expenses ADD COLUMN current_spent DECIMAL(10,2) DEFAULT 0.00;

-- Crear tabla para transacciones híbridas
CREATE TABLE hybrid_transactions (
    id SERIAL PRIMARY KEY,
    fixed_expense_id INTEGER NOT NULL REFERENCES fixed_expenses(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX idx_hybrid_transactions_expense_id ON hybrid_transactions(fixed_expense_id);
CREATE INDEX idx_hybrid_transactions_date ON hybrid_transactions(transaction_date);
```

### 2. Actualización de Endpoints Existentes

#### **GET /api/config/fixed-expenses**
```json
// Response actualizada
{
  "fixedExpenses": [
    {
      "id": 1,
      "pocket_id": 2,
      "pocket_name": "Transporte",
      "concept_name": "Gasolina",
      "amount": 0,
      "payment_day": 0,
      "is_paid": false,
      "month": "2024-10",
      "expense_type": "hybrid",
      "budget_limit": 600000,
      "current_spent": 245000,
      "transactions": [
        {
          "id": 1,
          "fixed_expense_id": 1,
          "amount": 120000,
          "description": "Estación Shell Centro",
          "transaction_date": "2024-10-05",
          "created_at": "2024-10-05T10:30:00Z"
        },
        {
          "id": 2,
          "fixed_expense_id": 1,
          "amount": 125000,
          "description": "Estación Terpel Norte",
          "transaction_date": "2024-10-12",
          "created_at": "2024-10-12T15:45:00Z"
        }
      ]
    },
    {
      "id": 2,
      "pocket_id": 1,
      "pocket_name": "Vivienda",
      "concept_name": "Arriendo",
      "amount": 1200000,
      "payment_day": 5,
      "is_paid": true,
      "month": "2024-10",
      "expense_type": "fixed",
      "budget_limit": null,
      "current_spent": null,
      "transactions": []
    }
  ]
}
```

#### **POST /api/config/fixed-expenses**
```json
// Request para gasto híbrido
{
  "pocket_id": 2,
  "concept_name": "Gasolina",
  "amount": 0,
  "payment_day": 0,
  "month": "2024-10",
  "expense_type": "hybrid",
  "budget_limit": 600000
}

// Request para gasto fijo tradicional
{
  "pocket_id": 1,
  "concept_name": "Arriendo",
  "amount": 1200000,
  "payment_day": 5,
  "month": "2024-10",
  "expense_type": "fixed"
}
```

### 3. Nuevos Endpoints para Transacciones Híbridas

#### **GET /api/config/fixed-expenses/transactions/{expenseId}**
```json
// Response
[
  {
    "id": 1,
    "fixed_expense_id": 1,
    "amount": 120000,
    "description": "Estación Shell Centro",
    "transaction_date": "2024-10-05",
    "created_at": "2024-10-05T10:30:00Z"
  }
]
```

#### **POST /api/config/fixed-expenses/transactions**
```json
// Request
{
  "fixed_expense_id": 1,
  "amount": 120000,
  "description": "Estación Shell Centro",
  "transaction_date": "2024-10-05"
}

// Response
{
  "id": 1,
  "fixed_expense_id": 1,
  "amount": 120000,
  "description": "Estación Shell Centro",
  "transaction_date": "2024-10-05",
  "created_at": "2024-10-05T10:30:00Z"
}
```

#### **PUT /api/config/fixed-expenses/transactions/{transactionId}**
```json
// Request
{
  "amount": 125000,
  "description": "Estación Shell Centro - Actualizado",
  "transaction_date": "2024-10-05"
}

// Response: Misma estructura que POST
```

#### **DELETE /api/config/fixed-expenses/transactions/{transactionId}**
```json
// Response: 204 No Content
```

### 4. Lógica de Negocio Requerida

#### **Cálculo Automático de `current_spent`**
```sql
-- Trigger para actualizar current_spent automáticamente
CREATE OR REPLACE FUNCTION update_current_spent()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE fixed_expenses 
    SET current_spent = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM hybrid_transactions 
        WHERE fixed_expense_id = COALESCE(NEW.fixed_expense_id, OLD.fixed_expense_id)
    )
    WHERE id = COALESCE(NEW.fixed_expense_id, OLD.fixed_expense_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_current_spent
    AFTER INSERT OR UPDATE OR DELETE ON hybrid_transactions
    FOR EACH ROW EXECUTE FUNCTION update_current_spent();
```

#### **Validaciones de Negocio**
1. **Gastos Híbridos**: `expense_type = 'hybrid'` requiere `budget_limit > 0`
2. **Gastos Fijos**: `expense_type = 'fixed'` requiere `amount > 0` y `payment_day` entre 1-31
3. **Transacciones**: Solo se pueden crear para gastos con `expense_type = 'hybrid'`
4. **Límite de Presupuesto**: Validar que `current_spent + nueva_transacción <= budget_limit` (opcional, puede ser warning)

#### **Migración de Datos Existentes**
```sql
-- Marcar todos los gastos existentes como 'fixed'
UPDATE fixed_expenses 
SET expense_type = 'fixed' 
WHERE expense_type IS NULL;
```

### 5. Endpoints de Validación y Utilidades

#### **GET /api/config/fixed-expenses/{expenseId}/summary**
```json
// Response
{
  "expense_id": 1,
  "budget_limit": 600000,
  "current_spent": 245000,
  "remaining_budget": 355000,
  "usage_percentage": 40.83,
  "is_exceeded": false,
  "transaction_count": 2
}
```

### 6. Configuración CORS y Headers

Mantener la configuración CORS existente:
```javascript
// Express.js ejemplo
app.use(cors({
  origin: ['http://localhost:4200', 'https://expenses-web.web.app'],
  credentials: true
}));
```

### 7. Manejo de Errores

#### **Códigos de Error Específicos**
- `400`: Datos inválidos (ej: budget_limit requerido para híbridos)
- `404`: Gasto fijo o transacción no encontrada
- `409`: Conflicto (ej: intentar crear transacción para gasto no híbrido)
- `422`: Validación de negocio fallida (ej: exceder presupuesto)

#### **Respuestas de Error**
```json
{
  "error": "INVALID_EXPENSE_TYPE",
  "message": "No se pueden crear transacciones para gastos de tipo 'fixed'",
  "statusCode": 409
}
```

### 8. Consideraciones de Performance

1. **Índices**: Crear índices en `fixed_expense_id` y `transaction_date`
2. **Paginación**: Para gastos con muchas transacciones
3. **Caching**: Cachear `current_spent` calculado
4. **Batch Operations**: Permitir crear múltiples transacciones en una sola llamada

### 9. Testing Requerido

#### **Casos de Prueba Críticos**
1. Crear gasto híbrido con presupuesto válido
2. Crear transacciones hasta alcanzar el límite
3. Intentar crear transacción que exceda el presupuesto
4. Eliminar transacciones y verificar recálculo de `current_spent`
5. Migración de gastos fijos existentes
6. Validación de tipos de gasto en creación/actualización

### 10. Documentación API

Actualizar la documentación Swagger/OpenAPI con:
- Nuevos campos en esquemas existentes
- Nuevos endpoints de transacciones
- Ejemplos de requests/responses
- Códigos de error específicos

---

## Implementación Sugerida

### **Fase 1: Extensión del Modelo**
1. Ejecutar migraciones de base de datos
2. Actualizar modelos/entidades existentes
3. Implementar validaciones básicas

### **Fase 2: Endpoints de Transacciones**
1. Implementar CRUD de transacciones híbridas
2. Agregar lógica de cálculo automático
3. Implementar validaciones de negocio

### **Fase 3: Integración y Testing**
1. Actualizar endpoints existentes
2. Ejecutar suite de pruebas completa
3. Validar integración con frontend

### **Estimación de Tiempo**
- **Desarrollo**: 3-4 días
- **Testing**: 1-2 días
- **Documentación**: 1 día
- **Total**: 5-7 días

---

## Notas Importantes

1. **Retrocompatibilidad**: Todos los gastos existentes seguirán funcionando como 'fixed'
2. **Flexibilidad**: El sistema soporta ambos tipos de gastos simultáneamente
3. **Escalabilidad**: La estructura permite agregar más tipos de gastos en el futuro
4. **Integridad**: Los triggers garantizan consistencia de datos automáticamente

¿Necesitas alguna aclaración o detalle adicional sobre algún aspecto de la implementación?
