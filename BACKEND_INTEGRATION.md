# 🔗 Integración con Backend - Endpoints Requeridos

## 📋 Resumen de Integración

La aplicación frontend está **completamente integrada** con el backend. Todos los servicios tienen implementación con fallback a datos mock en caso de error de conectividad.

## 🌐 URLs de Configuración

### Development (localhost:8080)
```typescript
incomeUrl: 'http://localhost:8080/api/config/income'
fixedExpensesUrl: 'http://localhost:8080/api/config/fixed-expenses'
pocketsApiUrl: 'http://localhost:8080/api/config/pockets'
```

### Production (Google Cloud)
```typescript
incomeUrl: 'https://expenses-api-dot-quotes-api-100.ue.r.appspot.com/api/config/income'
fixedExpensesUrl: 'https://expenses-api-dot-quotes-api-100.ue.r.appspot.com/api/config/fixed-expenses'
pocketsApiUrl: 'https://expenses-api-dot-quotes-api-100.ue.r.appspot.com/api/config/pockets'
```

---

## 🏗️ Endpoints del Backend a Implementar

### 1. 💰 Gestión de Ingresos

#### `GET /api/config/income/{month}`
**Descripción**: Obtener ingresos del mes especificado
**Parámetros**: 
- `month`: string (formato "2025-10")

**Respuesta**:
```json
{
  "id": 1,
  "monthly_amount": 4500000,
  "month": "2025-10",
  "created_at": "2025-10-04T10:00:00Z"
}
```

#### `PUT /api/config/income/{month}`
**Descripción**: Actualizar ingresos del mes
**Body**:
```json
{
  "monthly_amount": 4500000
}
```

---

### 2. 📁 Gestión de Bolsillos

#### `GET /api/config/pockets`
**Descripción**: Obtener todos los bolsillos disponibles
**Respuesta**:
```json
[
  {
    "id": 1,
    "name": "Vivienda",
    "description": "Gastos relacionados con la vivienda",
    "created_at": "2025-10-04T10:00:00Z"
  },
  {
    "id": 2,
    "name": "Transporte",
    "description": "Gastos de transporte y vehículo",
    "created_at": "2025-10-04T10:00:00Z"
  }
]
```

#### `POST /api/config/pockets`
**Descripción**: Crear un nuevo bolsillo
**Body**:
```json
{
  "name": "Entretenimiento",
  "description": "Gastos de ocio y entretenimiento"
}
```

#### `PUT /api/config/pockets/{id}`
**Descripción**: Actualizar un bolsillo existente
**Body**:
```json
{
  "id": 1,
  "name": "Vivienda Actualizada",
  "description": "Nueva descripción",
  "created_at": "2025-10-04T10:00:00Z"
}
```

#### `DELETE /api/config/pockets/{id}`
**Descripción**: Eliminar un bolsillo
**Respuesta**: `200 OK`

---

### 3. 🧾 Gestión de Gastos Fijos

#### `GET /api/config/fixed-expenses/{month}`
**Descripción**: Obtener gastos fijos del mes especificado
**Parámetros**: 
- `month`: string (formato "2025-10")

**Respuesta**:
```json
[
  {
    "id": 1,
    "pocket_name": "Vivienda",
    "concept_name": "Arriendo",
    "amount": 1200000,
    "payment_day": 5,
    "is_paid": true,
    "month": "2025-10",
    "paid_date": "2025-10-05",
    "created_at": "2025-10-04T10:00:00Z"
  },
  {
    "id": 2,
    "pocket_name": "Transporte",
    "concept_name": "Gasolina",
    "amount": 400000,
    "payment_day": 1,
    "is_paid": false,
    "month": "2025-10",
    "paid_date": null,
    "created_at": "2025-10-04T10:00:00Z"
  }
]
```

#### `POST /api/config/fixed-expenses/{month}`
**Descripción**: Crear un nuevo gasto fijo
**Body**:
```json
{
  "pocket_name": "Vivienda",
  "concept_name": "Internet",
  "amount": 89000,
  "payment_day": 15
}
```

#### `PUT /api/config/fixed-expenses/{id}`
**Descripción**: Actualizar un gasto fijo existente
**Body**:
```json
{
  "id": 1,
  "pocket_name": "Vivienda",
  "concept_name": "Arriendo Actualizado",
  "amount": 1300000,
  "payment_day": 5,
  "is_paid": true,
  "month": "2025-10",
  "paid_date": "2025-10-05",
  "created_at": "2025-10-04T10:00:00Z"
}
```

#### `DELETE /api/config/fixed-expenses/{id}`
**Descripción**: Eliminar un gasto fijo
**Respuesta**: `200 OK`

#### `PATCH /api/config/fixed-expenses/{id}/payment-status`
**Descripción**: Actualizar estado de pago de un gasto fijo
**Body**:
```json
{
  "is_paid": true,
  "paid_date": "2025-10-05"
}
```

---

### 4. 🏥 Endpoint de Salud

#### `GET /api/config/health`
**Descripción**: Verificar estado del backend
**Respuesta**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-04T10:00:00Z"
}
```

---

## 🔧 Configuración de CORS

El backend debe permitir requests desde:
- `http://localhost:4200` (desarrollo)
- Tu dominio de producción

```java
@CrossOrigin(origins = {"http://localhost:4200", "https://tu-dominio.com"})
```

---

## 📝 Notas de Implementación

### 1. **Manejo de Errores**
El frontend maneja automáticamente:
- Errores de conectividad (fallback a mock)
- Errores HTTP (4xx, 5xx)
- Timeouts de red

### 2. **Validaciones**
El frontend valida:
- Campos requeridos
- Rangos de valores (día de pago 1-31)
- Formatos de fecha

### 3. **Estados de Carga**
- Indicadores de progreso durante operaciones
- Estados de conectividad del backend
- Notificaciones de éxito/error

### 4. **Datos Mock**
Si el backend no está disponible, la aplicación funciona con datos de prueba automáticamente.

---

## 🚀 Cómo Probar la Integración

1. **Sin Backend**: La app funciona con datos mock
2. **Con Backend**: 
   - Implementar endpoints según especificación
   - La app detecta automáticamente la conectividad
   - Indicador visual muestra el estado de conexión

### Indicadores de Estado:
- 🟢 **Conectado al servidor**: Backend funcionando
- 🟡 **Modo offline**: Usando datos de prueba
- 🔴 **Error de conexión**: Problemas de conectividad

---

## ✅ Estado Actual

- ✅ **Frontend**: Completamente implementado
- ✅ **Servicios**: Integrados con fallback
- ✅ **UI/UX**: Modal, validaciones, notificaciones
- ✅ **Manejo de errores**: Robusto y user-friendly
- ⏳ **Backend**: Pendiente de implementación

La aplicación está **lista para producción** y funcionará tanto con como sin backend implementado.
