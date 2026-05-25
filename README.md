# SY Management System

A full-stack Scrap Yard Management System built with **Spring Boot** and **React**. Provides role-based access control for SUPERADMIN and MANAGER users, with complete CRUD operations for companies, scrapyards, containers, customers, invoices, and movements.

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.5-green)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1)

---

## Features

### Authentication & Authorization
- JWT-based authentication with role-based access (SUPERADMIN / MANAGER)
- Password change enforcement for new accounts (`mustChangePassword`)
- Account activation/deactivation by SUPERADMIN
- Rate limiting on login (5 attempts/min, 60s lockout)
- In-memory token for must-change-password flows

### SUPERADMIN Features
- **Dashboard** — Global overview: companies, scrapyards, containers, customers, invoices, movements
- **Companies** — Full CRUD
- **Scrapyards** — Full CRUD with detail view (Containers, Stock, Invoices, Movements, Resume, Reports)
- **Containers** — Full CRUD with company and material filters, yard-based filtering
- **Customers** — Full CRUD
- **Managers** — Tab-based view: Managers (read-only) + User Accounts (full management with edit credentials, activate/deactivate)
- **Invoices** — Full CRUD with yard filter
- **Movements** — Full CRUD with type and yard filters
- **User Management** — Create SUPERADMIN users, edit credentials, activate/deactivate accounts

### MANAGER Features
- **Dashboard** — Yard-scoped overview: containers, customers, invoices, movements
- **Stock** — Yard-specific inventory with tabs: Stock, Invoices, Movements, Resume, Reports
- **Containers** — Yard-filtered container list with material filter
- **Customers** — Company-scoped customer management
- **Invoices** — Yard-filtered invoices (no company filter)
- **Movements** — Yard-filtered movements with type filter (no company filter)
- **Profile** — Update email and password

### Security
- Spring Security with stateless JWT authentication
- BCrypt password hashing
- Role-based endpoint protection (SUPERADMIN-only routes)
- Yard-level data isolation for MANAGER users
- Company-level data isolation for MANAGER users
- Rate limiting (5 login attempts/min, 100 API requests/min per IP)
- Disabled account detection with clear messaging
- Protected routes on frontend (SUPERADMIN-only pages redirect)

### UI/UX
- Glassmorphism login with background image
- Password visibility toggle
- Responsive sidebar with role-based navigation
- Tab-based interfaces for complex views
- Custom UI component library (Button, Input, Select, Modal, ConfirmDialog, Badge, StatCard, etc.)
- PDF report generation (jsPDF + AutoTable)

---

## Tech Stack

### Backend
| Technology | Version |
|---|---|
| Java | 17 |
| Spring Boot | 4.0.5 |
| Spring Security | (managed) |
| Spring Data JPA | (managed) |
| Spring Validation | (managed) |
| MySQL Connector | (managed) |
| JWT (JJWT) | 0.12.6 |
| Lombok | (managed) |
| SpringDoc OpenAPI | 2.8.9 |
| Maven | build |

### Frontend
| Technology | Version |
|---|---|
| React | 18.3.1 |
| React DOM | 18.3.1 |
| React Router DOM | 6.28.0 |
| TypeScript | ~5.6.2 |
| Vite | 5.4.0 |
| TanStack React Query | 5.100.11 |
| Tailwind CSS | 3.4.19 |
| Lucide React | 1.16.0 |
| jsPDF | 4.2.1 |
| jsPDF-AutoTable | 5.0.8 |
| React Hook Form | 7.76.0 |
| Zod | 3.23.0 |

---

## Project Structure

