# FinTrack — Enterprise Architecture Blueprint
**Principal Engineer Review | Production-Grade Personal Finance Platform**

---

## 0. Current Implementation Audit

### What Exists
Single-file HTML SPA with:
- 12 hardcoded transactions in a `let transactions = [...]` array
- Hardcoded budget and goals arrays
- No persistence (page refresh = data loss)
- No auth — anyone with the URL has full access
- No backend, no API, no database
- `window.open()` for "PDF export" (just the browser print dialog)
- Business logic, rendering, and state all in one `<script>` block

### Critical Weaknesses
| Layer | Problem | Risk |
|---|---|---|
| Data | In-memory JS array | Data lost on refresh |
| Auth | None | Full data exposure |
| State | Global `let` vars | Race conditions, no isolation |
| IDs | Sequential integers (`nextId++`) | Collision-prone, enumerable |
| Currency | INR hardcoded in strings | Blocks multi-currency |
| Multi-tenancy | No user concept at all | Cannot scale to multiple users |
| Search | Client-side O(n) loop | Collapses at 10k+ transactions |
| Analytics | In-memory `reduce()` loops | Useless at scale |
| Budget "spent" | Re-computed from raw transaction scan on every render | O(n) per render |
| Error handling | `showToast()` for everything | No retry, no recovery |
| Security | Zero (no CSRF, XSS, input validation) | Fully exploitable |

---

## 1. System Design

### 1.1 High Level Design (HLD)

```
┌────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                              │
│  Next.js 15 (App Router) · TypeScript · Tailwind · Shadcn/ui      │
│  TanStack Query (server state) · Zustand (client state)            │
└────────────────────┬───────────────────────────────────────────────┘
                     │ HTTPS / WebSocket
┌────────────────────▼───────────────────────────────────────────────┐
│                        API GATEWAY LAYER                           │
│  Nginx · Rate Limiting · SSL Termination · Request ID Injection    │
└────────────────────┬───────────────────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────────────────┐
│                       APPLICATION LAYER                            │
│                  NestJS (Modular Monolith → Microservices)         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │  Auth    │ │ Txns     │ │ Budgets  │ │ Goals    │ │Analytics│ │
│  │ Module   │ │ Module   │ │ Module   │ │ Module   │ │ Module  │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ Users    │ │ Reports  │ │ Notifs   │ │ Webhooks │             │
│  │ Module   │ │ Module   │ │ Module   │ │ Module   │             │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
└──────┬─────────────┬──────────────┬─────────────────┬─────────────┘
       │             │              │                 │
┌──────▼──┐  ┌───────▼────┐  ┌─────▼──────┐  ┌──────▼──────┐
│PostgreSQL│  │   Redis    │  │  BullMQ    │  │   AWS S3    │
│(Primary +│  │(Cache +    │  │(Job Queues)│  │(Attachments)│
│Replicas) │  │ Sessions)  │  └────────────┘  └─────────────┘
└──────────┘  └────────────┘
```

### 1.2 Low Level Design (LLD)

#### Request Lifecycle
```
Client → Nginx (rate limit, SSL) → NestJS
  → Guards (JWT verify, RBAC check)
  → Interceptors (logging, transform)
  → Pipes (validation, sanitization)
  → Controller (route handler)
  → Service (business logic)
  → Repository (Prisma ORM)
  → PostgreSQL
  ← Response (transformed DTO)
  ← Interceptor (response envelope)
  ← Cache-Control headers
```

#### CQRS Split
- **Commands** (writes): go through full validation pipeline → primary DB → invalidate cache → emit domain events
- **Queries** (reads): hit Redis first → read replica on miss → populate cache with TTL

---

## 2. Folder Structure

```
fintrack/
├── apps/
│   ├── api/                          # NestJS Backend
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── config/
│   │   │   │   ├── app.config.ts
│   │   │   │   ├── database.config.ts
│   │   │   │   ├── redis.config.ts
│   │   │   │   ├── jwt.config.ts
│   │   │   │   └── s3.config.ts
│   │   │   ├── common/
│   │   │   │   ├── decorators/
│   │   │   │   │   ├── current-user.decorator.ts
│   │   │   │   │   ├── roles.decorator.ts
│   │   │   │   │   └── public.decorator.ts
│   │   │   │   ├── filters/
│   │   │   │   │   ├── global-exception.filter.ts
│   │   │   │   │   └── prisma-exception.filter.ts
│   │   │   │   ├── guards/
│   │   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   │   ├── roles.guard.ts
│   │   │   │   │   └── refresh-token.guard.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   ├── response.interceptor.ts
│   │   │   │   │   ├── logging.interceptor.ts
│   │   │   │   │   └── cache.interceptor.ts
│   │   │   │   ├── pipes/
│   │   │   │   │   ├── validation.pipe.ts
│   │   │   │   │   └── parse-uuid.pipe.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── pagination.dto.ts
│   │   │   │   │   └── api-response.dto.ts
│   │   │   │   └── types/
│   │   │   │       ├── request.type.ts
│   │   │   │       └── jwt-payload.type.ts
│   │   │   ├── database/
│   │   │   │   ├── prisma.service.ts
│   │   │   │   └── prisma.module.ts
│   │   │   ├── cache/
│   │   │   │   ├── redis.service.ts
│   │   │   │   └── redis.module.ts
│   │   │   ├── storage/
│   │   │   │   ├── storage.service.ts
│   │   │   │   └── storage.module.ts
│   │   │   ├── events/
│   │   │   │   ├── events.module.ts
│   │   │   │   ├── transaction.events.ts
│   │   │   │   └── budget.events.ts
│   │   │   └── modules/
│   │   │       ├── auth/
│   │   │       │   ├── auth.module.ts
│   │   │       │   ├── auth.controller.ts
│   │   │       │   ├── auth.service.ts
│   │   │       │   ├── strategies/
│   │   │       │   │   ├── jwt.strategy.ts
│   │   │       │   │   ├── refresh.strategy.ts
│   │   │       │   │   └── google.strategy.ts
│   │   │       │   └── dto/
│   │   │       │       ├── signup.dto.ts
│   │   │       │       ├── login.dto.ts
│   │   │       │       └── token-response.dto.ts
│   │   │       ├── users/
│   │   │       │   ├── users.module.ts
│   │   │       │   ├── users.controller.ts
│   │   │       │   ├── users.service.ts
│   │   │       │   ├── users.repository.ts
│   │   │       │   └── dto/
│   │   │       │       ├── update-profile.dto.ts
│   │   │       │       └── user-response.dto.ts
│   │   │       ├── transactions/
│   │   │       │   ├── transactions.module.ts
│   │   │       │   ├── transactions.controller.ts
│   │   │       │   ├── commands/
│   │   │       │   │   ├── create-transaction.command.ts
│   │   │       │   │   ├── create-transaction.handler.ts
│   │   │       │   │   ├── update-transaction.handler.ts
│   │   │       │   │   └── delete-transaction.handler.ts
│   │   │       │   ├── queries/
│   │   │       │   │   ├── get-transactions.query.ts
│   │   │       │   │   └── get-transactions.handler.ts
│   │   │       │   ├── transactions.repository.ts
│   │   │       │   └── dto/
│   │   │       │       ├── create-transaction.dto.ts
│   │   │       │       ├── update-transaction.dto.ts
│   │   │       │       └── transaction-response.dto.ts
│   │   │       ├── budgets/
│   │   │       ├── goals/
│   │   │       ├── analytics/
│   │   │       ├── reports/
│   │   │       ├── notifications/
│   │   │       └── audit/
│   │   ├── test/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── web/                          # Next.js 15 Frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   ├── (auth)/
│       │   │   │   ├── login/page.tsx
│       │   │   │   ├── signup/page.tsx
│       │   │   │   └── reset-password/page.tsx
│       │   │   └── (dashboard)/
│       │   │       ├── layout.tsx
│       │   │       ├── page.tsx                  # Dashboard
│       │   │       ├── transactions/page.tsx
│       │   │       ├── budgets/page.tsx
│       │   │       ├── goals/page.tsx
│       │   │       ├── analytics/page.tsx
│       │   │       ├── reports/page.tsx
│       │   │       └── settings/page.tsx
│       │   ├── components/
│       │   │   ├── ui/                           # Shadcn base
│       │   │   ├── layout/
│       │   │   │   ├── sidebar.tsx
│       │   │   │   └── topbar.tsx
│       │   │   ├── transactions/
│       │   │   │   ├── transaction-list.tsx
│       │   │   │   ├── transaction-form.tsx
│       │   │   │   └── transaction-row.tsx
│       │   │   ├── budgets/
│       │   │   ├── goals/
│       │   │   ├── analytics/
│       │   │   └── shared/
│       │   │       ├── kpi-card.tsx
│       │   │       ├── currency.tsx
│       │   │       └── empty-state.tsx
│       │   ├── lib/
│       │   │   ├── api/
│       │   │   │   ├── client.ts                 # Axios instance
│       │   │   │   ├── transactions.api.ts
│       │   │   │   ├── budgets.api.ts
│       │   │   │   └── auth.api.ts
│       │   │   ├── hooks/
│       │   │   │   ├── use-transactions.ts
│       │   │   │   ├── use-budgets.ts
│       │   │   │   └── use-analytics.ts
│       │   │   └── utils/
│       │   │       ├── currency.ts
│       │   │       └── date.ts
│       │   └── store/                            # Zustand
│       │       ├── ui.store.ts
│       │       └── auth.store.ts
│       ├── Dockerfile
│       └── package.json
├── packages/
│   └── shared-types/                 # DTOs shared between api + web
│       ├── src/
│       │   ├── transaction.types.ts
│       │   ├── budget.types.ts
│       │   └── user.types.ts
│       └── package.json
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.prod.yml
│   │   └── nginx/
│   │       └── nginx.conf
│   ├── k8s/
│   │   ├── namespace.yaml
│   │   ├── api-deployment.yaml
│   │   ├── web-deployment.yaml
│   │   ├── postgres-statefulset.yaml
│   │   ├── redis-statefulset.yaml
│   │   └── ingress.yaml
│   └── monitoring/
│       ├── prometheus/
│       │   └── prometheus.yml
│       └── grafana/
│           └── dashboards/
│               └── fintrack.json
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
└── turbo.json                        # Turborepo monorepo config
```

