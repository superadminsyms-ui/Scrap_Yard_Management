# Fixes de Seguridad Pendientes — ScrapYard Management

Estado a Jun 2026. Fixes ya aplicados: Fases A+B, gap del restore, bug wipe sin 2FA.
Compilación backend + frontend EXIT=0. Funcionalidad verificada (login, wipe, restore).

---

## Críticos (C1-C3) — Secretos hardcoded en application.properties

Están en git history (recuperables aunque se editen). Requieren **rotación** + quitar defaults.

- **C1** — `application.properties:24` JWT secret default `404E...6B5970`
  (clave pública de tutorial Baeldung; forjable si `JWT_SECRET` no se setea)
  - Fix: `${JWT_SECRET:}` + fail-fast al arranque si está vacío o <32 bytes
  - Rotar: `openssl rand -hex 32` → nuevo valor en `.env`

- **C2** — `application.properties:56-57` Gmail app password `rstu rlfx opit wulq`
  + username `superadminsyms@gmail.com`
  - Fix: `${MAIL_USERNAME:}` y `${MAIL_PASSWORD:}` + fail-fast si faltan
  - Rotar: revocar app password en Google Account → generar nueva

- **C3** — `application.properties:8` DB password `Spring2026.*`
  - Fix: `${DB_PASSWORD:}` + fail-fast si falta
  - Rotar: `ALTER USER ... IDENTIFIED BY 'nueva'` en MySQL

**Decisión pendiente:** ¿fail-fast con `@PostConstruct` check, o solo vacío sin check?
**Decisión pendiente:** ¿reescribir git history (filter-repo/BFG) o solo rotar?

---

## Altos

- **N2** — Patrón password admin débil `Adm1n$` + 6 hex (~30 bits)
  - `DataInitializer.java:42` (fallback) + `:53` (loguea password en texto plano)
  - Fix: `SecureRandom` 16 bytes base64-url (~128 bits); no loguear password;
    requerir `app.admin.default-password` por env var, o no crear admin si falta
  - En git history desde commit `27a218a`

- **mustChangePassword no bloquea login**
  - `AuthServImpl.java:143` solo informa el flag en JSON; `:136` ya emitió token JWT
  - El admin entra con password débil y puede quedarse sin cambiarlo indefinidamente
  - Fix opciones:
    - D1: token temporal corto (2 min) con claim `must-change-password`;
      `JwtAuthenticationFilter` solo permite `/api/auth/change-password`
    - D2: `/api/auth/change-password` acepta `email+currentPassword+newPassword`
      sin JWT cuando `mustChangePassword=true` (más simple)
  - Decidiste defer (no tocar login)

- **H8** — `application.properties:21` `ddl-auto=${JPA_DDL_AUTO:update}`
  - Hibernate muta schema live en cada arranque; sin Flyway/Liquibase
  - Fix: `ddl-auto=validate` (o `none`) + introducir migraciones
  - Decidiste defer

---

## Fase C (Media) — Decidiste defer

- **M2** — `pom.xml:47` `spring-boot-devtools` no excluido del jar empaquetado
  - Fix: excluir devtools en `spring-boot-maven-plugin` (como Lombok)

- **M4** — `BackupServImpl.java:539,581` DB password vía `--password=` en CLI
  - Visible en `ps` / process list
  - Fix: usar `MYSQL_PWD` env var o `--defaults-extra-file`

- **M7** — EAGER fetching sistémico (N+1 / DoS)
  - `Invoice.manager` EAGER sin `@EntityGraph`
  - `Container.scrapYard` → `company` EAGER, sin graph en paged repos
  - `Report` (scrapYard→company, manager) EAGER, sin graph
  - `User` → `managerSY` → `scrapYard` → `company` EAGER chain, sin graph en `findAll`
  - Fix: `fetch = FetchType.LAZY` en `@ManyToOne`/`@OneToOne` + `@EntityGraph`
    en repos paged. Riesgo: `LazyInitializationException` en mappers DTO fuera de sesión

---

## Bajos (decidiste defer o ya mitigados)

- **L1** — `application.properties:20` `show-sql` env-overridable; bloque prod
  comentado lo activaba. Mantener `false`; usar SLF4J SQL logging si hace falta
- **N4** — `admin@syms.com` email admin hardcoded (parcialmente resuelto:
  ahora es `superadminsyms@gmail.com` pero sigue hardcoded, no configurable)
- **O1** — (ver M4)

---

## Notas operativas

- `.env` local tiene los valores comprometidos (DB pwd + JWT secret).
  Tras rotar, actualizar `.env` con los nuevos valores.
- `superadminsyms@gmail.com` es a la vez email admin y remitente Gmail
  (`spring.mail.username`): forgot-password se auto-envía al mismo buzón.
  Funciona pero es inusual.
- Tras un restore, si el admin no recuerda su password pre-backup, debe usar
  `/api/auth/forgot-password` (requiere que SMTP funcione → dependencia con C2).
