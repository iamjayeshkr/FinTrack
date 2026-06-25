# FinTrack — Enterprise Wealth OS & Personal Finance Command Center

FinTrack is a private, client-first, high-fidelity financial management platform (Wealth OS) designed for founders, software developers, and high-net-worth professionals. It replaces generic SaaS spreadsheet dumps with a structured, Fortune 500-grade command dashboard.

---

## 1. High-Level Architecture (HLD)

The platform is designed around a monorepo workspace orchestrated via **Turborepo** and **Next.js 15**. It integrates **NestJS** as the backend orchestration layer, **Prisma ORM** for database client abstractions, **Clerk** for authentication session routing, and a client-side vector document generation system.

### Architecture Topology Diagram

```mermaid
graph TD
    Client[Next.js 15 SPA Client / React Frontends]
    Auth[Clerk Identity Provider]
    
    subgraph Vercel Serverless / Local Client Environment
        NextJS[Next.js App Router Node]
        DocGen[DocumentGeneratorService - jsPDF]
        LocalDB[LocalStorage Repository Fallback]
    end

    subgraph NestJS Backend Monolith
        tRPC[tRPC Route Handlers / Controller Actions]
        AppService[Application Service Layer]
        Domain[Domain Model Entities & Objects]
        Infra[Infrastructure Gateway Adapters]
        Prisma[Prisma ORM Client]
    end
    
    subgraph Database Infrastructure
        PostgreSQL[(Neon Serverless PostgreSQL)]
        Redis[(Upstash Redis Cache & Queue)]
    end
    
    Client -->|Session Handshake| Auth
    Client -->|API Requests / Sync| tRPC
    Client -->|Print / PDF Downloads| DocGen
    
    tRPC --> AppService
    AppService --> Domain
    AppService --> Infra
    Infra --> Prisma
    Prisma --> PostgreSQL
    Infra --> Redis
```

### Key Subsystems
1. **Executive Command Dashboard**: Provides cumulative net worth metrics over time, Month-over-Month (MoM) cash flow comparison metrics, dynamic financial health score indices, and Recharts 30-day/90-day filter scopes.
2. **Ledger Transactions manager**: Dynamic ledger registry supporting transaction logs (Income, Expense, Savings, Investment), payment method allocations, and metadata linkage drawers.
3. **Envelope Budgets Planner**: Interactive spending ceiling configurer that monitors category budgets and shifts visual warning tags as utilization ratios approach limit boundaries.
4. **AI Advisor & RAG Pipeline**: An offline-first local RAG service using semantic vector-space BM25 ranking to retrieve financial knowledge entries, answering Hinglish/English queries with tailored saving projections.
5. **Billing & Document Center**: A Fortune 500-inspired billing dashboard supporting interactive side-by-side A4 previews, theme color configurations, and HTML transaction email mockups.

---

## 2. Low-Level Design (LLD) & Clean Architecture

Following strict clean DDD design patterns, dependencies only point inward: **Presentation ➔ Infrastructure ➔ Application ➔ Domain**.

```
┌────────────────────────────────────────────────────────┐
│ Presentation (Next.js Pages, Tailwind CSS Componentry) │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Infrastructure (LocalStorage Repositories, Prisma DB)   │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Application (Service Interfaces, Use Cases, Ports)     │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Domain Layer (Entities, Value Objects, Domain Logic)   │
└────────────────────────────────────────────────────────┘
```

### Domain Layer (Value Objects & Entities)
No third-party packages or database model objects are imported here.
* **Money Value Object**: Handles precision decimals, currency symbols, and addition logic preventing mixed-currency arithmetic.
* **Transaction Entity**: Maps the core properties of ledger records (Title, Category, Amount, Type, Date, location, method).

### Application Layer Ports
Defines application interfaces and repository contracts:
* `ITransactionRepository`: Contracts for ledger query/write actions.
* `IBudgetRepository`: Contracts for envelope limit validations.
* `IGoalRepository`: Contracts for compounding milestone updates.
* `TransactionUseCase`: Orchestrates ledger logging and triggers budget limit alerts as side-effects.

### Infrastructure Layer Gateway
Concretely implements repository ports, database query routines, and fallback client storage protocols. It handles:
* LocalStorage fallbacks (`LocalStorageTransactionRepository`, `LocalStorageBudgetRepository`, `LocalStorageGoalRepository`) enabling functional offline client operation.
* Prisma ORM implementations mapping PostgreSQL schemas.