---

## 3. PostgreSQL Schema

### ER Diagram Description
- **users** is the root tenant — every other table has a `user_id` FK
- **transactions** is the core fact table, partitioned by `created_at` (monthly range partitions)
- **budget_allocations** holds the budget definitions; **budget_snapshots** holds daily aggregated spend (denormalized for speed)
- **goals** + **goal_contributions** track progress with full audit history
- **analytics_daily** is a materialized summary table refreshed nightly by a BullMQ job
- **audit_logs** captures every mutation for compliance

### Complete Schema (SQL)

```sql
-- ─────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- fuzzy search
CREATE EXTENSION IF NOT EXISTS "btree_gin";   -- composite GIN indexes

-- ─────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────
CREATE TYPE transaction_type AS ENUM ('INCOME','EXPENSE','SAVINGS','INVESTMENT','TRANSFER');
CREATE TYPE budget_period     AS ENUM ('WEEKLY','MONTHLY','CUSTOM');
CREATE TYPE goal_status       AS ENUM ('ACTIVE','PAUSED','COMPLETED','CANCELLED');
CREATE TYPE notification_type AS ENUM ('EMAIL','PUSH','IN_APP');
CREATE TYPE user_role         AS ENUM ('USER','ADMIN','SUPER_ADMIN');

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
CREATE TABLE users (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email             TEXT        NOT NULL UNIQUE,
  email_verified    BOOLEAN     NOT NULL DEFAULT FALSE,
  password_hash     TEXT,                        -- NULL for OAuth users
  name              TEXT        NOT NULL,
  avatar_url        TEXT,
  role              user_role   NOT NULL DEFAULT 'USER',
  currency          CHAR(3)     NOT NULL DEFAULT 'INR',
  timezone          TEXT        NOT NULL DEFAULT 'Asia/Kolkata',
  locale            TEXT        NOT NULL DEFAULT 'en-IN',
  is_active         BOOLEAN     NOT NULL DEFAULT TRUE,
  last_login_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ─────────────────────────────────────────
-- OAUTH ACCOUNTS
-- ─────────────────────────────────────────
CREATE TABLE oauth_accounts (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider        TEXT        NOT NULL,           -- 'google', 'github'
  provider_id     TEXT        NOT NULL,
  access_token    TEXT,
  refresh_token   TEXT,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);

-- ─────────────────────────────────────────
-- REFRESH TOKENS
-- ─────────────────────────────────────────
CREATE TABLE refresh_tokens (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT        NOT NULL UNIQUE,        -- bcrypt hash of actual token
  family      UUID        NOT NULL,               -- rotation family for token theft detection
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user   ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_family ON refresh_tokens(family);

-- ─────────────────────────────────────────
-- CATEGORIES (user-customizable)
-- ─────────────────────────────────────────
CREATE TABLE categories (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        REFERENCES users(id) ON DELETE CASCADE,  -- NULL = system default
  name        TEXT        NOT NULL,
  icon        TEXT        NOT NULL DEFAULT 'fa-tag',
  color       TEXT        NOT NULL DEFAULT '#6366F1',
  type        transaction_type,                   -- NULL = applies to all types
  is_system   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_user ON categories(user_id);

-- ─────────────────────────────────────────
-- TRANSACTIONS (partitioned)
-- ─────────────────────────────────────────
CREATE TABLE transactions (
  id              UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            transaction_type  NOT NULL,
  amount          NUMERIC(15,2)     NOT NULL CHECK (amount > 0),
  currency        CHAR(3)           NOT NULL DEFAULT 'INR',
  amount_inr      NUMERIC(15,2)     NOT NULL,     -- normalized for analytics
  exchange_rate   NUMERIC(10,6)     NOT NULL DEFAULT 1,
  title           TEXT              NOT NULL,
  notes           TEXT,
  category_id     UUID              REFERENCES categories(id) ON DELETE SET NULL,
  subcategory     TEXT,
  payment_method  TEXT,                           -- UPI, Card, Cash, Bank, Wallet
  tags            TEXT[]            NOT NULL DEFAULT '{}',
  attachment_urls TEXT[]            NOT NULL DEFAULT '{}',
  transfer_peer   UUID              REFERENCES transactions(id) ON DELETE SET NULL,
  is_recurring    BOOLEAN           NOT NULL DEFAULT FALSE,
  recurring_id    UUID,
  occurred_at     TIMESTAMPTZ       NOT NULL,
  created_by      UUID              NOT NULL REFERENCES users(id),
  updated_by      UUID              REFERENCES users(id),
  deleted_at      TIMESTAMPTZ,                    -- soft delete
  created_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (occurred_at);

-- Monthly partitions (create programmatically; example below)
CREATE TABLE transactions_2026_01 PARTITION OF transactions
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE transactions_2026_02 PARTITION OF transactions
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
-- ... up to current month + 3 months ahead

-- Indexes on partition parent (inherited by all partitions)
CREATE INDEX idx_txn_user_date        ON transactions(user_id, occurred_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_txn_user_type        ON transactions(user_id, type) WHERE deleted_at IS NULL;
CREATE INDEX idx_txn_user_category    ON transactions(user_id, category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_txn_search           ON transactions USING gin(to_tsvector('english', title || ' ' || COALESCE(notes,'')));
CREATE INDEX idx_txn_tags             ON transactions USING gin(tags);

-- ─────────────────────────────────────────
-- BUDGET ALLOCATIONS
-- ─────────────────────────────────────────
CREATE TABLE budget_allocations (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id     UUID          NOT NULL REFERENCES categories(id),
  period          budget_period NOT NULL DEFAULT 'MONTHLY',
  amount_limit    NUMERIC(15,2) NOT NULL CHECK (amount_limit > 0),
  alert_threshold SMALLINT      NOT NULL DEFAULT 80 CHECK (alert_threshold BETWEEN 1 AND 100),
  period_start    DATE          NOT NULL,
  period_end      DATE          NOT NULL,
  is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, category_id, period_start)
);

CREATE INDEX idx_budget_user_active ON budget_allocations(user_id, is_active, period_start);

-- ─────────────────────────────────────────
-- BUDGET SNAPSHOTS (daily denorm for fast queries)
-- ─────────────────────────────────────────
CREATE TABLE budget_snapshots (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id       UUID          NOT NULL REFERENCES budget_allocations(id) ON DELETE CASCADE,
  user_id         UUID          NOT NULL REFERENCES users(id),
  snapshot_date   DATE          NOT NULL,
  spent           NUMERIC(15,2) NOT NULL DEFAULT 0,
  remaining       NUMERIC(15,2) NOT NULL,
  pct_used        NUMERIC(5,2)  NOT NULL DEFAULT 0,
  alert_sent      BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE(budget_id, snapshot_date)
);

CREATE INDEX idx_budget_snapshot_user_date ON budget_snapshots(user_id, snapshot_date DESC);

-- ─────────────────────────────────────────
-- GOALS
-- ─────────────────────────────────────────
CREATE TABLE goals (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT        NOT NULL,
  description     TEXT,
  icon            TEXT        NOT NULL DEFAULT 'fa-bullseye',
  color           TEXT        NOT NULL DEFAULT '#6366F1',
  target_amount   NUMERIC(15,2) NOT NULL CHECK (target_amount > 0),
  current_amount  NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  target_date     DATE,
  status          goal_status NOT NULL DEFAULT 'ACTIVE',
  category_id     UUID        REFERENCES categories(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE goal_contributions (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id     UUID          NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id     UUID          NOT NULL REFERENCES users(id),
  amount      NUMERIC(15,2) NOT NULL,
  note        TEXT,
  occurred_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_goals_user    ON goals(user_id, status);
CREATE INDEX idx_goal_contribs ON goal_contributions(goal_id, occurred_at DESC);

-- ─────────────────────────────────────────
-- ANALYTICS DAILY (materialized rollup)
-- ─────────────────────────────────────────
CREATE TABLE analytics_daily (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date          DATE          NOT NULL,
  total_income  NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_expense NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_savings NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_invest  NUMERIC(15,2) NOT NULL DEFAULT 0,
  txn_count     INTEGER       NOT NULL DEFAULT 0,
  net_flow      NUMERIC(15,2) GENERATED ALWAYS AS (total_income - total_expense) STORED,
  savings_rate  NUMERIC(5,2)  GENERATED ALWAYS AS (
    CASE WHEN total_income > 0
    THEN ROUND(((total_income - total_expense) / total_income) * 100, 2)
    ELSE 0 END
  ) STORED,
  refreshed_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_analytics_daily_user_date ON analytics_daily(user_id, date DESC);

-- ─────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────
CREATE TABLE notifications (
  id          UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       TEXT              NOT NULL,
  body        TEXT              NOT NULL,
  metadata    JSONB             NOT NULL DEFAULT '{}',
  read_at     TIMESTAMPTZ,
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;

-- ─────────────────────────────────────────
-- AUDIT LOGS
-- ─────────────────────────────────────────
CREATE TABLE audit_logs (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT        NOT NULL,               -- 'transaction.created', 'user.login'
  resource    TEXT        NOT NULL,
  resource_id UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);               -- monthly partitions same as transactions

CREATE INDEX idx_audit_user    ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_resource ON audit_logs(resource, resource_id, created_at DESC);
```

