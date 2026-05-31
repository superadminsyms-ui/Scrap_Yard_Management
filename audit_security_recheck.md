# Auditoria de Seguridad — Sistema de Autenticacion y Autorizacion

## HALLAZGOS ORDENADOS POR SEVERIDAD

---

### 1. JWT Secret Hardcodeado en application.properties
**Severidad: CRITICAL**

**Archivo:** `application.properties:17`

```
jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
```

**Riesgo:** El secret esta hardcodeado en el codigo fuente. Si el repositorio se compromete (publico, privado con acceso de terceros, leak), el atacante puede:
- Firmar tokens JWT arbitrarios como cualquier usuario y cualquier rol
- Escalar privilegios de MANAGER a SUPERADMIN
- Suplantar identidad de cualquier usuario

**Impacto:** Compromiso total del sistema de autenticacion.

**Correccion:**
```properties
# application.properties
jwt.secret=${JWT_SECRET}
```
Y configurar la variable de entorno `JWT_SECRET` en produccion con un valor aleatorio de al menos 256 bits generados con `openssl rand -base64 32`.

---

### 2. Credenciales de Base de Datos Hardcodeadas
**Severidad: CRITICAL**

**Archivo:** `application.properties:6-8`

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/db_scrapyardm
spring.datasource.username=root
spring.datasource.password=Spring2026.*
```

**Riesgo:** Password de DB expuesta en el codigo fuente. El usuario `root` tiene acceso total a MySQL. Un atacante con acceso al codigo puede conectarse directamente a la base de datos.

**Impacto:** Compromiso total de datos (lectura, modificacion, eliminacion).

**Correccion:**
```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
```

---

### 3. Credenciales de BD Pasadas como Argumento de Proceso
**Severidad: CRITICAL**

**Archivo:** `BackupServImpl.java:509-516` y `549-554`

```java
"--password=" + dbPassword,
```

**Riesgo:** La contrasena de la base de datos se pasa como argumento de linea de comandos a `mysqldump` y `mysql`. Esto es visible en `/proc/PID/cmdline` para cualquier usuario del sistema operativo. Ademas, el proceso `mysqldump` aparece en la tabla de procesos de MySQL con la contrasena en texto plano.

**Impacto:** Un atacante con acceso lateral al servidor puede leer las credenciales de DB de los procesos en ejecucion.

**Correccion:** Usar `MYSQL_PWD` como variable de entorno del proceso o usar un archivo de configuracion `~/.my.cnf` temporal:
```java
ProcessBuilder pb = new ProcessBuilder("mysqldump", ...);
pb.environment().put("MYSQL_PWD", dbPassword);
// No pasar --password en la linea de comandos
```

---

### 4. Password por Defecto para Admin en DataInitializer
**Severidad: HIGH**

**Archivo:** `DataInitializer.java:27`

```java
admin.setPassword(passwordEncoder.encode("admin123"));
```

**Riesgo:** El superadmin se crea con una contrasena debil y predecible (`admin123`). Aunque `mustChangePassword=true`, si el cambio de password falla o se salta, la credencial queda exposeda. Es un target obvio para brute force.

**Impacto:** Compromiso de la cuenta de superadmin.

**Correccion:** Generar un password aleatorio en tiempo de startup y registrarlo en log (una unica vez):
```java
String initialPassword = UUID.randomUUID().toString().substring(0, 16);
admin.setPassword(passwordEncoder.encode(initialPassword));
log.warn("Initial admin password: {} - CHANGE IMMEDIATELY", initialPassword);
```
O mejor aun, usar una variable de entorno `${ADMIN_INITIAL_PASSWORD}`.

---

### 5. CORS Permite Origen `*` con Credenciales
**Severidad: HIGH**

**Archivo:** `WebSecurityConfig.java:77`

```java
configuration.setAllowedOrigins(List.of("*"));
```

**Riesgo:** Si en algun momento se habilita `allowCredentials(true)` (que seria necesario para cookies/sessions), Spring lanzara error porque `*` + `credentials` es invalido. Pero mas importante: con `*`, cualquier sitio web malicioso puede hacer peticiones a tu API desde el navegador del usuario si este tiene un JWT almacenado en localStorage.

**Correlacion con frontend:** El JWT se almacena en `localStorage` (`AuthContext.tsx:65`). Si un usuario visita un sitio malicioso, ese sitio NO puede leer localStorage de otro dominio (poliza de mismo origen), pero si puede hacer peticiones arbitrarias si hay un header `Authorization` inyectado — excepto que el navegador no envia automaticamente headers custom en peticiones cross-origin. Sin embargo, la configuracion `*` sigue siendo una mala practica en produccion.

**Impacto:** Ataques CSRF si se habilitan credenciales; mala practica de seguridad en produccion.

**Correccion:**
```java
configuration.setAllowedOrigins(List.of(
    "http://localhost:3000",  // desarrollo
    "https://tu-dominio.com"  // produccion
));
configuration.setAllowCredentials(true); // solo si es necesario
```

---

### 6. Swagger UI Accesible sin Autenticacion
**Severidad: HIGH**

**Archivo:** `WebSecurityConfig.java:42`

```java
.requestMatchers("/swagger-ui/**", "/api-docs/**").permitAll()
```

**Riesgo:** Swagger UI documenta todos los endpoints, DTOs, y esquemas de la API. En produccion, un atacante obtiene un mapa completo de tu API, incluyendo endpoints de backup, auth, admin, etc. Esto facilita el reconocimiento previo a un ataque.

**Impacto:** Exposicion del diseno completo de la API; informacion util para ataques dirigidos.

**Correccion:**
```java
.requestMatchers("/swagger-ui/**", "/api-docs/**").hasRole("SUPERADMIN")
```
O mejor, deshabilitar completamente en produccion:
```java
@Profile("!prod") // solo disponible en desarrollo
```

---

### 7. `/api/auth/register` con `permitAll()` sin Verificacion de Rol en Spring Security
**Severidad: HIGH**

**Archivo:** `WebSecurityConfig.java:40-41`

```java
.requestMatchers("/api/auth/**").permitAll()
```

**Riesgo:** El endpoint `POST /api/auth/register` cae bajo `/api/auth/**` y tiene `permitAll()`. La validacion de rol (solo SUPERADMIN puede registrar) se hace unicamente en el servicio (`AuthServImpl.java:95`), no en Spring Security.

Un atacante puede enviar un POST directamente a `/api/auth/register` con `"role": "SUPERADMIN"`. El servicio verifica que el usuario autenticado sea SUPERADMIN, pero como `permitAll()`, la peticion llega sin autenticacion y `securityContextService.getCurrentUser()` devuelve `null`, causando un `NullPointerException` en lugar de un 403 controlado.

**Verificacion:** En `AuthController.java:44`:
```java
authService.register(request, securityContextService.getCurrentUser())
```
Si `getCurrentUser()` es null (no autenticado), en `AuthServImpl.java:95`:
```java
if (currentUser.getRole() != UserRole.SUPERADMIN)
```
Esto lanza `NullPointerException` porque `currentUser` es null. El `GlobalExceptionHandler` lo captura como `RuntimeException` con mensaje generico, pero no devuelve 403 como deberia.

**Impacto:** Error 500 en vez de 403; potencial bypass si se modifica la logica del servicio.

**Correccion:** Excluir `/api/auth/register` del patron `permitAll()` y requerir autenticacion:
```java
.requestMatchers("/api/auth/login", "/api/auth/me").permitAll()
.requestMatchers("/api/auth/register").authenticated()
```
O tambien agregar la verificacion de null en `AuthServImpl`:
```java
if (currentUser == null || currentUser.getRole() != UserRole.SUPERADMIN) {
    throw new IllegalArgumentException("Only SUPERADMIN can register new users");
}
```

---

### 8. Rate Limiting Basado en IP Spoofeable
**Severidad: HIGH**

**Archivo:** `RateLimitFilter.java:76-86`

```java
private String getClientIp(HttpServletRequest request) {
    String xForwardedFor = request.getHeader("X-Forwarded-For");
    if (xForwardedFor != null && !xForwardedFor.isBlank()) {
        return xForwardedFor.split(",")[0].trim();
    }
    String xRealIp = request.getHeader("X-Real-IP");
    if (xRealIp != null && !xRealIp.isBlank()) {
        return xRealIp.trim();
    }
    return request.getRemoteAddr();
}
```

**Riesgo:** Un atacante puede enviar header `X-Forwarded-For` con IPs diferentes en cada peticion, saltandose completamente el rate limiter. Cada peticion pareceria venir de una IP distinta.

**Impacto:** El rate limiting es ineficaz contra atacantes. Se pueden hacer brute force ilimitados contra `/api/auth/login`.

**Correccion:** Solo confiar en estos headers si la peticion viene de un proxy confiable. Spring Security ya no tiene `FilterRegistrationBean` para esto, pero la solucion es:
```java
private String getClientIp(HttpServletRequest request) {
    // Solo confiar en X-Forwarded-For si viene de un proxy confiable
    // En produccion, configurar server.forward-headers-strategy=NATIVE o FRAMEWORK
    // y usar request.getRemoteAddr() que ya sera la IP real del proxy
    
    // Solucion temporal: no confiar en headers del cliente
    return request.getRemoteAddr();
}
```
Si detras de un reverse proxy (nginx), configurar `server.forward-headers-strategy=FRAMEWORK` en `application.properties` y usar `request.getRemoteAddr()` que Spring ya decodifica correctamente.

---

### 9. Rate Limiter: Memory Leak sin Limpieza
**Severidad: MEDIUM**

**Archivo:** `RateLimitFilter.java:24-25`

```java
private final ConcurrentHashMap<String, LinkedList<Long>> loginAttempts = new ConcurrentHashMap<>();
private final ConcurrentHashMap<String, LinkedList<Long>> apiAttempts = new ConcurrentHashMap<>();
```

**Riesgo:** Los mapas nunca se limpian. Cada IP que hace una peticion queda registrada permanentemente en memoria. En un ataque DDoS o con trafico normal significativo, esto crece indefinidamente causando OOM.

**Impacto:** Denegacion de servicio por agotamiento de memoria.

**Correccion:** Usar un mecanismo de limpieza periodica o una libreria como Guava `Cache` o Caffeine con expiracion:
```java
private final Cache<String, LinkedList<Long>> loginAttempts = 
    CacheBuilder.newBuilder()
        .expireAfterAccess(1, TimeUnit.MINUTES)
        .maximumSize(10_000)
        .build();
```
O agregar un `@Scheduled` que limpie entradas expiradas periodicamente.

---

### 10. Rate Limiter Login: 5 Intentos / Minuto es Insuficiente
**Severidad: MEDIUM**

**Archivo:** `RateLimitFilter.java:18`

```java
private static final int LOGIN_MAX_REQUESTS = 5;
private static final long LOGIN_WINDOW_MS = 60_000;
```

**Riesgo:** 5 intentos por minuto permite 300 intentos/hora y 7,200 intentos/dia por IP. Con un diccionario de contrasenas comunes y rotacion de IPs (facil con VPNs/proxies), un atacante puede probar miles de combinaciones.

Ademas, combinado con el problema #8 (IP spoofing via X-Forwarded-For), el rate limiter es completamente ineficaz.

**Impacto:** Ataques de brute force viables.

**Correccion:**
- Reducir a 3-5 intentos por 15 minutos con lockout progresivo
- Agregar lockeo de cuenta despues de N intentos fallidos
- Considerar librerias como `spring-security-lockout` o implementar account lockout en `AuthServImpl`
- Usar CAPTCHA despues de intentos fallidos

---

### 11. JWT Sin Revocacion ni Blacklist
**Severidad: MEDIUM**

**Archivo:** `JwtUtil.java` (todo el archivo)

**Riesgo:** Una vez emitido, un JWT es valido hasta que expire (24 horas, `jwt.expiration=86400000`). No existe mecanismo para invalidar tokens. Esto significa:
- Si un usuario cambia su password, su token antiguo sigue siendo valido
- Si un admin desactiva un usuario (`deactivateUser`), el token de ese usuario sigue funcionando
- Si se detecta un token comprometido, no hay forma de revocarlo

**Impacto:** Sesiones hijacked o desactivadas que siguen siendo funcionales hasta 24 horas.

**Correccion:** Implementar una blacklist de tokens usando Redis o una tabla en DB:
```java
// Opcion 1: Blacklist en DB
@Entity
public class RevokedToken {
    @Id private String tokenId;
    private LocalDateTime revokedAt;
}

// Opcion 2: Token version en User entity - invalidate all tokens by bumping version
// Agregar al JWT: .claim("version", user.getTokenVersion())
// Al desactivar/cambiar password: user.setTokenVersion(user.getTokenVersion() + 1)
```
En `JwtAuthenticationFilter`, verificar que el token no este revocado o que la version coincida.

---

### 12. Enumeracion de Usuarios en Login
**Severidad: MEDIUM**

**Archivo:** `AuthServImpl.java:60-67`

```java
} catch (DisabledException e) {
    throw new IllegalArgumentException("Your account has been deactivated...");
} catch (AuthenticationException e) {
    throw new IllegalArgumentException("Invalid email or password");
}
```

El mensaje para cuenta desactivada es diferente al de credenciales invalidas. Esto permite a un atacante determinar si un email existe en el sistema: si recibe el mensaje de "deactivated", sabe que el email existe; si recibe "Invalid email or password", no sabe si es el email o el password.

**Impacto:** Enumeracion de usuarios validos.

**Correccion:** Mensaje generico identico en todos los casos:
```java
} catch (DisabledException | AuthenticationException e) {
    throw new IllegalArgumentException("Invalid credentials");
}
```

---

### 13. Fuga de Informacion en IOException Handler
**Severidad: MEDIUM**

**Archivo:** `GlobalExceptionHandler.java:132-139`

```java
@ExceptionHandler(java.io.IOException.class)
public ResponseEntity<?> handleIOException(java.io.IOException ex) {
    // ...
    error.put("message", "Backup operation failed: " + ex.getMessage());
    return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
}
```

**Riesgo:** Los mensajes de `IOException` pueden contener rutas de archivos del servidor, configuracion interna, o stack traces. Ejemplo: `"Backup operation failed: File not found: /home/user/backups/scrapyard/backup_2024.sql"`.

**Impacto:** Fuga de rutas del filesystem del servidor.

**Correccion:**
```java
@ExceptionHandler(java.io.IOException.class)
public ResponseEntity<?> handleIOException(java.io.IOException ex) {
    log.error("IO error: {}", ex.getMessage(), ex);
    Map<String, Object> error = new HashMap<>();
    error.put("timestamp", LocalDateTime.now());
    error.put("status", 500);
    error.put("message", "An internal error occurred");
    return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
}
```

---

### 14. Autenticacion Doble en JwtAuthenticationFilter Sin Cache
**Severidad: MEDIUM**

**Archivo:** `JwtAuthenticationFilter.java:50-68`

```java
String userId = jwtUtil.extractUserId(token);
String role = jwtUtil.extractRole(token);

Optional<User> userOpt = userRepo.findById(Long.parseLong(userId));
```

**Riesgo:** Cada peticion autenticada hace:
1. 3 llamadas a `jwtUtil.extract*` (cada una parsea y verifica el token)
2. 1 consulta a la DB para cargar el User completo

Esto significa 3 parsers de JWT + 1 query SQL por cada request. En un sistema con alto trafico, esto degrada el rendimiento significativamente y puede ser explotado para DoS.

**Impacto:** Degradacion de rendimiento; potencial DoS con muchas peticiones concurrentes.

**Correccion:**
1. Extraer claims una sola vez:
```java
Claims claims = Jwts.parser().verifyWith(getSigningKey()).build()
    .parseSignedClaims(token).getPayload();
String userId = claims.getSubject();
String role = claims.get("role", String.class);
```
2. Considerar cache corta de usuarios autenticados (Caffeine con TTL de 1-2 minutos).

---

### 15. JWT Token No Incluye Estado `active` del Usuario
**Severidad: MEDIUM**

**Archivo:** `JwtUtil.java:28-41` y `JwtAuthenticationFilter.java:55`

```java
// JwtUtil
.claim("role", user.getRole().name())
// NO incluye: user.isActive()

// JwtAuthenticationFilter
Optional<User> userOpt = userRepo.findById(Long.parseLong(userId));
if (userOpt.isEmpty() || !userOpt.get().isActive()) {
```

**Riesgo:** El JWT se genera con `isActive=true`, pero si un admin desactiva al usuario, la unica forma de invalidar el token es la consulta a DB en el filtro. Si se elimina esa consulta (para optimizar rendimiento o implementar cache), un usuario desactivado podria seguir accediendo.

**Correccion:** Ya se hace la verificacion en BD, pero para mayor seguridad, incluir `active` como claim en el JWT y verificarlo:
```java
.claim("active", user.isActive())
// En el filtro:
if (!Boolean.TRUE.equals(claims.get("active", Boolean.class))) {
    filterChain.doFilter(request, response);
    return;
}
```

---

### 16. Bypass de Autorizacion en `getCompanyByName` y `getContainersByScrapYard`
**Severidad: MEDIUM**

**Archivos:**
- `CompanyServImpl.java` — metodo `getCompanyByName()` sin filtro de ownership
- `ContainerServImpl.java` — metodo `getContainersByScrapYard()` sin filtro de ownership

**Riesgo:** Un MANAGER puede ver informacion completa de companias y contenedores de otros yards/companies enviando:
- `GET /api/company/search?name=<cualquier_nombre>` — lista todas las companias que coincidan, sin filtro
- `GET /api/container/all-by-yard` con nombre de otro yard — ve todos los contenedores de otro yard

**Impacto:** Violacion de aislamiento de datos entre tenants (companias/yards).

**Correccion:** Agregar filtro de ownership en ambos metodos, similar a los demas metodos del mismo servicio.

---

### 17. Backup: Path Traversal Protegido pero con Risk Residual
**Severidad: MEDIUM**

**Archivos:** `BackupServImpl.java:165-177`, `BackupController.java:42`

```java
Path path = Paths.get(backupProperties.getDir(), filename).normalize();
if (!path.startsWith(Paths.get(backupProperties.getDir()).normalize())) {
    throw new IllegalArgumentException("Invalid filename");
}
```

**Riesgo:** La validacion de path traversal esta correctamente implementada con `normalize()` + `startsWith()`. Sin embargo, el endpoint `GET /api/backup/download/{filename}` permite descargar cualquier backup con nombre predecible (`backup_2024-01-15_120000.zip`). Los nombres siguen un patron temporal predecible.

**Impacto:** Un SUPERADMIN comprometido (o token robado) puede descargar backups completos de la base de datos, que contienen TODOS los datos del sistema.

**Correccion:** Los nombres de archivo ya son predecibles pero el endpoint esta protegido por `hasRole("SUPERADMIN")`. Considerar:
- Agregar tokens de un solo uso para descargas
- Generar nombres aleatorios (UUID) para backups
- No incluir el SQL directamente en el ZIP; encriptar el backup

---

### 18. Backup: `mysqldump` Ejecuta Comando del Sistema
**Severidad: MEDIUM**

**Archivo:** `BackupServImpl.java:505-545`

```java
List<String> command = List.of("mysqldump", ...);
ProcessBuilder pb = new ProcessBuilder(command);
```

**Riesgo:** Si bien el comando esta hardcoded y no recibe input directo del usuario, el uso de `ProcessBuilder` para ejecutar comandos del sistema siempre es un riesgo. Los argumentos `dbUser`, `dbPassword`, `dbHost`, `dbPort` se leen de properties y se pasan como argumentos separados, lo cual mitiga inyeccion de shell.

**Impacto:** Bajo, pero se debe monitorear que no se agregue input del usuario al comando.

**Correccion:** El codigo actual esta correctamente implementado (argumentos separados en `List.of()`). Mantener este patron y nunca concatenar input del usuario en comandos.

---

### 19. `@Autowired` + `final` en Campos (Inyeccion Duplicada)
**Severidad: LOW**

**Archivo:** `AuthController.java:20-24`, `AuthServImpl.java:30-46`

```java
@Autowired
private final IAuthService authService;
```

**Riesgo:** Combinar `@Autowired` en campo con `final` y constructor es redundante y confuso. Spring usara el constructor, no la inyeccion de campo, porque `final` requiere inicializacion por constructor. Pero si alguien quita el constructor, `@Autowired` en campo `final` causara error.

**Correccion:** Usar solo inyeccion por constructor (sin `@Autowired` en campos):
```java
private final IAuthService authService;
// Constructor con @Autowired implícito desde Spring 4.3+
```

---

### 20. Registro: MANAGER Puede Crear SUPERADMIN
**Severidad: LOW**

**Archivo:** `AuthServImpl.java:136-142` y `RegisterRequest.java:31`

```java
user.setRole(request.getRole());
```

**Riesgo:** El campo `role` en `RegisterRequest` acepta cualquier `UserRole`. Aunque el endpoint `register` verifica que el usuario autenticado sea SUPERADMIN (`AuthServImpl.java:95`), la request no valida que un SUPERADMIN no pueda crear otro SUPERADMIN si el `role` es `SUPERADMIN`. Esto es por diseno, pero permite que cualquier SUPERADMIN cree mas SUPERADMINs sin restricciones adicionales.

**Impacto:** Escalacion horizontal entre SUPERADMINs. Probablemente intencional pero vale la pena documentarlo.

---

### 21. Falta de `@EnableMethodSecurity`
**Severidad: LOW**

**Archivo:** `WebSecurityConfig.java:23`

Sin `@EnableMethodSecurity(prePostEnabled = true)` (o `@EnableGlobalMethodSecurity` en versiones anteriores), las anotaciones `@PreAuthorize` no funcionan. Actualmente no se usan, pero es una defensa en profundidad que deberia habilitarse.

**Correccion:**
```java
@EnableMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig {
```

---

### 22. LoginResponse Expone Informacion Innecesaria
**Severidad: LOW**

**Archivo:** `LoginResponse.java`

```java
private Long userId;
private String email;
private String role;
private Long yardId;
private String managerName;
private boolean mustChangePassword;
```

**Riesgo:** `userId` en la respuesta permite enumerar IDs secuenciales. Para la mayoria de casos esto es bajo riesgo, pero en combinacion con otros hallazgos, un atacante puede saber cuantos usuarios hay.

**Correccion:** Considerar usar UUIDs en vez de IDs secuenciales para usuarios.

---

## RESUMEN DE HALLAZGOS

| # | Hallazgo | Severidad | Archivo |
|---|----------|-----------|---------|
| 1 | JWT Secret hardcodeado | **CRITICAL** | `application.properties:17` |
| 2 | Credenciales DB hardcodeadas | **CRITICAL** | `application.properties:6-8` |
| 3 | Password DB en linea de comandos | **CRITICAL** | `BackupServImpl.java:511,554` |
| 4 | Password admin por defecto debil | **HIGH** | `DataInitializer.java:27` |
| 5 | CORS permite origen `*` | **HIGH** | `WebSecurityConfig.java:77` |
| 6 | Swagger UI sin autenticacion | **HIGH** | `WebSecurityConfig.java:42` |
| 7 | `/api/auth/register` con `permitAll()` | **HIGH** | `WebSecurityConfig.java:40` |
| 8 | Rate limiter bypassable via X-Forwarded-For | **HIGH** | `RateLimitFilter.java:76-86` |
| 9 | Rate limiter: memory leak sin cleanup | **MEDIUM** | `RateLimitFilter.java:24-25` |
| 10 | Rate limiter: 5 req/min insuficiente | **MEDIUM** | `RateLimitFilter.java:18-19` |
| 11 | JWT sin revocacion/blacklist | **MEDIUM** | `JwtUtil.java` |
| 12 | Enumeracion de usuarios en login | **MEDIUM** | `AuthServImpl.java:63-67` |
| 13 | Fuga de info en IOException handler | **MEDIUM** | `GlobalExceptionHandler.java:132-138` |
| 14 | Triple parseo JWT por request | **MEDIUM** | `JwtAuthenticationFilter.java:50-51` |
| 15 | JWT no incluye estado `active` | **MEDIUM** | `JwtUtil.java:33` |
| 16 | Bypass de ownership en Company/Container | **MEDIUM** | `CompanyServImpl`, `ContainerServImpl` |
| 17 | Backup: nombres de archivo predecibles | **MEDIUM** | `BackupServImpl.java` |
| 18 | ProcessBuilder para mysqldump | **MEDIUM** | `BackupServImpl.java:505` |
| 19 | `@Autowired` + `final` redundante | **LOW** | `AuthController.java`, `AuthServImpl.java` |
| 20 | SUPERADMIN puede crear SUPERADMIN | **LOW** | `AuthServImpl.java:136` |
| 21 | Falta `@EnableMethodSecurity` | **LOW** | `WebSecurityConfig.java` |
| 22 | IDs secuenciales en LoginResponse | **LOW** | `LoginResponse.java` |
