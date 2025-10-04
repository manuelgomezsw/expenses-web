# 📊 Contrato del Backend - Gastos Diarios

## 🎯 **Resumen Ejecutivo**

El frontend espera que el backend implemente los siguientes endpoints para la gestión completa de gastos diarios y su configuración presupuestaria.

---

## 📋 **ENDPOINTS REQUERIDOS**

### **1. 📈 Obtener Gastos Diarios del Mes**

#### `GET /api/daily-expenses/{month}`

**Descripción**: Obtiene todos los gastos diarios de un mes específico

**Parámetros de URL**:
- `month`: string - Formato "YYYY-MM" (ej: "2025-10")

**Headers**:
```
Accept: application/json
```

**Response (200 OK)**:
```json
[
  {
    "id": 1,
    "description": "Café en Juan Valdez",
    "amount": 8500,
    "date": "2025-10-15",
    "created_at": "2025-10-15T10:30:00Z"
  },
  {
    "id": 2,
    "description": "Almuerzo con mi esposa",
    "amount": 45000,
    "date": "2025-10-14",
    "created_at": "2025-10-14T13:15:00Z"
  },
  {
    "id": 3,
    "description": "Libro 'Cien años de soledad'",
    "amount": 35000,
    "date": "2025-10-13",
    "created_at": "2025-10-13T16:45:00Z"
  }
]
```

**Validaciones**:
- El array puede estar vacío si no hay gastos
- Los gastos deben estar ordenados por fecha descendente (más recientes primero)
- El campo `created_at` es opcional, el frontend lo generará si no está presente

---

### **2. 💰 Obtener Configuración de Presupuesto Diario**

#### `GET /api/config/daily-budget/{month}`

**Descripción**: Obtiene la configuración del presupuesto mensual para gastos diarios

**Parámetros de URL**:
- `month`: string - Formato "YYYY-MM" (ej: "2025-10")

**Headers**:
```
Accept: application/json
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "monthly_budget": 500000,
  "month": "2025-10"
}
```

**Casos Especiales**:
- Si no existe configuración para el mes, retornar presupuesto en 0
- El `id` es opcional para el frontend

---

### **3. ➕ Crear Gasto Diario**

#### `POST /api/daily-expenses`

**Descripción**: Crea un nuevo gasto diario

**Headers**:
```
Content-Type: application/json
Accept: application/json
```

**Request Body**:
```json
{
  "description": "Café en Starbucks",
  "amount": 12000,
  "date": "2025-10-16"
}
```

**Response (201 Created)**:
```json
{
  "id": 4,
  "description": "Café en Starbucks",
  "amount": 12000,
  "date": "2025-10-16",
  "created_at": "2025-10-16T09:15:00Z"
}
```

**Validaciones del Backend**:
```java
// Ejemplo en Java/Spring Boot
@Valid
public class CreateDailyExpenseRequest {
    @NotBlank(message = "La descripción es requerida")
    @Size(max = 255, message = "La descripción no puede exceder 255 caracteres")
    private String description;
    
    @Positive(message = "El monto debe ser mayor a 0")
    @Max(value = 99999999, message = "El monto no puede exceder 99,999,999")
    private BigDecimal amount;
    
    @NotNull(message = "La fecha es requerida")
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "La fecha debe tener formato YYYY-MM-DD")
    private String date;
}
```

---

### **4. ✏️ Actualizar Gasto Diario**

#### `PUT /api/daily-expenses/{id}`

**Descripción**: Actualiza un gasto diario existente

**Parámetros de URL**:
- `id`: number - ID del gasto diario

**Headers**:
```
Content-Type: application/json
Accept: application/json
```

**Request Body**:
```json
{
  "description": "Café en Juan Valdez (actualizado)",
  "amount": 9500,
  "date": "2025-10-15"
}
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "description": "Café en Juan Valdez (actualizado)",
  "amount": 9500,
  "date": "2025-10-15",
  "created_at": "2025-10-15T10:30:00Z"
}
```

---

### **5. 🗑️ Eliminar Gasto Diario**

#### `DELETE /api/daily-expenses/{id}`

**Descripción**: Elimina un gasto diario

**Parámetros de URL**:
- `id`: number - ID del gasto diario

**Response (200 OK)**:
```json
{
  "success": true
}
```

**Response (404 Not Found)**:
```json
{
  "error": "Not Found",
  "message": "Gasto diario no encontrado",
  "timestamp": "2025-10-16T10:00:00Z"
}
```

---

### **6. 💸 Actualizar Presupuesto Mensual**

#### `PUT /api/config/daily-budget/{month}`

**Descripción**: Actualiza el presupuesto mensual para gastos diarios

**Parámetros de URL**:
- `month`: string - Formato "YYYY-MM" (ej: "2025-10")