---

## 4. Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions", "partitioning"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [uuidOssp(map: "uuid-ossp"), pgTrgm(map: "pg_trgm")]
}

enum TransactionType {
  INCOME
  EXPENSE
  SAVINGS
  INVESTMENT
  TRANSFER
}

enum BudgetPeriod {
  WEEKLY
  MONTHLY
  CUSTOM
}

enum GoalStatus {
  ACTIVE
  PAUSED
  COMPLETED
  CANCELLED
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}

model User {
  id             String    @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  email          String    @unique
  emailVerified  Boolean   @default(false) @map("email_verified")
  passwordHash   String?   @map("password_hash")
  name           String
  avatarUrl      String?   @map("avatar_url")
  role           UserRole  @default(USER)
  currency       String    @default("INR") @db.Char(3)
  timezone       String    @default("Asia/Kolkata")
  locale         String    @default("en-IN")
  isActive       Boolean   @default(true) @map("is_active")
  lastLoginAt    DateTime? @map("last_login_at") @db.Timestamptz
  createdAt      DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt      DateTime  @updatedAt @map("updated_at") @db.Timestamptz

  oauthAccounts  OauthAccount[]
  refreshTokens  RefreshToken[]
  transactions   Transaction[]  @relation("CreatedBy")
  categories     Category[]
  budgets        BudgetAllocation[]
  goals          Goal[]
  notifications  Notification[]
  auditLogs      AuditLog[]

  @@map("users")
}

model OauthAccount {
  id           String    @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId       String    @map("user_id") @db.Uuid
  provider     String
  providerId   String    @map("provider_id")
  accessToken  String?   @map("access_token")
  refreshToken String?   @map("refresh_token")
  expiresAt    DateTime? @map("expires_at") @db.Timestamptz
  createdAt    DateTime  @default(now()) @map("created_at") @db.Timestamptz

  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerId])
  @@map("oauth_accounts")
}

model RefreshToken {
  id          String    @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId      String    @map("user_id") @db.Uuid
  tokenHash   String    @unique @map("token_hash")
  family      String    @db.Uuid
  expiresAt   DateTime  @map("expires_at") @db.Timestamptz
  revokedAt   DateTime? @map("revoked_at") @db.Timestamptz
  ipAddress   String?   @map("ip_address")
  userAgent   String?   @map("user_agent")
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("refresh_tokens")
}

model Category {
  id        String           @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId    String?          @map("user_id") @db.Uuid
  name      String
  icon      String           @default("fa-tag")
  color     String           @default("#6366F1")
  type      TransactionType?
  isSystem  Boolean          @default(false) @map("is_system")
  createdAt DateTime         @default(now()) @map("created_at") @db.Timestamptz

  user         User?              @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  budgets      BudgetAllocation[]
  goals        Goal[]

  @@map("categories")
}

