# 🧾 Especificación del Backend - Fixed Expenses

## 📋 Endpoint Principal para Creación

### `POST /api/fixed-expenses`

**Descripción**: Crear un nuevo gasto fijo

**Headers**:
```
Content-Type: application/json
Accept: application/json
```

**Request Body**:
```json
{
  "pocket_name": "Vivienda",
  "concept_name": "Arriendo",
  "amount": 1200000,
  "payment_day": 5,
  "month": "2025-10"
}
```

**Response (201 Created)**:
```json
{
  "id": 123,
  "pocket_name": "Vivienda",
  "concept_name": "Arriendo",
  "amount": 1200000,
  "payment_day": 5,
  "month": "2025-10",
  "is_paid": false,
  "paid_date": null,
  "created_at": "2025-10-04T15:30:00Z"
}
```

---

## 🔧 Endpoint de Prueba (Opcional)

### `GET /api/fixed-expenses/test`

**Descripción**: Verificar que el endpoint esté disponible

**Response (200 OK)**:
```json
{
  "status": "ok",
  "message": "Fixed expenses endpoint disponible"
}
```

---

## 📝 Validaciones del Backend

### Campos Requeridos:
- `pocket_name`: string, no vacío
- `concept_name`: string, no vacío  
- `amount`: number, mayor a 0
- `payment_day`: number, entre 1 y 31
- `month`: string, formato "YYYY-MM"

### Validaciones Adicionales:
```java
// Ejemplo en Java/Spring Boot
@Valid
public class CreateFixedExpenseRequest {
    @NotBlank(message = "El nombre del bolsillo es requerido")
    private String pocket_name;
    
    @NotBlank(message = "El concepto es requerido")
    private String concept_name;
    
    @Positive(message = "El monto debe ser mayor a 0")
    private BigDecimal amount;
    
    @Min(value = 1, message = "El día de pago debe ser entre 1 y 31")
    @Max(value = 31, message = "El día de pago debe ser entre 1 y 31")
    private Integer payment_day;
    
    @Pattern(regexp = "\\d{4}-\\d{2}", message = "El mes debe tener formato YYYY-MM")
    private String month;
}
```

---

## 🚨 Manejo de Errores

### Error 400 - Bad Request:
```json
{
  "error": "Bad Request",
  "message": "Datos de entrada inválidos",
  "details": [
    "El monto debe ser mayor a 0",
    "El día de pago debe estar entre 1 y 31"
  ],
  "timestamp": "2025-10-04T15:30:00Z"
}
```

### Error 500 - Internal Server Error:
```json
{
  "error": "Internal Server Error",
  "message": "Error interno del servidor",
  "timestamp": "2025-10-04T15:30:00Z"
}
```

---

## 🔄 Flujo Completo de Integración

### 1. **Frontend envía request**:
```javascript
POST http://localhost:8080/api/fixed-expenses
Content-Type: application/json

{
  "pocket_name": "Transporte",
  "concept_name": "Gasolina",
  "amount": 400000,
  "payment_day": 1,
  "month": "2025-10"
}
```

### 2. **Backend procesa y responde**:
```json
{
  "id": 124,
  "pocket_name": "Transporte",
  "concept_name": "Gasolina", 
  "amount": 400000,
  "payment_day": 1,
  "month": "2025-10",
  "is_paid": false,
  "paid_date": null,
  "created_at": "2025-10-04T15:35:00Z"
}
```

### 3. **Frontend actualiza UI**:
- Agrega el nuevo gasto a la lista
- Actualiza totales por bolsillo
- Muestra notificación de éxito
- Cierra el modal de creación

---

## 🧪 Cómo Probar

### 1. **Usando la aplicación**:
1. Ir a `http://localhost:4200/configuration`
2. Hacer clic en "Agregar Nuevo Gasto Fijo"
3. Llenar el formulario
4. Hacer clic en "Agregar Gasto"
5. Verificar logs en consola del navegador

### 2. **Usando curl**:
```bash
curl -X POST http://localhost:8080/api/fixed-expenses \
  -H "Content-Type: application/json" \
  -d '{
    "pocket_name": "Salud",
    "concept_name": "EPS",
    "amount": 120000,
    "payment_day": 10,
    "month": "2025-10"
  }'
```

### 3. **Probar endpoint de prueba**:
```bash
curl http://localhost:8080/api/fixed-expenses/test
```

---

## 📊 Logs Esperados

### En el Frontend (Consola del navegador):
```
Iniciando creación de gasto fijo: {pocket_name: "Salud", concept_name: "EPS", ...} para el mes: 2025-10
Creando gasto fijo en: http://localhost:8080/api/fixed-expenses con datos: {...}
Gasto fijo creado exitosamente: {id: 125, ...}
Gasto fijo creado exitosamente en el componente: {id: 125, ...}
Configuración actualizada con nuevo gasto fijo
```

### En el Backend (Logs del servidor):
```
POST /api/fixed-expenses - Request received
Validating fixed expense data: {pocket_name: "Salud", ...}
Creating fixed expense in database
Fixed expense created successfully with ID: 125
POST /api/fixed-expenses - Response sent: 201 Created
```

---

## ✅ Checklist de Implementación

- [ ] Crear endpoint `POST /api/fixed-expenses`
- [ ] Implementar validaciones de entrada
- [ ] Configurar respuesta con estructura correcta
- [ ] Agregar manejo de errores
- [ ] Configurar CORS para `localhost:4200`
- [ ] Crear endpoint de prueba (opcional)
- [ ] Probar con curl
- [ ] Probar con la aplicación frontend

---

## 🎯 Estado Actual

- ✅ **Frontend**: Completamente implementado y listo
- ✅ **Integración**: Configurada con fallback a mock
- ✅ **UI/UX**: Modal, validaciones, notificaciones
- ✅ **Logs**: Debugging completo implementado
- ⏳ **Backend**: Pendiente de implementación

Una vez implementes el endpoint, la aplicación se conectará automáticamente y funcionará sin cambios adicionales en el frontend.
