export class SyncService {
  private static API_URL = "/api/v1/sync";
  private static isSyncing = false;

  public static async triggerSync(clerkId: string, email: string): Promise<boolean> {
    if (this.isSyncing) return false;
    this.isSyncing = true;

    try {
      if (typeof window === "undefined") return false;

      // 1. Gather all local data with safe JSON parsing
      const localTransactionsStr = localStorage.getItem("apex_transactions");
      const localBudgetsStr = localStorage.getItem("apex_budgets");
      const localGoalsStr = localStorage.getItem("apex_goals");
      const localCurrency = localStorage.getItem("fintrack_currency") || "INR";
      const localPlan = localStorage.getItem("fintrack_plan") || "free";

      let transactions = [];
      let budgets = [];
      let goals = [];

      try {
        transactions = localTransactionsStr ? JSON.parse(localTransactionsStr) : [];
      } catch (e) {
        console.warn("Failed to parse local transactions JSON, defaulting to empty list.", e);
      }

      try {
        budgets = localBudgetsStr ? JSON.parse(localBudgetsStr) : [];
      } catch (e) {
        console.warn("Failed to parse local budgets JSON, defaulting to empty list.", e);
      }

      try {
        goals = localGoalsStr ? JSON.parse(localGoalsStr) : [];
      } catch (e) {
        console.warn("Failed to parse local goals JSON, defaulting to empty list.", e);
      }

      const payload = {
        clerkId,
        email,
        transactions,
        budgets,
        goals,
        settings: {
          currency: localCurrency,
          theme: localPlan, // map theme/plan as needed
        },
      };

      // 2. Transmit to NestJS server
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Sync server responded with status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.message || "Sync was rejected by backend service.");
      }

      const synced = result.data;

      // 3. Write consolidated results back to Local Storage with safe property access
      if (synced) {
        if (Array.isArray(synced.transactions)) {
          localStorage.setItem("apex_transactions", JSON.stringify(synced.transactions));
        }
        if (Array.isArray(synced.budgets)) {
          localStorage.setItem("apex_budgets", JSON.stringify(synced.budgets));
        }
        if (Array.isArray(synced.goals)) {
          localStorage.setItem("apex_goals", JSON.stringify(synced.goals));
        }
        if (synced.settings) {
          localStorage.setItem("fintrack_currency", synced.settings.currency || "INR");
          if (synced.settings.theme) {
            localStorage.setItem("fintrack_plan", synced.settings.theme);
          }
        }
      }

      // 4. Dispatch storage events so that all pages/sidebar reload instantly
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("fintrack_plan_changed"));
      
      console.log("Device Sync completed successfully with Neon PostgreSQL via Prisma!");
      return true;
    } catch (error: any) {
      // Use console.warn to prevent Next.js Dev Overlay from interrupting the UI on network/background sync issues
      console.warn("Device Sync background operation warning/error:", error.message || error);
      return false;
    } finally {
      this.isSyncing = false;
    }
  }
}

