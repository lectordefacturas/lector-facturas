---
name: project-business-model
description: "Modelo de negocio y roles — Santi+Valeria son fundadores del producto SaaS, NO empleados del hotel"
metadata: 
  node_type: memory
  type: project
  originSessionId: cb105876-5091-4efa-aa62-d7a2dfa54619
---

**Modelo de negocio (clarificado por Santi el 2026-05-27).**

**Lector de Facturas es un producto SaaS** que Santi y Valeria están construyendo como **emprendedores**, no como empleados del hotel. Pensarlo como una startup que vende un sistema a hoteles uruguayos.

**Los actores:**

- **Santiago + Valeria** → cofundadores del producto. NO son empleados desde la perspectiva del sistema. Son los dueños del software, soporte, mantenimiento. Necesitarán un rol futuro tipo "super admin" o "staff del producto" que bypassa la regla del hotel (pueden ver/auditar todo sin estar vinculados a un hotel específico).

- **Hotel Cala di Volpe** → hoy es el **banco de pruebas** (Santi y Vale trabajan ahí, pueden usar sus datos reales para desarrollar). Mañana puede ser **cliente** cuando le vendan el producto. Hoy es "aliado", mañana es "cliente".

- **Otros hoteles** → futuros clientes. Cada uno con su propio `hotel_id`, sus propios usuarios, sus propios datos. La regla sagrada multi-hotel los aísla.

**Implicancias de diseño:**

1. **`lectordefacturas@gmail.com` NO debe vincularse a Cala di Volpe** como admin. Ese usuario es del proyecto/producto. Si lo hacés admin de Cala, cuando le vendas a Cala como cliente queda raro (vos no sos admin del hotel de tu cliente).

2. **Para probar localmente** durante desarrollo, conviene crear **usuarios explícitamente de prueba** (ej: `prueba@cala-di-volpe.test`) vinculados a Cala. Cuando llegue el día de venderle a Cala, esos usuarios de prueba se borran y los empleados reales del hotel crean sus cuentas.

3. **Rol "super admin del sistema"** queda pendiente como concepto. No implementado todavía. Cuando se implemente, será un campo o tabla aparte (no en `miembros_hotel`) que permita a Santi/Vale ver todo para soporte sin estar vinculados a un hotel específico.

4. **Cuando se sume Valeria al sistema**: hay que crear su usuario también. Misma lógica — usuario del producto, no atado a Cala de entrada.

Relacionado: [[project-overview]], [[project-db-design]], [[user-profile]].
