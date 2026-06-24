# Product Requirement Document (PRD)
## Personal Finance & Expense Tracking Platform (Codename: ApexFinance)

### 1. Introduction & Objectives
ApexFinance is a next-generation personal finance platform designed for young working professionals. It combines the rigorous proactive budgeting philosophy of YNAB, the automated visual dashboarding of Monarch Money, the ease of offline tracking from Wallet by BudgetBakers, and the sleek analytical aesthetic of Notion and the Stripe Dashboard.

The core objective is to give the user absolute financial visibility over their cash flows, investments, savings goals, and budgets with a premium, friction-free user experience that works offline-first and syncs seamlessly.

---

### 2. User Profile & Personas
* **Target User:** Young working professional living away from home.
* **Key Challenges:**
  * Managing multiple cash flows (salary, freelance, family transfers, refunds).
  * High-friction manual tracking resulting in abandoned budgeting.
  * Lack of projection on long-term goals (e.g., buying a laptop, establishing an emergency fund).
  * High transaction volume across different channels (UPI, card, bank transfers, cash).
  * Desires offline usability when traveling or in low-connectivity areas.

---

### 3. Functional Specifications

#### 3.1. Dashboard
The dashboard serves as the central financial command center. It must offer three key scopes of time (Today, This Week, This Month, This Year).
* **Today's Summary:**
  * Total Income, Expense, and Savings logged today.
  * Net Cash Flow (Income - Expense - Savings/Investments).
* **Weekly Summary:**
  * Rolling 7-day aggregate of Income, Expenses, and Savings.
  * Week-over-Week (WoW) comparison indicator (percentage change with positive/negative color-coding).
* **Monthly Summary:**
  * Calendar month performance.
  * Real-time calculation of remaining overall monthly budget.
  * Visual gauge showing pacing (are they spending faster than the day of the month suggests?).
* **Yearly Summary:**
  * Calendar year performance.
  * Overall **Savings Rate %** calculated as: `(Savings + Investments) / Total Income * 100`.

#### 3.2. Transaction Management
A comprehensive CRUD module for managing financial transactions.
* **Fields:**
  * `Transaction ID` (UUID v4)
  * `Title` (e.g., "Organic Groceries", "Salary Credit")
  * `Description` (Optional multi-line notes)
  * `Amount` (Decimal with high precision, e.g., Decimal(12, 2))
  * `Transaction Type` (Enum: `INCOME`, `EXPENSE`, `SAVINGS`, `INVESTMENT`, `TRANSFER`)
  * `Date` and `Time` (Timestamp with timezone support)
  * `Category ID` (Foreign key to Category)
  * `Tags` (Array of strings for flexible labeling)
  * `Attachments` (URLs to images/PDFs of receipts stored in Supabase Storage)
  * `Location` (String or lat/lng metadata for transaction location)
  * `Payment Method` (Enum: `CASH`, `UPI`, `CARD`, `BANK_TRANSFER`, `WALLET`)
* **Transfer Logic:**
  * A `TRANSFER` type transaction must record a source account and a destination account (e.g., Bank Account to Wallet). It does not count towards net income or expense totals, but adjusts account balances.

#### 3.3. Advanced Categories
Supports hierarchical categorization to prevent flat-list fatigue.
* **Default Category Trees:**
  * **Income:** `Salary`, `Gift`, `Family`, `Freelance`, `Refund`
  * **Expense:** `Rent`, `Food` (Subcategories: Groceries, Restaurants), `Transport` (Subcategories: Fuel, Public Transit, Cabs), `Recharge` (Utilities, Mobile, Internet), `Entertainment` (Streaming, Movies), `Shopping` (Apparel, Electronics), `Education`, `Health` (Medicines, Doctor), `Travel`, `Miscellaneous`
  * **Savings:** `Emergency Fund`, `Investment`, `FD`, `SIP`, `Gold`
* **Custom Categories:**
  * Users can create unlimited custom categories at parent or subcategory levels.
  * Each category can be mapped to an icon and hex-color code.

#### 3.4. Budget Planning Module
Proactive envelope-style budgeting.
* **Configuration:**
  * Set monthly budget limits per category (e.g., Food: ₹5,000, Travel: ₹2,000).