model Transaction {
  id             String          @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId         String          @map("user_id") @db.Uuid
  type           TransactionType
  amount         Decimal         @db.Decimal(15, 2)
  currency       String          @default("INR") @db.Char(3)
  amountInr      Decimal         @map("amount_inr") @db.Decimal(15, 2)
  exchangeRate   Decimal         @default(1) @map("exchange_rate") @db.Decimal(10, 6)
  title          String
  notes          String?
  categoryId     String?         @map("category_id") @db.Uuid
  subcategory    String?
  paymentMethod  String?         @map("payment_method")
  tags           String[]        @default([])
  attachmentUrls String[]        @default([]) @map("attachment_urls")
  transferPeer   String?         @map("transfer_peer") @db.Uuid
  isRecurring    Boolean         @default(false) @map("is_recurring")
  recurringId    String?         @map("recurring_id") @db.Uuid
  occurredAt     DateTime        @map("occurred_at") @db.Timestamptz
  createdBy      String          @map("created_by") @db.Uuid
  updatedBy      String?         @map("updated_by") @db.Uuid
  deletedAt      DateTime?       @map("deleted_at") @db.Timestamptz
  createdAt      DateTime        @default(now()) @map("created_at") @db.Timestamptz
  updatedAt      DateTime        @updatedAt @map("updated_at") @db.Timestamptz

  user           User            @relation("CreatedBy", fields: [userId], references: [id])
  category       Category?       @relation(fields: [categoryId], references: [id])

  @@index([userId, occurredAt(sort: Desc)])
  @@index([userId, type])
  @@map("transactions")
}

model BudgetAllocation {
  id             String       @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId         String       @map("user_id") @db.Uuid
  categoryId     String       @map("category_id") @db.Uuid
  period         BudgetPeriod @default(MONTHLY)
  amountLimit    Decimal      @map("amount_limit") @db.Decimal(15, 2)
  alertThreshold Int          @default(80) @map("alert_threshold")
  periodStart    DateTime     @map("period_start") @db.Date
  periodEnd      DateTime     @map("period_end") @db.Date
  isActive       Boolean      @default(true) @map("is_active")
  createdAt      DateTime     @default(now()) @map("created_at") @db.Timestamptz
  updatedAt      DateTime     @updatedAt @map("updated_at") @db.Timestamptz

  user           User         @relation(fields: [userId], references: [id])
  category       Category     @relation(fields: [categoryId], references: [id])
  snapshots      BudgetSnapshot[]

  @@unique([userId, categoryId, periodStart])
  @@map("budget_allocations")
}

model BudgetSnapshot {
  id           String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  budgetId     String   @map("budget_id") @db.Uuid
  userId       String   @map("user_id") @db.Uuid
  snapshotDate DateTime @map("snapshot_date") @db.Date
  spent        Decimal  @default(0) @db.Decimal(15, 2)
  remaining    Decimal  @db.Decimal(15, 2)
  pctUsed      Decimal  @default(0) @map("pct_used") @db.Decimal(5, 2)
  alertSent    Boolean  @default(false) @map("alert_sent")
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz

  budget       BudgetAllocation @relation(fields: [budgetId], references: [id], onDelete: Cascade)

  @@unique([budgetId, snapshotDate])
  @@map("budget_snapshots")
}

model Goal {
  id            String     @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId        String     @map("user_id") @db.Uuid
  title         String
  description   String?
  icon          String     @default("fa-bullseye")
  color         String     @default("#6366F1")
  targetAmount  Decimal    @map("target_amount") @db.Decimal(15, 2)
  currentAmount Decimal    @default(0) @map("current_amount") @db.Decimal(15, 2)
  targetDate    DateTime?  @map("target_date") @db.Date
  status        GoalStatus @default(ACTIVE)
  categoryId    String?    @map("category_id") @db.Uuid
  createdAt     DateTime   @default(now()) @map("created_at") @db.Timestamptz
  updatedAt     DateTime   @updatedAt @map("updated_at") @db.Timestamptz

  user          User       @relation(fields: [userId], references: [id])
  category      Category?  @relation(fields: [categoryId], references: [id])
  contributions GoalContribution[]

  @@map("goals")
}

model GoalContribution {
  id         String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  goalId     String   @map("goal_id") @db.Uuid
  userId     String   @map("user_id") @db.Uuid
  amount     Decimal  @db.Decimal(15, 2)
  note       String?
  occurredAt DateTime @default(now()) @map("occurred_at") @db.Timestamptz
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz

  goal       Goal     @relation(fields: [goalId], references: [id], onDelete: Cascade)

  @@map("goal_contributions")
}

model Notification {
  id        String           @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId    String           @map("user_id") @db.Uuid
  type      String
  title     String
  body      String
  metadata  Json             @default("{}")
  readAt    DateTime?        @map("read_at") @db.Timestamptz
  sentAt    DateTime?        @map("sent_at") @db.Timestamptz
  createdAt DateTime         @default(now()) @map("created_at") @db.Timestamptz

  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
}

model AuditLog {
  id         String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId     String?  @map("user_id") @db.Uuid
  action     String
  resource   String
  resourceId String?  @map("resource_id") @db.Uuid
  oldData    Json?    @map("old_data")
  newData    Json?    @map("new_data")
  ipAddress  String?  @map("ip_address")
  userAgent  String?  @map("user_agent")
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz

  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@map("audit_logs")
}
```

---

## 5. NestJS Architecture

### Core Module Wiring

```typescript
// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envValidationSchema }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ([{
        ttl:   cfg.get('THROTTLE_TTL', 60000),
        limit: cfg.get('THROTTLE_LIMIT', 100),
      }]),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        connection: { host: cfg.get('REDIS_HOST'), port: cfg.get('REDIS_PORT') },
      }),
    }),
    PrismaModule,
    RedisModule,
    EventEmitterModule.forRoot(),
    AuthModule,
    UsersModule,
    TransactionsModule,
    BudgetsModule,
    GoalsModule,
    AnalyticsModule,
    ReportsModule,
    NotificationsModule,
    AuditModule,
  ],
  providers: [
    { provide: APP_GUARD,       useClass: JwtAuthGuard },
    { provide: APP_GUARD,       useClass: RolesGuard },
    { provide: APP_GUARD,       useClass: ThrottlerGuard },
    { provide: APP_FILTER,      useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_PIPE,        useClass: ValidationPipe },
  ],
})
export class AppModule {}
```

### Response Envelope Interceptor

```typescript
// common/interceptors/response.interceptor.ts
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const req = ctx.switchToHttp().getRequest();
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        meta: {
          requestId: req.headers['x-request-id'],
          timestamp: new Date().toISOString(),
          version:   'v1',
        },
      })),
    );
  }
}
```

### Global Exception Filter

```typescript
// common/filters/global-exception.filter.ts
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx  = host.switchToHttp();
    const req  = ctx.getRequest<Request>();
    const res  = ctx.getResponse<Response>();

    let status  = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code    = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status  = exception.getStatus();
      const r = exception.getResponse() as any;
      message = r.message || exception.message;
      code    = r.code || 'HTTP_ERROR';
    } else if (exception instanceof PrismaClientKnownRequestError) {
      ({ status, message, code } = this.handlePrismaError(exception));
    }

    this.logger.error({
      requestId: req.headers['x-request-id'],
      method:    req.method,
      path:      req.path,
      userId:    req['user']?.id,
      status,
      code,
      message,
      stack:     exception instanceof Error ? exception.stack : undefined,
    });

    res.status(status).json({
      success:   false,
      error:     { code, message },
      meta:      { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() },
    });
  }

  private handlePrismaError(e: PrismaClientKnownRequestError) {
    if (e.code === 'P2002') return { status: 409, message: 'Resource already exists', code: 'CONFLICT' };
    if (e.code === 'P2025') return { status: 404, message: 'Resource not found',       code: 'NOT_FOUND' };
    return { status: 500, message: 'Database error', code: 'DB_ERROR' };
  }
}
```

### Transaction Repository

```typescript
// modules/transactions/transactions.repository.ts
@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateTransactionDto): Promise<Transaction> {
    return this.prisma.transaction.create({
      data: {
        ...data,
        userId,
        createdBy: userId,
        amountInr: data.amount, // simplified; real impl calls exchange rate service
      },
      include: { category: true },
    });
  }

  async findMany(userId: string, filters: GetTransactionsQuery): Promise<PaginatedResult<Transaction>> {
    const where: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null,
      ...(filters.type        && { type: filters.type }),
      ...(filters.categoryId  && { categoryId: filters.categoryId }),
      ...(filters.from        && { occurredAt: { gte: new Date(filters.from) } }),
      ...(filters.to          && { occurredAt: { ...existing, lte: new Date(filters.to) } }),
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { notes: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { occurredAt: 'desc' },
        skip:    (filters.page - 1) * filters.limit,
        take:    filters.limit,
      }),
    ]);

    return { items, total, page: filters.page, limit: filters.limit, pages: Math.ceil(total / filters.limit) };
  }

  async softDelete(userId: string, id: string): Promise<void> {
    await this.prisma.transaction.updateMany({
      where: { id, userId, deletedAt: null },
      data:  { deletedAt: new Date() },
    });
  }
}
```

### BullMQ Jobs

```typescript
// modules/analytics/analytics.processor.ts
@Processor('analytics')
export class AnalyticsProcessor {
  constructor(private readonly prisma: PrismaService) {}