```
management/
├── management/                  # Spring Boot backend
│   ├── src/main/java/com/scrapyard/management/
│   │   ├── Controllers/          # REST controllers
│   │   ├── DTO/                  # Request/Response DTOs
│   │   ├── Exceptions/           # Custom exceptions
│   │   ├── Mapper/               # Entity-DTO mappers
│   │   ├── Models/               # JPA entities & enums
│   │   ├── Repository/           # Spring Data repositories
│   │   ├── SecurityConfig/       # JWT, CORS, rate limiting, data init
│   │   ├── Services/             # Service interfaces & implementations
│   │   └── ManagementApplication.java
│   └── src/main/resources/
│       ├── application.properties
│       └── pic/
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── api/                  # API client & endpoints
│   │   ├── components/           # UI components & layout
│   │   ├── context/              # Auth context
│   │   ├── lib/                  # Utilities
│   │   ├── pages/                # Page components
│   │   ├── routes/               # React Router config
│   │   ├── types/                # TypeScript models
│   │   └── utils/                # PDF generation
│   └── public/
└── README.md
```

---

## Getting Started

### Prerequisites
- **Java 17+**
- **Node.js 18+**
- **MySQL 8.0+**
- **Maven 3.8+**

### 1. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE db_scrapyardm;
```

### 2. Backend Configuration

Edit `management/src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/db_scrapyardm
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}

# JWT
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION:86400000}
```

> **Important:** Use environment variables for secrets in production. Never commit credentials to source control.

### 3. Run the Backend

```bash
cd management
./mvnw spring-boot:run
```

The server starts on `http://localhost:8080`.

A default SUPERADMIN account is created on first startup:
- **Email:** `admin@scrapyard.com`
- **Password:** `admin123`
- **You will be required to change this password on first login.**

### 4. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The app starts on `http://localhost:3000` and proxies API requests to `localhost:8080`.

### 5. API Documentation

Swagger UI is available at: `http://localhost:8080/swagger-ui.html`

> **Note:** In production, disable Swagger by setting `springdoc.swagger-ui.enabled=false`.

---

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/login` | Login | Public |
| POST | `/register` | Register user | SUPERADMIN |
| GET | `/me` | Get current user info | Authenticated |
| PATCH | `/change-password` | Change password | Authenticated |
| PATCH | `/profile` | Update profile | Authenticated |

### Admin Users (`/api/admin/users`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | List all users | SUPERADMIN |
| GET | `/{id}` | Get user by ID | SUPERADMIN |
| PUT | `/{id}` | Update user credentials | SUPERADMIN |
| PATCH | `/{id}/activate` | Activate user | SUPERADMIN |
| PATCH | `/{id}/deactivate` | Deactivate user | SUPERADMIN |

### Companies (`/api/company`)
### Scrapyards (`/api/scrapyard`)
### Containers (`/api/container`)
### Customers (`/api/customer`)
### Invoices (`/api/invoice`)
### Movements (`/api/movement`)
### Managers (`/api/manager`)
### Dashboard (`/api/dashboard`)

> All endpoints except `/api/auth/**` require JWT authentication. Admin endpoints require SUPERADMIN role.

---

## Roles & Permissions

| Feature | SUPERADMIN | MANAGER |
|---|:---:|:---:|
| Dashboard (global) | ✅ | ❌ |
| Dashboard (yard-scoped) | ❌ | ✅ |
| Companies CRUD | ✅ | ❌ |
| Scrapyards CRUD | ✅ | ❌ |
| Scrapyard Detail (all tabs) | ✅ | ❌ |
| Stock Page | ❌ | ✅ |
| Containers (all) | ✅ | ❌ |
| Containers (yard-filtered) | ❌ | ✅ |
| Customers (all) | ✅ | ✅ (company-scoped) |
| Invoices (all) | ✅ | ❌ |
| Invoices (yard-filtered) | ❌ | ✅ |
| Movements (all) | ✅ | ❌ |
| Movements (yard-filtered) | ❌ | ✅ |
| User Management | ✅ | ❌ |
| Profile | ✅ | ✅ |

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DB_USER` | MySQL username | `root` (dev) |
| `DB_PASSWORD` | MySQL password | — |
| `JWT_SECRET` | JWT signing key | (hardcoded for dev) |
| `JWT_EXPIRATION` | Token validity (ms) | `86400000` (24h) |

> **Production:** Always use environment variables for secrets. Rotate the JWT secret and change the default admin password immediately.

---

## License

MIT License

Copyright (c) 2025 SY Management System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
