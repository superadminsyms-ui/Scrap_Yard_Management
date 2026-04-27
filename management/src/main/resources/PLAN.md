# Plan de Implementación — Scrap Yard Management

> Ultima actualización: 22/04/2026
> Modo: Plan Mode → Build Mode

---

## Dominio del Negocio

### Flujo Core
1. Se crea un **Invoice** con InvoiceDetails (materiales + peso + precio)
2. El usuario asigna **manualmente** cada InvoiceDetail a un **Container**
3. Cada InvoiceDetail va a un **Container diferente**
4. El material se registra en un **ScrapYard** específico
5. El usuario puede consultar cuánto material hay por **tipo** en un patio o contenedor
6. Se puede hacer un **Movement** (INBOUND/OUTBOUND/TRANSFER) que descuenta stock
7. Movement es **opcional** (no obligatorio por tiempo)
7. Movement puede ser **parcial** (mover solo parte del material de un tipo)

### Modelo de Inventario (2 niveles)
- **Inventario por Container**: cuánto queda por tipo de material en cada contenedor
- **Inventario por ScrapYard**: cuánto queda por tipo de material en el patio total

---

## Entidades existentes

| Entidad | Status | Notas |
|---|---|---|
| Company | CRUD completo | Ya implementado |
| ScrapYard | CRUD base | Falta servicio completo |
| ManagerSY | CRUD base | Falta servicio completo |
| Customer | CRUD base | Falta servicio completo |
| Container | CRUD base | Falta servicio completo |
| Invoice | CRUD base | Falta lógica de negocio |
| InvoiceDetail | CRUD base | Falta lógica de negocio |
| Movement | CRUD base | Falta lógica de negocio |

---

## NUEVAS Entidades a crear

### StockInventory
Inventario a nivel ScrapYard por tipo de material.

```java
ScrapYard scrapYard ;       // patio dueño
MaterialType materialType; // ALUMINIUM, COPPER, IRON, etc.
BigDecimal quantity;   // siempre >= 0
boolean active;
LocalDateTime createdAt;
LocalDateTime updatedAt;
```

### ContainerInventory
Inventario a nivel Container por tipo de material.

```java
Container container
MaterialType materialType
BigDecimal quantity       // siempre >= 0
boolean active
LocalDateTime createdAt
LocalDateTime updatedAt
```

---

## Orden de Implementación

```
1. COMPANY        ← Ya existe (CRUD completo)
2. SCRAPYARD      ← Completar CRUD + service
3. MANAGERSY      ← Completar CRUD + service
4. CUSTOMER       ← Completar CRUD + service
5. CONTAINER      ← Completar CRUD + service
6. STOCK_INVENTORY ← NUEVA entidad + CRUD
7. CONTAINER_INVENTORY ← NUEVA entidad + CRUD
8. INVOICE + INVOICEDETAIL ← Lógica de negocio + actualización de inventario
9. MOVEMENT       ← Lógica de negocio + decremento de inventario
```

---

## Lógica de Inventario

### INSERT/INBOUND (al crear Invoice)
```
1. Crear Invoice + InvoiceDetails
2. Por cada InvoiceDetail:
   a. Crear/actualizar ContainerInventory (container + materialType + weight)
   b. Crear/actualizar StockInventory (scrapYard + materialType + weight)
```

### MOVEMENT (OUTBOUND/TRANSFER)
```
1. Validar stock suficiente en ContainerInventory
2. Validar stock suficiente en StockInventory
3. Descontar de origen:
   a. ContainerInventory.origin -= amount
   b. StockInventory.origin -= amount
4. Si TRANSFER, incrementar destino:
   a. StockInventory.destino += amount
```

### Consulta de Inventario
```
GET /api/stock-inventory/scrapyard/{id}
  → Lista StockInventory del ScrapYard

GET /api/container-inventory/container/{id}
  → Lista ContainerInventory del Container
```

---

## Validaciones Críticas en Servicios

| Regla | Dónde |
|---|---|
| ScrapYard debe existir antes de Invoice | `IInvoiceService.createInvoice()` |
| Customer debe pertenecer a la misma Company que el ScrapYard | `IInvoiceService.createInvoice()` |
| Container debe pertenecer al ScrapYard del Invoice | `IInvoiceService.createInvoice()` |
| Cada InvoiceDetail → 1 Container diferente | `IInvoiceService.createInvoice()` |
| Stock suficiente en ContainerInventory antes de Movement | `IMovementService.createMovement()` |
| Stock suficiente en StockInventory antes de Movement | `IMovementService.createMovement()` |
| Solo ManagerSY del ScrapYard correcto puede hacer Movement | `IMovementService.createMovement()` |
| Movement no puede superar cantidad disponible por tipo | `IMovementService.createMovement()` |
| TRANSFER: scrapYard origen != scrapYard destino | `IMovementService.createMovement()` |

---

## Cambios en Entidades Existentes

### Todas las entidades
- [ ] Agregar `createdAt` (LocalDateTime)
- [ ] Agregar `updatedAt` (LocalDateTime)
- [ ] Agregar `active` (boolean, default true) — soft delete
- [ ] Agregar `@Version` para optimistic locking

### Container
- [ ] Agregar `@NotNull` en `materialWeight`

### Movement
- [ ] Agregar campo `materialType` para saber qué tipo de material se movió

### InvoiceDetail
- [ ] Considerar unique constraint por container por invoice (1 detail por container)

### Invoice
- [ ] Agregar `@Version` para optimistic locking

---

## Decisiones de Diseño

| Decisión | Valor |
|---|---|
| Invoice tiene estados? | No — confirmado al crear, no cancelable |
| Movement obligatorio? | No — opcional |
| Movement parcial? | Sí — puede mover parte del material de un tipo |
| InvoiceDetail incluye precio? | Sí — precio por unidad ya viene en el detail |
| Auditoría de inventario? | No — registro en StockInventory es suficiente |

---

## Pendiente por Confirmar

- [ ] ¿InvoiceDetail debe tener un identificador único además del id?
- [ ] ¿El precio del material se define por InvoiceDetail o cambia según mercado?
- [ ] ¿Los ManagersSY pueden ver/operar en múltiples ScrapYards?
- [ ] ¿Hay algún rol de usuario além de ManagerSY (admin, viewer)?
- [ ] ¿Se necesita تاريخ de Movements por container o por ScrapYard?

---

## Antipatrones a Evitar

- NO business logic en Controllers
- NO CascadeType.ALL en relaciones
- NO exponer entidades directamente en APIs
- NO hard delete — usar soft delete (`active = false`)
- NO `existsById` + `findById` — usar `orElseThrow` directo
- NO lógica de inventario en entidades — en servicios