  @Process('refresh-daily')
  async refreshDailyAnalytics(job: Job<{ userId: string; date: string }>) {
    const { userId, date } = job.data;
    const start = new Date(date);
    const end   = new Date(date);
    end.setDate(end.getDate() + 1);

    const [income, expense, savings, invest, txnCount] = await Promise.all([
      this.sumByType(userId, 'INCOME',     start, end),
      this.sumByType(userId, 'EXPENSE',    start, end),
      this.sumByType(userId, 'SAVINGS',    start, end),
      this.sumByType(userId, 'INVESTMENT', start, end),
      this.prisma.transaction.count({ where: { userId, occurredAt: { gte: start, lt: end }, deletedAt: null } }),
    ]);

    await this.prisma.analyticsDaily.upsert({
      where:  { userId_date: { userId, date: start } },
      create: { userId, date: start, totalIncome: income, totalExpense: expense, totalSavings: savings, totalInvest: invest, txnCount },
      update: { totalIncome: income, totalExpense: expense, totalSavings: savings, totalInvest: invest, txnCount, refreshedAt: new Date() },
    });
  }

  private async sumByType(userId: string, type: TransactionType, from: Date, to: Date): Promise<number> {
    const result = await this.prisma.transaction.aggregate({
      where:  { userId, type, occurredAt: { gte: from, lt: to }, deletedAt: null },
      _sum:   { amountInr: true },
    });
    return result._sum.amountInr?.toNumber() ?? 0;
  }
}
```

---

## 6. API Specifications

### Versioning Strategy
All routes under `/api/v1/`. Breaking changes → `/api/v2/`. Header `Deprecation: true` on sunset routes.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | Register new user |
| POST | `/api/v1/auth/login` | Email/password login |
| POST | `/api/v1/auth/logout` | Revoke refresh token |
| POST | `/api/v1/auth/refresh` | Exchange refresh token |
| POST | `/api/v1/auth/forgot-password` | Send reset email |
| POST | `/api/v1/auth/reset-password` | Confirm reset with token |
| GET  | `/api/v1/auth/google` | OAuth redirect |
| GET  | `/api/v1/auth/google/callback` | OAuth callback |

**POST /api/v1/auth/signup**
```typescript
// Request DTO
class SignupDto {
  @IsEmail()                   email: string;
  @MinLength(8) @Matches(/(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/)
                               password: string;
  @IsString() @MaxLength(100)  name: string;
}

// Response DTO
class AuthResponseDto {
  user:         UserDto;
  accessToken:  string;  // 15min JWT
  refreshToken: string;  // 30-day opaque token, httpOnly cookie
  expiresIn:    number;
}
```

**POST /api/v1/auth/login**
```typescript
class LoginDto {
  @IsEmail()              email: string;
  @IsString()             password: string;
  @IsOptional() @IsBoolean() rememberMe?: boolean;
}
```

### Transactions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET    | `/api/v1/transactions` | JWT | List with filters + pagination |
| POST   | `/api/v1/transactions` | JWT | Create transaction |
| GET    | `/api/v1/transactions/:id` | JWT | Get single |
| PATCH  | `/api/v1/transactions/:id` | JWT | Update |
| DELETE | `/api/v1/transactions/:id` | JWT | Soft delete |
| POST   | `/api/v1/transactions/:id/attachments` | JWT | Upload receipt |
| GET    | `/api/v1/transactions/export` | JWT | CSV export |

**GET /api/v1/transactions**
```typescript
class GetTransactionsQuery {
  @IsOptional() @IsEnum(TransactionType) type?: TransactionType;
  @IsOptional() @IsUUID()                categoryId?: string;
  @IsOptional() @IsDateString()          from?: string;
  @IsOptional() @IsDateString()          to?: string;
  @IsOptional() @IsString() @MaxLength(100) search?: string;
  @IsOptional() @IsArray()               tags?: string[];
  @IsOptional() @IsString()              paymentMethod?: string;
  @IsOptional() @Min(1) @Type(()=>Number) page: number = 1;
  @IsOptional() @Min(1) @Max(100) @Type(()=>Number) limit: number = 20;
  @IsOptional() @IsEnum(['occurredAt','amount','title']) sortBy: string = 'occurredAt';
  @IsOptional() @IsEnum(['asc','desc'])                 sortDir: string = 'desc';
}

class TransactionResponseDto {
  id:            string;
  type:          TransactionType;
  amount:        number;
  currency:      string;
  title:         string;
  notes?:        string;
  category?:     CategoryDto;
  paymentMethod?: string;
  tags:          string[];
  attachmentUrls: string[];
  occurredAt:    string;
  createdAt:     string;
}
```

**POST /api/v1/transactions**
```typescript
class CreateTransactionDto {
  @IsEnum(TransactionType)              type: TransactionType;
  @IsNumber() @Min(0.01)                amount: number;
  @IsString() @Length(3,3)              currency: string;
  @IsString() @MinLength(1) @MaxLength(200) title: string;
  @IsOptional() @IsString() @MaxLength(1000) notes?: string;
  @IsOptional() @IsUUID()               categoryId?: string;
  @IsOptional() @IsString()             subcategory?: string;
  @IsOptional() @IsString()             paymentMethod?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsDateString()                       occurredAt: string;
}
```

### Budgets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/budgets` | List budgets for current period |
| POST   | `/api/v1/budgets` | Create budget |
| PATCH  | `/api/v1/budgets/:id` | Update budget |
| DELETE | `/api/v1/budgets/:id` | Delete budget |
| GET    | `/api/v1/budgets/:id/history` | Budget history |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/analytics/summary` | Period summary (KPIs) |
| GET    | `/api/v1/analytics/trend` | Daily spending trend |
| GET    | `/api/v1/analytics/categories` | Category breakdown |
| GET    | `/api/v1/analytics/monthly` | Month-over-month |
| GET    | `/api/v1/analytics/savings-rate` | Savings rate history |

**Optimized Analytics SQL Queries:**

```sql
-- Monthly summary (uses analytics_daily materialized table — O(days) not O(transactions))
SELECT
  DATE_TRUNC('month', date) AS month,
  SUM(total_income)         AS income,
  SUM(total_expense)        AS expense,
  SUM(total_savings)        AS savings,
  SUM(total_invest)         AS investments,
  SUM(txn_count)            AS transaction_count,
  ROUND(AVG(savings_rate), 2) AS avg_savings_rate
FROM analytics_daily
WHERE user_id = $1
  AND date >= DATE_TRUNC('year', NOW())
GROUP BY 1
ORDER BY 1;

-- Category breakdown (current month — indexed scan)
SELECT
  c.name                                AS category,
  c.color,
  SUM(t.amount_inr)                     AS total,
  COUNT(*)                              AS txn_count,
  ROUND(SUM(t.amount_inr) * 100.0 /
    NULLIF(SUM(SUM(t.amount_inr)) OVER (), 0), 2) AS pct
FROM transactions t
JOIN categories   c ON c.id = t.category_id
WHERE t.user_id    = $1
  AND t.type       = 'EXPENSE'
  AND t.deleted_at IS NULL
  AND t.occurred_at >= DATE_TRUNC('month', NOW())
  AND t.occurred_at <  DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
GROUP BY c.id, c.name, c.color
ORDER BY total DESC
LIMIT 10;

-- Budget utilization (uses snapshot table — single row lookup per budget)
SELECT
  b.id,
  c.name      AS category,
  b.amount_limit,
  s.spent,
  s.remaining,
  s.pct_used,
  b.alert_threshold
FROM budget_allocations b
JOIN categories         c ON c.id = b.category_id
LEFT JOIN LATERAL (
  SELECT spent, remaining, pct_used
  FROM budget_snapshots
  WHERE budget_id   = b.id
  ORDER BY snapshot_date DESC
  LIMIT 1
) s ON TRUE
WHERE b.user_id  = $1
  AND b.is_active = TRUE
  AND b.period_start <= CURRENT_DATE
  AND b.period_end   >= CURRENT_DATE;
```

---

## 7. Security Architecture

### JWT Strategy
```
Access Token:  RS256, 15 min TTL, { sub, email, role, jti }
Refresh Token: Opaque 64-byte random hex, hashed with bcrypt before storage
               → httpOnly, Secure, SameSite=Strict cookie
               → Token family rotation (reuse of old token = entire family revoked)
```

### Rate Limiting (NestJS + Redis)
```typescript
// Per-endpoint throttling via decorator
@Throttle({ default: { limit: 5, ttl: 60000 } })  // 5 req/min for auth endpoints
@Post('login')
login(@Body() dto: LoginDto) {}

// Global: 100 req/min per IP via ThrottlerModule
// Burst: 20 req/s via Nginx
```

### RBAC
```typescript
// roles.decorator.ts
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      ctx.getHandler(), ctx.getClass(),
    ]);
    if (!required) return true;
    const { user } = ctx.switchToHttp().getRequest();
    return required.some((r) => user.role === r);
  }
}
```

### Input Validation
- All DTOs use `class-validator` decorators
- `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` globally applied
- Strips unknown properties before they reach business logic

### SQL Injection Protection
- 100% Prisma ORM — zero raw SQL in application code
- The few raw SQL queries in analytics use parameterized `$1, $2` placeholders via `prisma.$queryRaw`

### XSS Protection
- All user content sanitized with `xss` library before storage
- `Content-Security-Policy` header set via Helmet
- Frontend: `dangerouslySetInnerHTML` banned in ESLint config

### Headers (Helmet)
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'nonce-{nonce}'"],
      styleSrc:    ["'self'", "'unsafe-inline'"],
      imgSrc:      ["'self'", "data:", "https://*.amazonaws.com"],
      connectSrc:  ["'self'", "https://api.fintrack.app"],
    },
  },
  hsts:               { maxAge: 31536000, includeSubDomains: true },
  noSniff:            true,
  referrerPolicy:     { policy: 'strict-origin-when-cross-origin' },
}));
```