**Headers**:
```
Content-Type: application/json
Accept: application/json
```

**Request Body**:
```json
{
  "monthly_budget": 600000
}
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "monthly_budget": 600000,
  "month": "2025-10"
}
```

---

## 🗂️ **MODELOS DE DATOS**

### **DailyExpense**
```typescript
interface DailyExpense {
  id?: number;           // Generado por el backend
  description: string;   // Máximo 255 caracteres
  amount: number;        // Valor positivo, máximo 99,999,999
  date: string;          // Formato "YYYY-MM-DD"
  created_at?: string;   // ISO 8601 timestamp (opcional)
}
```

### **DailyExpensesConfig**
```typescript
interface DailyExpensesConfig {
  id?: number;           // Generado por el backend (opcional)
  monthly_budget: number; // Valor positivo
  month: string;         // Formato "YYYY-MM"
}
```

---

## 🚨 **MANEJO DE ERRORES**

### **Error 400 - Bad Request**
```json
{
  "error": "Bad Request",
  "message": "Datos de entrada inválidos",
  "details": [
    "La descripción es requerida",
    "El monto debe ser mayor a 0",
    "La fecha debe tener formato YYYY-MM-DD"
  ],
  "timestamp": "2025-10-16T10:00:00Z"
}
```

### **Error 404 - Not Found**
```json
{
  "error": "Not Found",
  "message": "Gasto diario no encontrado",
  "timestamp": "2025-10-16T10:00:00Z"
}
```

### **Error 500 - Internal Server Error**
```json
{
  "error": "Internal Server Error",
  "message": "Error interno del servidor",
  "timestamp": "2025-10-16T10:00:00Z"
}
```

---

## 🔄 **FLUJO DE INTEGRACIÓN**

### **1. Carga Inicial de Datos**
```javascript
// El frontend hace estas llamadas al cargar el dashboard
GET /api/daily-expenses/2025-10        // Obtener gastos del mes
GET /api/config/daily-budget/2025-10   // Obtener presupuesto del mes
```

### **2. Crear Nuevo Gasto**
```javascript
POST /api/daily-expenses
{
  "description": "Almuerzo ejecutivo",
  "amount": 35000,
  "date": "2025-10-16"
}
```

### **3. Actualizar Presupuesto**
```javascript
PUT /api/config/daily-budget/2025-10
{
  "monthly_budget": 550000
}
```

---

## 🧪 **EJEMPLOS DE PRUEBA**

### **Crear Gasto con curl**
```bash
curl -X POST http://localhost:8080/api/daily-expenses \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Café matutino",
    "amount": 8500,
    "date": "2025-10-16"
  }'
```

### **Obtener Gastos del Mes**
```bash
curl http://localhost:8080/api/daily-expenses/2025-10
```

### **Actualizar Presupuesto**
```bash
curl -X PUT http://localhost:8080/api/config/daily-budget/2025-10 \
  -H "Content-Type: application/json" \
  -d '{
    "monthly_budget": 500000
  }'
```

---

## ⚙️ **CONFIGURACIÓN CORS**

El backend debe permitir requests desde el frontend:

```java
// Ejemplo Spring Boot
@CrossOrigin(origins = {"http://localhost:4200", "https://tu-dominio.com"})
@RestController
@RequestMapping("/api/daily-expenses")
public class DailyExpensesController {
    // ... endpoints
}
```

---

## 📊 **RESUMEN DE URLs**

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/daily-expenses/{month}` | Obtener gastos diarios del mes |
| POST | `/api/daily-expenses` | Crear nuevo gasto diario |
| PUT | `/api/daily-expenses/{id}` | Actualizar gasto diario |
| DELETE | `/api/daily-expenses/{id}` | Eliminar gasto diario |
| GET | `/api/config/daily-budget/{month}` | Obtener configuración de presupuesto |
| PUT | `/api/config/daily-budget/{month}` | Actualizar presupuesto mensual |

---

## ✅ **Checklist de Implementación**

- [ ] Implementar endpoint GET `/api/daily-expenses/{month}`
- [ ] Implementar endpoint POST `/api/daily-expenses`
- [ ] Implementar endpoint PUT `/api/daily-expenses/{id}`
- [ ] Implementar endpoint DELETE `/api/daily-expenses/{id}`
- [ ] Implementar endpoint GET `/api/config/daily-budget/{month}`
- [ ] Implementar endpoint PUT `/api/config/daily-budget/{month}`
- [ ] Configurar CORS para `localhost:4200`
- [ ] Implementar validaciones de entrada
- [ ] Implementar manejo de errores estándar
- [ ] Probar con curl o Postman
- [ ] Verificar integración con frontend

Una vez implementados estos endpoints, el frontend se conectará automáticamente y funcionará sin cambios adicionales.
