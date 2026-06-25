# Database Design Specification
## Relational Schema, Indexing Strategy, and Query Optimizations

This document details the production-grade database architecture for ApexFinance. The system uses a PostgreSQL database designed for high transactional integrity, fast analytical aggregates, and secure data isolation.

---

### 1. Entity Relationship (ER) Diagram (Textual Representation)

```mermaid
erDiagram
    User ||--o{ Transaction : logs
    User ||--o{ Category : creates
    User ||--o{ Budget : defines
    User ||--o{ Goal : tracks
    User ||--o{ RecurringTransaction : configures
    User ||--oI Setting : configures
    User ||--o{ AuditLog : generates
    
    Category ||--o{ Transaction : categorizes
    Category ||--o{ Budget : limits
    Category ||--o{ RecurringTransaction : categorizes
    
    Transaction ||--o{ Attachment : includes
    Transaction }o--o| Goal : links
    
    RecurringTransaction ||--o{ Transaction : spawns
```

---

### 2. Relational Schema & Tables Definition

#### 2.1. Table: `users`
Tracks user identification, mapping Clerk external auth IDs to internal records.
* `id`: `UUID v4` (Primary Key)
* `clerk_id`: `VARCHAR(255)` (Unique, Indexed) - Maps to Clerk authentication ID.
* `email`: `VARCHAR(255)` (Unique)
* `created_at`: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)
* `updated_at`: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

#### 2.2. Table: `categories`
Stores hierarchical category tags.
* `id`: `UUID v4` (Primary Key)
* `user_id`: `UUID` (Foreign Key -> `users.id`, Cascade Delete)
* `name`: `VARCHAR(100)`
* `type`: `VARCHAR(32)` (Enum: `INCOME`, `EXPENSE`, `SAVINGS`, `INVESTMENT`)
* `parent_id`: `UUID` (Foreign Key -> `categories.id`, Nullable, Cascade Delete) - Allows sub-categorization.
* `icon`: `VARCHAR(64)` (Nullable) - Icon class name or identifier.
* `color`: `VARCHAR(7)` (Default: `#000000`) - Hex code for visual presentation.
* `is_custom`: `BOOLEAN` (Default: `TRUE`)
* `created_at`: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

#### 2.3. Table: `transactions`
The main financial ledger table.
* `id`: `UUID v4` (Primary Key)
* `user_id`: `UUID` (Foreign Key -> `users.id`, Cascade Delete)
* `category_id`: `UUID` (Foreign Key -> `categories.id`, Restrict Delete)
* `goal_id`: `UUID` (Foreign Key -> `goals.id`, Nullable, Set Null)
* `title`: `VARCHAR(255)`
* `description`: `TEXT` (Nullable)
* `amount`: `NUMERIC(12, 2)` - High precision decimal to avoid rounding errors.
* `type`: `VARCHAR(32)` (Enum: `INCOME`, `EXPENSE`, `SAVINGS`, `INVESTMENT`, `TRANSFER`)
* `payment_method`: `VARCHAR(32)` (Enum: `CASH`, `UPI`, `CARD`, `BANK_TRANSFER`, `WALLET`)
* `date`: `TIMESTAMP WITH TIME ZONE` - Main ledger date.
* `tags`: `VARCHAR(64)[]` (Array of tags, Indexed)
* `location`: `VARCHAR(255)` (Nullable)
* `created_at`: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)
* `updated_at`: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

#### 2.4. Table: `budgets`
Tracks user-defined spending targets.
* `id`: `UUID v4` (Primary Key)
* `user_id`: `UUID` (Foreign Key -> `users.id`, Cascade Delete)
* `category_id`: `UUID` (Foreign Key -> `categories.id`, Cascade Delete)
* `limit_amount`: `NUMERIC(12, 2)`
* `month`: `INTEGER` (Range: 1-12)
* `year`: `INTEGER`
* `created_at`: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)
* `updated_at`: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)
* *Unique Constraint:* `(user_id, category_id, month, year)` - Ensures one budget allocation per category per month.

#### 2.5. Table: `goals`
Tracks target values for assets, purchases, or funds.
* `id`: `UUID v4` (Primary Key)
* `user_id`: `UUID` (Foreign Key -> `users.id`, Cascade Delete)
* `title`: `VARCHAR(255)`
* `target_amount`: `NUMERIC(12, 2)`
* `current_amount`: `NUMERIC(12, 2)` (Default: `0.00`)
* `target_date`: `TIMESTAMP WITH TIME ZONE` (Nullable)
* `created_at`: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)
* `updated_at`: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

#### 2.6. Table: `recurring_transactions`
Configures schedules for automatically spawning transaction entries.
* `id`: `UUID v4` (Primary Key)
* `user_id`: `UUID` (Foreign Key -> `users.id`, Cascade Delete)
* `category_id`: `UUID` (Foreign Key -> `categories.id`, Restrict Delete)
* `title`: `VARCHAR(255)`
* `amount`: `NUMERIC(12, 2)`
* `type`: `VARCHAR(32)` (Enum: `INCOME`, `EXPENSE`, `SAVINGS`, `INVESTMENT`)
* `frequency`: `VARCHAR(32)` (Enum: `DAILY`, `WEEKLY`, `MONTHLY`, `QUARTERLY`, `YEARLY`)
* `start_date`: `TIMESTAMP WITH TIME ZONE`
* `end_date`: `TIMESTAMP WITH TIME ZONE` (Nullable)
* `next_execution_date`: `TIMESTAMP WITH TIME ZONE`
* `payment_method`: `VARCHAR(32)`
* `is_active`: `BOOLEAN` (Default: `TRUE`)
* `created_at`: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)
* `updated_at`: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