### Audit Logging
```typescript
// Every mutation auto-logged via AuditInterceptor
// Data flow: Controller → Service → Repository → emit('audit.log', payload) → AuditService (async)
// Stored in audit_logs with old_data + new_data JSONB diff
```

### Encryption at Rest
- PostgreSQL column-level encryption for `password_hash` (bcrypt, cost 12)
- `refresh_token.token_hash` → bcrypt
- S3 attachment storage → AES-256-SSE
- DB volume encryption → AWS EBS encryption

---

## 8. Scalability Design

### Database Scaling (1M users, 100M transactions)

```
Phase 1 (0–50k users):    Single PostgreSQL primary, 1 read replica
Phase 2 (50k–500k users): Primary + 2 read replicas, PgBouncer connection pooling
Phase 3 (500k–1M users):  Citus horizontal sharding by user_id, 3 primary shards
```

**Connection Pooling:**
```
NestJS (Prisma) → PgBouncer (transaction mode, 100 pool per shard) → PostgreSQL
Max connections: PostgreSQL default 200 → Prisma sees 100 connections via PgBouncer
```

**Read/Write Split:**
```typescript
// prisma.service.ts
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } }  // primary (writes)
});
const prismaReplica = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_REPLICA_URL } }  // replica (reads)
});

// Repositories inject PrismaService which internally routes
// Queries → replica, Mutations → primary
```

### Caching Strategy (Redis)

```
┌─────────────────────────────────────────────────────┐
│                   Cache Layers                       │
│                                                      │
│  L1: In-process memory (5s TTL, 1000 items max)     │
│  L2: Redis Cluster (configurable TTL per resource)  │
│  L3: PostgreSQL (source of truth)                   │
│                                                      │
│  Cache Keys:                                         │
│  user:{userId}                        TTL: 5min      │
│  analytics:summary:{userId}:{period}  TTL: 15min     │
│  categories:system                    TTL: 1hr       │
│  budgets:active:{userId}              TTL: 5min      │
│  txn:list:{userId}:{hash(filters)}    TTL: 2min      │
└─────────────────────────────────────────────────────┘
```

**Cache Invalidation:**
```typescript
// On transaction create/update/delete:
await redis.del(`analytics:summary:${userId}:*`);  // SCAN + DEL pattern
await redis.del(`txn:list:${userId}:*`);
// Budget snapshots updated async via BullMQ job
```

### Queue Processing (BullMQ)

```
Queues:
  analytics        - refresh-daily (triggered by transaction mutations)
  notifications    - send-email, send-push, send-in-app
  reports          - generate-pdf, generate-csv
  budget-alerts    - check-threshold (runs after every expense transaction)
  recurring        - process-recurring-transactions (daily cron)
  cleanup          - purge-soft-deleted (weekly cron), rotate-partitions (monthly)

Concurrency:
  analytics:     4 workers
  notifications: 8 workers
  reports:       2 workers (CPU intensive)
  budget-alerts: 4 workers
```

### Event-Driven Components