---

## 3. Database Schemas

The database schema is mapped inside **Prisma** to standard PostgreSQL relation fields:

```prisma
model User {
  id                    String                 @id @default(uuid()) @db.Uuid
  clerkId               String                 @unique @map("clerk_id")
  email                 String                 @unique
  createdAt             DateTime               @default(now())
  transactions          Transaction[]
  budgets               Budget[]
  goals                 Goal[]
  recurringTransactions RecurringTransaction[]
}

model Transaction {
  id            String          @id @default(uuid()) @db.Uuid
  userId        String          @map("user_id") @db.Uuid
  categoryId    String          @map("category_id") @db.Uuid
  title         String          @db.VarChar(255)
  amount        Decimal         @db.Decimal(12, 2)
  type          TransactionType
  paymentMethod PaymentMethod   @map("payment_method")
  date          DateTime
  tags          String[]        @default([])
  location      String?         @db.VarChar(255)
}

model Budget {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @map("user_id") @db.Uuid
  categoryId  String   @map("category_id") @db.Uuid
  limitAmount Decimal  @map("limit_amount") @db.Decimal(12, 2)
  month       Int
  year        Int
}

model Goal {
  id            String        @id @default(uuid()) @db.Uuid
  userId        String        @map("user_id") @db.Uuid
  title         String        @db.VarChar(255)
  targetAmount  Decimal       @map("target_amount") @db.Decimal(12, 2)
  currentAmount Decimal       @default(0.00) @map("current_amount") @db.Decimal(12, 2)
}
```

---

## 4. Fortune 500 Document Generation Engine

We engineered a dynamic client-side PDF document compiler (`DocumentGeneratorService.ts`) providing visually stunning A4 layout grids styled with Stripe, Mercury, and Brex aesthetics:

### Supported Document Types
1. **Invoice**: Subscription statement displaying package details (Starter, Pro, Enterprise), quantities, unit pricing, GST breakdowns, discounts, and payment methods.
2. **Receipt**: proof of payment displaying UPI references, transaction notes, merchant names, and validation statuses.
3. **Investment Statement**: Dynamic portfolio summaries pulling live milestone allocations, total invested capital, targets, and percentage tracking.
4. **Account Statement**: Comprehensive monthly reports compiling credited/debited flows, net monthly savings, savings velocity, and envelope budget statistics.

### Security and Trust Features (Vector-Drawn)
* **Custom Vector QR Code finder patterns**: Drawn using absolute mathematical grids directly inside jsPDF to ensure responsive pixel-perfect boundaries.
* **Vector Barcodes**: Mapped to transaction references at the foot of each page.
* **Tamper Detection Stamp**: Digital verification stamp displaying SHA-256 mock cryptographic fingerprints.

---

## 5. Technology Stack Summary

* **Monorepo Manager**: Turborepo (v2)
* **Web Frontend**: Next.js (v15 App Router), React 19, Tailwind CSS, Lucide Icons, Recharts.
* **Backend Services**: NestJS (v10), Prisma ORM (v6).
* **Identity & Authentication**: Clerk JWT Session Middleware.
* **Client Document Engine**: Dynamic `jsPDF` (packaged dynamically to prevent SSR hydration crashes).
* **Package Manager**: npm workspaces.

---

## 6. Local Installation & Development

### 1. Prerequisite Environments
Ensure your local environment has `node >= 18` and `npm >= 10`. Configure a `.env` file inside the root workspace containing:
```env
DATABASE_URL="postgresql://user:password@host/database"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-key"
CLERK_SECRET_KEY="your-secret"
```

### 2. Dependency Bootstrap
Run the monorepo installation script:
```bash
npm install
```

### 3. Generate Database Client
Compile and synchronize database clients using Prisma:
```bash
npm run prisma:generate
```

### 4. Fire Development Dev Server
Boot up the backend NestJS compiler and frontend Next.js server in watch/hot-reload mode:
```bash
npm run dev
```
The client dashboard will launch at `http://localhost:3001` and backend endpoints at `http://localhost:3002`.

---

## 7. Quality Assurance & Verifications

To verify type safety and monorepo compilation status:

* **TypeScript strict type checking**:
  ```bash
  npx tsc --noEmit -p apps/web/tsconfig.json
  ```
* **Production Build packaging check**:
  ```bash
  npm run build
  ```