#### 2.7. Table: `attachments`
Receipts and files associated with transactions.
* `id`: `UUID v4` (Primary Key)
* `transaction_id`: `UUID` (Foreign Key -> `transactions.id`, Cascade Delete)
* `file_name`: `VARCHAR(255)`
* `file_url`: `TEXT` - Supabase Storage bucket URL.
* `file_size`: `INTEGER` (In bytes)
* `mime_type`: `VARCHAR(100)`
* `created_at`: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

#### 2.8. Table: `settings`
Key-value pair store for user configuration (e.g., currency, theme).
* `id`: `UUID v4` (Primary Key)
* `user_id`: `UUID` (Unique, Foreign Key -> `users.id`, Cascade Delete)
* `currency`: `VARCHAR(3)` (Default: `INR`)
* `theme`: `VARCHAR(10)` (Default: `dark`)
* `notifications_enabled`: `BOOLEAN` (Default: `TRUE`)
* `created_at`: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

#### 2.9. Table: `audit_logs`
Tracks critical security actions (e.g., backups, deletion of years of data, profile changes).
* `id`: `UUID v4` (Primary Key)
* `user_id`: `UUID` (Foreign Key -> `users.id`, Cascade Delete)
* `action`: `VARCHAR(255)`
* `ip_address`: `VARCHAR(45)`
* `user_agent`: `TEXT`
* `timestamp`: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

---

### 3. Indexing Strategy

To handle high-frequency reads on the main analytical dashboards, we define a precise indexing strategy. All indexes are prefixed for clarity.

1. **Foreign Key Indexes:**
   * PostgreSQL automatically creates indexes for primary keys and unique constraints, but *not* for foreign keys. We index all foreign key columns to optimize join performance (e.g., `idx_transactions_user_id`, `idx_transactions_category_id`).
2. **Compound Index for Dashboard & Reports:**
   * **`idx_transactions_user_date_type`**: `(user_id, date DESC, type)` -> Accelerates query pipelines pulling monthly/weekly summaries of specific transaction types.
3. **Budget Target Index:**
   * **`idx_budgets_lookup`**: `(user_id, month, year)` -> Speeds up retrieval of active budget frames for the dashboard gauge components.
4. **Fuzzy Search Index (GIN):**
   * **`idx_transactions_search_vector`**: A GIN index over a combination of the `title`, `description`, and `tags` using PostgreSQL Full-Text Search.
5. **Recurring Transaction Scheduler Index:**
   * **`idx_recurring_execution`**: `(is_active, next_execution_date)` -> Optimizes the daily cron task checking which templates require spawning.

---

### 4. Query Optimization & Analytical Queries

The following raw SQL statements demonstrate optimized calculations directly on PostgreSQL.

#### 4.1. Monthly Summary (Income, Expense, Savings, and Net Flow)
```sql
SELECT 
  COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) AS total_income,
  COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS total_expense,
  COALESCE(SUM(CASE WHEN type = 'SAVINGS' OR type = 'INVESTMENT' THEN amount ELSE 0 END), 0) AS total_savings,
  COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN type = 'SAVINGS' OR type = 'INVESTMENT' THEN amount ELSE 0 END), 0) AS net_cash_flow
FROM transactions
WHERE user_id = :user_id 
  AND date >= DATE_TRUNC('month', :target_date::timestamp)
  AND date < DATE_TRUNC('month', :target_date::timestamp) + INTERVAL '1 month';
```

#### 4.2. Category-wise Budget Progress Tracker
Queries active budgets, joins categories, and computes expenditures within the specified billing month.
```sql
SELECT 
  b.id AS budget_id,
  c.id AS category_id,
  c.name AS category_name,
  b.limit_amount AS budget_limit,
  COALESCE(SUM(t.amount), 0) AS amount_spent,
  (b.limit_amount - COALESCE(SUM(t.amount), 0)) AS amount_remaining,
  CASE 
    WHEN b.limit_amount > 0 THEN ROUND((COALESCE(SUM(t.amount), 0) / b.limit_amount) * 100, 2)
    ELSE 0 
  END AS percentage_used
FROM budgets b
JOIN categories c ON b.category_id = c.id
LEFT JOIN transactions t ON t.category_id = c.id 
  AND t.user_id = b.user_id
  AND t.type = 'EXPENSE'
  AND t.date >= MAKE_TIMESTAMPTZ(b.year, b.month, 1, 0, 0, 0, 'UTC')
  AND t.date < MAKE_TIMESTAMPTZ(b.year, b.month, 1, 0, 0, 0, 'UTC') + INTERVAL '1 month'
WHERE b.user_id = :user_id 
  AND b.month = :month 
  AND b.year = :year
GROUP BY b.id, c.id, c.name, b.limit_amount;
```

#### 4.3. Full-Text Global Search Query (Optimized GIN)
```sql
SELECT t.*, c.name AS category_name
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.user_id = :user_id
  AND (
    to_tsvector('english', t.title || ' ' || COALESCE(t.description, '') || ' ' || array_to_string(t.tags, ' '))
    @@ plainto_tsquery('english', :search_query)
    OR t.payment_method::text ILIKE :search_query_like
    OR c.name ILIKE :search_query_like
  )
ORDER BY t.date DESC
LIMIT 50;
```