```typescript
// On transaction.created event:
@OnEvent('transaction.created')
async handleTransactionCreated(payload: TransactionCreatedEvent) {
  await Promise.all([
    this.analyticsQueue.add('refresh-daily', { userId: payload.userId, date: payload.date }),
    this.budgetQueue.add('check-threshold', { userId: payload.userId, categoryId: payload.categoryId }),
  ]);
}
```

---

## 9. Observability

### Structured Logging (Winston + OpenTelemetry)
```typescript
// Every log includes:
{
  timestamp:  ISO8601,
  level:      'info' | 'warn' | 'error',
  requestId:  string,   // UUID per request, injected by Nginx
  userId:     string | null,
  service:    'fintrack-api',
  version:    '1.0.0',
  traceId:    string,   // OpenTelemetry trace ID
  spanId:     string,
  message:    string,
  ...context
}
```

### Metrics (Prometheus)
```
fintrack_http_requests_total{method, path, status}
fintrack_http_duration_seconds{method, path, quantile}
fintrack_transactions_created_total{type, currency}
fintrack_cache_hits_total{cache, key_pattern}
fintrack_cache_misses_total{cache, key_pattern}
fintrack_queue_jobs_total{queue, status}
fintrack_queue_duration_seconds{queue}
fintrack_db_query_duration_seconds{operation, model}
```

### Alerting Rules (Prometheus AlertManager)
```yaml
groups:
  - name: fintrack
    rules:
      - alert: HighErrorRate
        expr: rate(fintrack_http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 2m
        annotations:
          summary: "Error rate above 5%"

      - alert: SlowQueries
        expr: histogram_quantile(0.95, fintrack_db_query_duration_seconds) > 0.5
        for: 5m
        annotations:
          summary: "P95 DB query > 500ms"

      - alert: QueueBacklog
        expr: sum(fintrack_queue_jobs_total{status="waiting"}) > 1000
        for: 5m
        annotations:
          summary: "Queue backlog > 1000 jobs"
```

---

## 10. Testing Strategy

### Unit Tests (Jest)
```
Target: Services, Repositories, Utilities
Coverage: 90%+ branch coverage
Mocking: jest.mock() for Prisma, Redis
Pattern: AAA (Arrange, Act, Assert)

Example:
describe('TransactionsService', () => {
  it('should throw when transaction does not belong to user', async () => {
    repo.findOne.mockResolvedValue({ userId: 'other-user' });
    await expect(service.delete('my-user', 'txn-id')).rejects.toThrow(ForbiddenException);
  });
});
```

### Integration Tests (Jest + Supertest + TestContainers)
```
Spins up real PostgreSQL + Redis containers per test suite
Tests full HTTP request → DB → response cycle
Covers: auth flows, transaction CRUD, budget calculations
```

### E2E Tests (Playwright)
```
Critical user journeys:
  - Sign up → verify email → login
  - Add income transaction → see dashboard update
  - Set budget → add expense → receive alert
  - Export CSV report
```

### Load Tests (k6)
```javascript
// load-test.js
export const options = {
  stages: [
    { duration: '2m', target: 100  },  // ramp to 100 VU
    { duration: '5m', target: 1000 },  // ramp to 1000 VU
    { duration: '2m', target: 0    },  // ramp down
  ],
  thresholds: {
    http_req_duration:           ['p(95)<500'],
    http_req_failed:             ['rate<0.01'],
    'http_req_duration{path:/api/v1/transactions}': ['p(99)<1000'],
  },
};
```

---

## 11. Docker Setup

```yaml
# docker-compose.yml
version: '3.9'
services:
  api:
    build:
      context: ./apps/api
      target:  production
    environment:
      DATABASE_URL:         postgres://fintrack:${DB_PASS}@postgres:5432/fintrack
      DATABASE_REPLICA_URL: postgres://fintrack:${DB_PASS}@postgres-replica:5432/fintrack
      REDIS_HOST:           redis
      REDIS_PORT:           6379
      JWT_PRIVATE_KEY:      ${JWT_PRIVATE_KEY}
      JWT_PUBLIC_KEY:       ${JWT_PUBLIC_KEY}
    depends_on:
      postgres: { condition: service_healthy }
      redis:    { condition: service_healthy }
    ports: ["3001:3001"]
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout:  10s
      retries:  3

  web:
    build:
      context: ./apps/web
      target:  production
    environment:
      NEXT_PUBLIC_API_URL: http://api:3001
    ports: ["3000:3000"]
    depends_on: [api]
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB:       fintrack
      POSTGRES_USER:     fintrack
      POSTGRES_PASSWORD: ${DB_PASS}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infrastructure/docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fintrack"]
      interval: 10s
      timeout:  5s
      retries:  5
    ports: ["5432:5432"]

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASS}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
    ports: ["6379:6379"]

  nginx:
    image: nginx:alpine
    volumes:
      - ./infrastructure/docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on: [api, web]

volumes:
  postgres_data:
  redis_data:
```

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
RUN pnpm build

FROM base AS production
ENV NODE_ENV=production
COPY --from=builder /app/dist       ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma     ./prisma
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

---