* **Calculations:**
  * **Spent:** Sum of all `EXPENSE` type transactions under that category for the current month.
  * **Remaining:** Budget limit - Spent.
  * **Percentage Used:** `(Spent / Limit) * 100`.
* **Proactive Alerts:**
  * System triggers in-app and email notifications at predefined thresholds: **50%**, **75%**, **90%**, and **100%** (Overspent).

#### 3.5. Goal Tracking System
Targeted saving indicators for long-term aspirations.
* **Fields:**
  * Goal ID, Title, Target Amount, Current Amount, Target Date.
* **Calculations:**
  * **Progress %:** `(Current Amount / Target Amount) * 100`.
  * **Expected Completion Date:** Extrapolated using the user's average monthly savings rate and allocations to this goal.
* **Linkage:**
  * Transactions of type `SAVINGS` or `INVESTMENT` can be optionally linked to a Goal to automatically increment `Current Amount`.

#### 3.6. Analytics Engine
Rich interactive graphs showing long-term trends.
* **Timeframes:** Daily, Weekly, Monthly, Yearly.
* **Visualizations:**
  * **Spending Trends:** Monthly line chart comparing expenses month-over-month.
  * **Category Breakdown:** Pie/donut chart displaying percentage of expenses per category.
  * **Savings Growth:** Area chart showing aggregate savings and investment balances over time.
  * **Cash Flow:** Bar chart comparing monthly Income vs. Expenses.
  * **Net Worth:** Cumulative chart tracking assets (Bank balances + Savings + Investments) minus liabilities.

#### 3.7. Financial Insights Engine
Heuristics-driven natural language statements.
* Analyzes current month transactions against rolling 3-month averages.
* Examples of generated text:
  * "You spent 28% more on food this month compared to your 3-month average."
  * "Transport expenses increased by ₹450 (18%) this week."
  * "You are currently saving 12% of your income. Increasing this to 20% would reach your MacBook goal 3 months faster."

#### 3.8. Recurring Transactions
Automated ledger postings for fixed periodic items.
* **Intervals:** `DAILY`, `WEEKLY`, `MONTHLY`, `QUARTERLY`, `YEARLY`.
* **Auto-generation:**
  * A background CRON scheduler running daily evaluates active recurring rules.
  * On the scheduled date, the system auto-inserts the transaction, marked as `AUTO_GENERATED`, and sends a notification.

#### 3.9. Search Engine
High-speed, multi-attribute indexing.
* Global search box returning instant results matching:
  * Title (fuzzy text matching)
  * Category name
  * Tag list
  * Payment method
  * Date ranges or absolute amount bounds.

#### 3.10. Reports Module
Data portability and accounting auditability.
* **Export Formats:** CSV, XLSX, and formatted PDF.
* **Report Options:** Monthly Summary, Annual Taxes, Budget Performance, and Goal Completion reports.

#### 3.11. Backup & Offline Sync System
Ensures data is never lost.
* **Offline-First:** All writes are stored in client-side storage (IndexedDB) immediately.
* **Sync Protocol:** Once online, a sync client matches timestamps, pushes local mutations via Server Actions, resolves conflict issues via "server-wins" metadata rules, and updates client state.
* **Exportable SQL/JSON:** Users can trigger a manual local download of their entire database in encrypted JSON format.

#### 3.12. Notifications
In-app dashboard notifications and push notifications for:
  * Budget threshold breaches (50%, 75%, 90%, 100%).
  * Goal milestones (e.g., "50% saved towards MacBook!").
  * Overspending warnings (e.g., daily velocity exceeds historical mean by 2.5x).
  * Recurring transaction alerts (reminding the user of an upcoming auto-deduction).

---

### 4. Non-Functional Requirements
1. **Performance:** Under 100ms API response time for read operations; interactive charts must render smoothly without UI blocking.
2. **Security:** AES-256 encryption for attachments, TLS 1.3 in transit, masking of bank accounts/sensitive fields.
3. **Availability:** 99.9% uptime deployment on Vercel + Supabase/PostgreSQL.
4. **Mobile First:** Responsive viewports down to 320px with touch-optimized targets.