## 12. CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:    { branches: [main, develop] }
  pull_request: { branches: [main] }

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:unit --coverage
      - uses: codecov/codecov-action@v4

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:  { POSTGRES_DB: fintrack_test, POSTGRES_USER: test, POSTGRES_PASSWORD: test }
        options: --health-cmd pg_isready
      redis:
        image: redis:7-alpine
        options: --health-cmd "redis-cli ping"
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm prisma migrate deploy
        env:  { DATABASE_URL: postgresql://test:test@localhost:5432/fintrack_test }
      - run: pnpm test:integration

  build-and-push:
    needs: [lint-and-type-check, unit-tests, integration-tests]
    if:   github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with: { registry: ghcr.io, username: ${{ github.actor }}, password: ${{ secrets.GITHUB_TOKEN }} }
      - uses: docker/build-push-action@v5
        with:
          context: ./apps/api
          push:    true
          tags:    ghcr.io/${{ github.repository }}/api:${{ github.sha }},ghcr.io/${{ github.repository }}/api:latest
          cache-from: type=gha
          cache-to:   type=gha,mode=max

  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: azure/k8s-set-context@v3
        with: { kubeconfig: ${{ secrets.KUBE_CONFIG_STAGING }} }
      - run: |
          kubectl set image deployment/fintrack-api api=ghcr.io/${{ github.repository }}/api:${{ github.sha }}
          kubectl rollout status deployment/fintrack-api --timeout=5m
```

---

## 13. Infrastructure Diagrams (Mermaid)

### High Level Infrastructure

```mermaid
graph TB
    subgraph Internet
        U[Users / Mobile Apps]
        CDN[CloudFront CDN]
    end

    subgraph Cloud["AWS / GCP Region"]
        subgraph Edge
            LB[Load Balancer]
            WAF[WAF + DDoS Shield]
        end

        subgraph AppLayer["Application Layer (K8s)"]
            W1[Web Pod 1\nNext.js]
            W2[Web Pod 2\nNext.js]
            A1[API Pod 1\nNestJS]
            A2[API Pod 2\nNestJS]
            A3[API Pod 3\nNestJS]
            WK[Worker Pods\nBullMQ]
        end

        subgraph DataLayer["Data Layer"]
            PG_P[(PostgreSQL\nPrimary)]
            PG_R1[(PostgreSQL\nReplica 1)]
            PG_R2[(PostgreSQL\nReplica 2)]
            RD[(Redis\nCluster)]
            S3[(S3\nAttachments)]
        end

        subgraph Observability
            PROM[Prometheus]
            GRAF[Grafana]
            LOKI[Loki\nLog Aggregation]
        end
    end

    U --> CDN --> WAF --> LB
    LB --> W1 & W2
    LB --> A1 & A2 & A3
    A1 & A2 & A3 --> PG_P
    A1 & A2 & A3 --> PG_R1 & PG_R2
    A1 & A2 & A3 --> RD
    A1 & A2 & A3 --> S3
    WK --> PG_P & RD
    A1 & A2 & A3 --> PROM
    PROM --> GRAF
```

### Database ER Diagram

```mermaid
erDiagram
    users {
        uuid id PK
        text email UK
        text name
        char currency
        text timezone
        user_role role
        timestamptz created_at
    }
    oauth_accounts {
        uuid id PK
        uuid user_id FK
        text provider
        text provider_id
    }
    refresh_tokens {
        uuid id PK
        uuid user_id FK
        text token_hash UK
        uuid family
        timestamptz expires_at
    }
    categories {
        uuid id PK
        uuid user_id FK
        text name
        text icon
        text color
        transaction_type type
    }
    transactions {
        uuid id PK
        uuid user_id FK
        uuid category_id FK
        transaction_type type
        numeric amount
        text title
        text payment_method
        text[] tags
        timestamptz occurred_at
    }
    budget_allocations {
        uuid id PK
        uuid user_id FK
        uuid category_id FK
        budget_period period
        numeric amount_limit
        smallint alert_threshold
        date period_start
        date period_end
    }
    budget_snapshots {
        uuid id PK
        uuid budget_id FK
        date snapshot_date
        numeric spent
        numeric pct_used
    }
    goals {
        uuid id PK
        uuid user_id FK
        text title
        numeric target_amount
        numeric current_amount
        goal_status status
        date target_date
    }
    goal_contributions {
        uuid id PK
        uuid goal_id FK
        numeric amount
        timestamptz occurred_at
    }
    analytics_daily {
        uuid id PK
        uuid user_id FK
        date date
        numeric total_income
        numeric total_expense
        numeric savings_rate
    }
    audit_logs {
        uuid id PK
        uuid user_id FK
        text action
        text resource
        jsonb old_data
        jsonb new_data
    }

    users ||--o{ oauth_accounts : "has"
    users ||--o{ refresh_tokens : "has"
    users ||--o{ categories : "creates"
    users ||--o{ transactions : "creates"
    users ||--o{ budget_allocations : "sets"
    users ||--o{ goals : "sets"
    users ||--o{ analytics_daily : "summarized_in"
    users ||--o{ audit_logs : "tracked_in"
    categories ||--o{ transactions : "categorizes"
    categories ||--o{ budget_allocations : "allocated_to"
    budget_allocations ||--o{ budget_snapshots : "snapshotted_in"
    goals ||--o{ goal_contributions : "funded_by"
```

### Sequence Diagram: Transaction Creation

```mermaid
sequenceDiagram
    participant C as Client
    participant N as Nginx
    participant A as API (NestJS)
    participant R as Redis
    participant PG as PostgreSQL (Primary)
    participant Q as BullMQ
    participant W as Worker

    C->>N: POST /api/v1/transactions (JWT)
    N->>A: forward + inject X-Request-ID
    A->>A: JwtAuthGuard.verify()
    A->>A: ValidationPipe.transform(dto)
    A->>A: CreateTransactionHandler.execute()
    A->>PG: INSERT INTO transactions ...
    PG-->>A: transaction row
    A->>R: DEL txn:list:{userId}:*
    A->>R: DEL analytics:summary:{userId}:*
    A->>Q: analytics.add('refresh-daily', {userId, date})
    A->>Q: budget-alerts.add('check-threshold', {userId, categoryId})
    A->>A: AuditLog.emit('transaction.created')
    A-->>C: 201 { data: TransactionDto }
    Q->>W: process refresh-daily
    W->>PG: UPSERT analytics_daily
    Q->>W: process check-threshold
    W->>PG: UPDATE budget_snapshots
    W->>Q: notifications.add('budget-alert') [if threshold exceeded]
```

---

## 14. Migration Plan: Prototype → Production

### Phase 0 — Foundation (Week 1–2)
- [ ] Init Turborepo monorepo (pnpm workspaces)
- [ ] Scaffold NestJS app with all modules as stubs
- [ ] Scaffold Next.js 15 app with App Router
- [ ] Set up Docker Compose (Postgres, Redis, Nginx)
- [ ] Implement Prisma schema, run first migration
- [ ] Implement Auth module (JWT + refresh tokens)
- [ ] Implement Users module
- [ ] CI pipeline: lint + type-check + unit tests

### Phase 1 — Core CRUD (Week 3–4)
- [ ] Transactions module: CRUD + pagination + search
- [ ] Categories module: system defaults + user custom
- [ ] Budgets module: CRUD + live spent calculation
- [ ] Goals module: CRUD + contribution tracking
- [ ] Wire TanStack Query on frontend for all above
- [ ] Replace Zustand globals with per-resource hooks
- [ ] Add Zod validation on frontend forms
- [ ] Integration tests for all modules

### Phase 2 — Analytics & Jobs (Week 5–6)
- [ ] BullMQ setup: analytics refresh, budget alert jobs
- [ ] Analytics module: daily rollup, category breakdown, trend
- [ ] Budget snapshot worker
- [ ] Notifications module: in-app + email (Resend)
- [ ] S3 attachment upload (receipt photos)
- [ ] Reports module: CSV export, PDF generation (Puppeteer)
- [ ] Load tests with k6

### Phase 3 — Auth Hardening & OAuth (Week 7)
- [ ] Google OAuth (Passport.js strategy)
- [ ] Email verification flow
- [ ] Password reset flow
- [ ] Rate limiting per endpoint
- [ ] Audit log module
- [ ] Security headers (Helmet)
- [ ] RBAC implementation

### Phase 4 — Observability & Production (Week 8)
- [ ] OpenTelemetry instrumentation
- [ ] Prometheus metrics endpoint
- [ ] Grafana dashboards
- [ ] Structured logging (Winston → Loki)
- [ ] Kubernetes manifests (Deployments, Services, HPA)
- [ ] CD pipeline: staging auto-deploy, prod manual approval
- [ ] Secrets management (Doppler / AWS Secrets Manager)
- [ ] Runbook and incident response docs

---

## 15. Key Implementation Notes

### Why Modular Monolith, Not Microservices
At 0 → 1M users, a distributed system adds network latency, distributed transactions complexity, and ops overhead with zero benefit. The NestJS modular architecture uses the same boundaries that would become service cuts in a microservices migration — modules are fully decoupled via interfaces and event emitters. When/if you need to split: `analytics` and `reports` are the first candidates (CPU intensive, tolerate eventual consistency).

### Partition Maintenance
Write a monthly cron job (BullMQ) that:
1. Creates next month's partition for `transactions` and `audit_logs`
2. Drops partitions older than 7 years (regulatory retention limit)
3. `VACUUM ANALYZE` on old partitions

### The Budget "Spent" Problem
The original prototype recomputed `spent` by scanning all transactions on every render. The production design has two read paths:
- **Real-time budget check** (needed for alerts): raw SQL against `transactions` partition with index on `(user_id, type, occurred_at)`
- **Dashboard display**: read from `budget_snapshots` (single row per budget per day, updated by worker)

### Currency Handling
Never store amounts as floats. Use `NUMERIC(15,2)` in Postgres. Store both `amount` (original currency) and `amount_inr` (normalized to user's base currency via exchange rate at transaction time) to enable cross-currency analytics without re-fetching rates.
