import { Transaction } from "../../domain/entities/transaction";
import { Budget } from "../../domain/entities/budget";
import { Goal } from "../../domain/entities/goal";

// 1. Knowledge Base Documents (Wisdom Corpus)
export interface KnowledgeDoc {
  id: string;
  title: string;
  category: string;
  content: string;
}

export const FINANCIAL_KNOWLEDGE_BASE: KnowledgeDoc[] = [
  {
    id: "kb_50_30_20",
    title: "The 50/30/20 Budgeting Rule",
    category: "Budgeting",
    content: "Allocate 50% of net income to Needs (housing, utilities, essential groceries), 30% to Wants (dining, streaming services, hobbies, shopping), and 20% to Savings, investments, and debt paydown. If your Wants exceed 30%, identify recurring budget leaks or micro-transaction spikes immediately."
  },
  {
    id: "kb_emergency_fund",
    title: "Emergency Savings and Cash Reserves Sizing",
    category: "Savings",
    content: "Establish an emergency fund covering 3 to 6 months of essential living expenses (Needs). Keep this capital highly liquid in high-yield savings accounts or short-term deposits. Never invest emergency capital in volatile instruments like equities, crypto, or long-term lock-ins."
  },
  {
    id: "kb_savings_rate",
    title: "Pay Yourself First and Compounding Rule",
    category: "Savings",
    content: "Automate your savings contributions immediately after salary credit (pay yourself first) rather than saving whatever remains at the end of the month. Saving even ₹2,000 more per month compounds heavily over 10 years, dramatically accelerating financial independence."
  },
  {
    id: "kb_budget_breaches",
    title: "Envelope Budgeting Tension and Mitigation",
    category: "Budgeting",
    content: "Under envelope budgeting, if any category spending crosses 75% of its monthly limit before the 15th day of the month, freeze flexible expenses in that category. If a budget is breached, cover the difference by shifting capital from flexible Wants categories (like leisure/entertainment)."
  },
  {
    id: "kb_debt_management",
    title: "Debt Avalanche and High-Interest Debt Pruning",
    category: "Debt",
    content: "Avoid high-interest consumer debt (credit card rollovers, personal loans) for wants. Pay down high-interest liabilities first (Avalanche method) to minimize absolute interest paid, or pay down low-balance liabilities (Snowball method) to build psychological momentum."
  },
  {
    id: "kb_impulse_spending",
    title: "The 24-Hour Cooling-Off Rule",
    category: "Behavioral",
    content: "Introduce friction to combat impulse buying. For non-essential wants over ₹1,500, enforce a 24-hour cooling-off period. Decouple emotional triggers (stress, excitement) from financial transactions by adding wants to a wishlist first rather than checkout."
  },
  {
    id: "kb_subscription_pruning",
    title: "SaaS and Subscription Pruning Guide",
    category: "Cashflow",
    content: "Conduct a monthly audit of recurring drafts (SaaS subscriptions, gym memberships, streaming plans). Cancel services unused in the last 30 days. Opt for annual billing cycles for essential tools to receive discounts up to 20%."
  },
  {
    id: "kb_investment_basics",
    title: "Direct Mutual Funds and Expense Ratio Pruning",
    category: "Investment",
    content: "When investing, choose Direct mutual funds over Regular mutual funds. Regular funds pay recurring commissions to distributors, adding 0.5% to 1.5% to the annual Expense Ratio. Over 20 years, this difference can consume up to 20-30% of your total compounded wealth."
  }
];

// 2. Tokenizer & BM25 Relevance Search Engine
export interface BM25Result {
  doc: KnowledgeDoc;
  score: number;
}

export interface PipelineTrace {
  phase1_query_preprocessing: {
    raw_query: string;
    tokens: string[];
  };
  phase2_document_retrieval: {
    algorithm: "BM25 Vector Space Search";
    average_doc_length: number;
    corpus_size: number;
    term_frequencies: Record<string, Record<string, number>>; // docId -> term -> count
    document_frequencies: Record<string, number>; // term -> count
    scores: { docId: string; title: string; score: number }[];
    selected_docs: string[]; // titles
  };
  phase3_context_compilation: {
    transactions_count: number;
    budgets_count: number;
    goals_count: number;
    income: number;
    expense: number;
    savings: number;
    net_flow: number;
    savings_rate: number;
    payload_char_length: number;
  };
  phase4_reasoning_engine: {
    type: "Google Gemini 1.5 Flash API" | "Local WebAssembly LLM" | "Local Analytical Reasoning Engine" | string;
    latency_ms: number;
    detected_intent: string;
  };
  phase5_output_validation: {
    status: "SUCCESS" | "FALLBACK_TRIGGERED";
    parsed_keys: string[];
  };
}

export interface AdvisorResponse {
  dos: string[];
  donts: string[];
  summary: string;
  trace: PipelineTrace;
}

export class RagService {
  private static stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "to", "for", "of", "in", "on", "at", "by", "with",
    "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "i", "you", "he", "she", "it", "we", "they", "my", "your", "his", "her", "its", "our", "their",
    "how", "can", "what", "where", "why", "who", "should", "would", "could", "about", "your", "my"
  ]);

  public static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(w => w.length >= 3 && !this.stopWords.has(w));
  }

  // Client-side BM25 vector-space search implementation
  public static retrieveRelevantKnowledge(query: string, limit = 2): { docs: KnowledgeDoc[]; traceLog: any } {
    const queryTokens = this.tokenize(query);
    const corpus = FINANCIAL_KNOWLEDGE_BASE;
    const N = corpus.length;

    // Tokenize documents and calculate document lengths
    const docTokens = corpus.map(d => ({
      id: d.id,
      tokens: this.tokenize(`${d.title} ${d.category} ${d.content}`)
    }));

    const avgdl = docTokens.reduce((sum, d) => sum + d.tokens.length, 0) / N;

    // Calculate Term Frequencies (TF) per document
    // docId -> term -> frequency
    const docTermFreqs: Record<string, Record<string, number>> = {};
    docTokens.forEach(d => {
      const freqs: Record<string, number> = {};
      d.tokens.forEach(token => {
        freqs[token] = (freqs[token] || 0) + 1;
      });
      docTermFreqs[d.id] = freqs;
    });

    // Calculate Document Frequency (DF) of each unique term across corpus
    const df: Record<string, number> = {};
    docTokens.forEach(d => {
      const uniqueTokens = new Set(d.tokens);
      uniqueTokens.forEach(token => {
        df[token] = (df[token] || 0) + 1;
      });
    });

    // BM25 parameters
    const k1 = 1.2;
    const b = 0.75;

    // Compute scores for each document against the query tokens
    const scores = corpus.map(doc => {
      let score = 0;
      const tfRecord = docTermFreqs[doc.id] || {};
      const dl = docTokens.find(dt => dt.id === doc.id)?.tokens.length || 0;

      queryTokens.forEach(token => {
        if (tfRecord[token] !== undefined) {
          const tf = tfRecord[token];
          const docFreq = df[token] || 0;
          // Inverse Document Frequency with smoothing
          const idf = Math.log(1 + (N - docFreq + 0.5) / (docFreq + 0.5));
          // BM25 scaling formula
          const termScore = idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (dl / avgdl))));
          score += termScore;
        }
      });

      return { doc, score };
    });

    // Sort documents by BM25 score descending
    const sorted = scores
      .sort((a, b) => b.score - a.score);

    // If query has no matches, return default documents (top 2) with a score of 0
    const matched = sorted.filter(s => s.score > 0);
    const resultDocs = matched.length > 0 
      ? matched.slice(0, limit).map(s => s.doc)
      : corpus.slice(0, limit);

    const traceLog = {
      average_doc_length: parseFloat(avgdl.toFixed(2)),
      corpus_size: N,
      term_frequencies: docTermFreqs,
      document_frequencies: df,
      scores: sorted.map(s => ({ docId: s.doc.id, title: s.doc.title, score: parseFloat(s.score.toFixed(4)) })),
      selected_docs: resultDocs.map(d => d.title)
    };

    return { docs: resultDocs, traceLog };
  }

  // 3. 100% Free Local Analytical Reasoning Engine (Local LLM Behavior)
  public static calculateLocalInsights(
    queryText: string,
    transactions: Transaction[],
    budgets: Budget[],
    goals: Goal[],
    retrievedDocs: KnowledgeDoc[],
    bm25Trace: any
  ): AdvisorResponse {
    const startTime = Date.now();
    
    // Core aggregates calculations
    let income = 0;
    let expense = 0;
    let savings = 0;
    const categoryExpenses: Record<string, number> = {};
    const transactionCountsByCategory: Record<string, number> = {};

    transactions.forEach(t => {
      const amount = t.amount.amount;
      if (t.type === "INCOME") {
        income += amount;
      } else if (t.type === "EXPENSE") {
        expense += amount;
        categoryExpenses[t.categoryId] = (categoryExpenses[t.categoryId] || 0) + amount;
        transactionCountsByCategory[t.categoryId] = (transactionCountsByCategory[t.categoryId] || 0) + 1;
      } else if (t.type === "SAVINGS" || t.type === "INVESTMENT") {
        savings += amount;
      }
    });

    const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;
    const netFlow = income - expense - savings;

    // Detect Language (Hinglish vs. English)
    const queryLower = queryText.toLowerCase();
    const isHinglish = /kharcha|bachat|bacht|bachao|paise|kam|karo|kaise|kya|dikhao|hai|hoga|badhayein|karun|hua|pe|kitna|aaj|mera|meri|mere|bhai|yaar|saving/.test(queryLower);

    // Detect Intent
    let detectedIntent = "General Wealth Checkup";
    if (queryLower.match(/(leak|food|dining|swiggy|zomato|coffee|starbucks|micro|spend|kharcha|expense)/)) {
      detectedIntent = "Micro-spending & Category Leak Analysis";
    } else if (queryLower.match(/(budget|envelope|limit|tension|breach|utilization|cross)/)) {
      detectedIntent = "Envelope Budget Tension Analysis";
    } else if (queryLower.match(/(goal|macbook|emergency|reserve|target|timeline|month|saving|bachat|bachao)/)) {
      detectedIntent = "Savings Goals Timeline Projection";
    } else if (queryLower.match(/(rate|50\/30\/20|philosophy|needs|wants|benchmark|rule)/)) {
      detectedIntent = "50/30/20 Rule Comparison";
    }

    // Wants spending calculation (assuming Food, Shopping, and Entertainment are Wants)
    const foodSpent = categoryExpenses["Food"] || categoryExpenses["Food & Dining"] || 0;
    const foodTxCount = transactionCountsByCategory["Food"] || transactionCountsByCategory["Food & Dining"] || 0;
    const shoppingSpent = categoryExpenses["Shopping"] || 0;
    const entertainmentSpent = categoryExpenses["Entertainment"] || 0;
    const totalWants = foodSpent + shoppingSpent + entertainmentSpent;
    const wantsRate = income > 0 ? Math.round((totalWants / income) * 100) : 0;

    // Rules Containers
    const dos: string[] = [];
    const donts: string[] = [];
    let summary = "";

    // 1. Intent: Category Leak Analysis
    if (detectedIntent === "Micro-spending & Category Leak Analysis") {
      if (isHinglish) {
        summary = `Maine aapke transactions analyze kiye hain. Is month aapne Food aur Dining par total **₹${foodSpent.toLocaleString()}** spend kiya hai across **${foodTxCount} orders**. Swiggy/Zomato orders thoda control karke aap har hafte lagbhag **₹1,500** bacha sakte hain! Aapka total Wants spending aapki income ka **${wantsRate}%** hai.`;
        dos.push("Food delivery par weekly cap set karein aur home cooking prefer karein.");
        dos.push("Wants spending par 24-Hour Cooling-Off Rule lagaayein.");
        dos.push("Chote-chote retail transactions aur shopping spends ko weekly audit karein.");
        donts.push(`Wants spending ko salary ka 30% cross na karne dein (abhi ${wantsRate}% hai).`);
        donts.push("Late night orders aur emotion-driven impulse checkout ko avoid karein.");
        donts.push("Bina track kiye ₹1,500 se upar ka koi purchase na karein.");
      } else {
        summary = `Based on your transactions, you've spent **₹${foodSpent.toLocaleString()}** on Food & Dining across **${foodTxCount} orders** this month. Your total Wants represent **${wantsRate}%** of your income. Trimming frequent deliveries can recoup around **₹6,000/month** to fuel your savings.`;
        dos.push("Set a weekly limit of ₹1,000 on restaurant deliveries.");
        dos.push("Implement the 24-Hour Cooling-Off Rule for non-essential retail buys.");
        dos.push("Audit small daily transactions like tea/coffee drafts to prevent leaks.");
        donts.push(`Do not let discretionary wants exceed the 30% benchmark (currently ${wantsRate}%).`);
        donts.push("Avoid impulse purchases during online sales or promotional alerts.");
        donts.push("Don't let untracked micro-spending drain your primary checking account.");
      }
    }
    // 2. Intent: Envelope Budget Tension Analysis
    else if (detectedIntent === "Envelope Budget Tension Analysis") {
      const breachedList: string[] = [];
      const tensionList: string[] = [];

      budgets.forEach(b => {
        const spent = categoryExpenses[b.categoryId] || 0;
        const ratio = spent / b.limitAmount.amount;
        if (ratio >= 1.0) {
          breachedList.push(`${b.categoryId} (Limit ₹${b.limitAmount.amount.toLocaleString()}, Spent ₹${spent.toLocaleString()})`);
        } else if (ratio >= 0.75) {
          tensionList.push(`${b.categoryId} (${(ratio * 100).toFixed(0)}% used of ₹${b.limitAmount.amount.toLocaleString()})`);
        }
      });

      if (isHinglish) {
        if (breachedList.length > 0) {
          summary = `Aapke envelope budgets me critical tension hai! **${breachedList.join(", ")}** category limits cross kar chuki hain. Aapka net monthly cash balance **₹${netFlow.toLocaleString()}** bacha hai. Extra spending freeze karni padegi.`;
        } else if (tensionList.length > 0) {
          summary = `Aapke budgets boundary level par hain. **${tensionList.join(", ")}** envelopes 75% limit cross kar chuke hain. Discretionary spending ko abhi hold par rakhein.`;
        } else {
          summary = `Badhiya! Aapke saare category budgets under control hain. Koi bhi envelope limit breach nahi kar raha hai aur cash balance safe hai.`;
        }
        dos.push("Breached envelopes ko balance karne ke liye other Wants categories se funds shift karein.");
        dos.push("Month ke remaining days ke liye high-tension categories me spendings strictly freeze karein.");
        dos.push("Financial ledger me transactions real-time me record karte rahein.");
        donts.push("Breached envelopes me koi extra discretionary transaction na karein.");
        donts.push("Bina envelope balance check kiye random card swipes ya online payments na karein.");
        donts.push("Budget breaches ko ignore karke high-interest debt cycles me na fasein.");
      } else {
        if (breachedList.length > 0) {
          summary = `Your budget envelopes are showing critical stress! The following categories have breached their limits: **${breachedList.join(", ")}**. Net monthly cash flow is **₹${netFlow.toLocaleString()}**. Immediate expense freezes advised.`;
        } else if (tensionList.length > 0) {
          summary = `Your budgets are warning levels: **${tensionList.join(", ")}** have crossed 75% capacity. We recommend freezing flexible expenses to prevent deficits.`;
        } else {
          summary = `Excellent! All envelope budgets are healthy and running well under your defined spending limits.`;
        }
        dos.push("Reallocate capital from flexible Wants to cover breached categories.");
        dos.push("Freeze subscription trials and dining drafts in high-tension categories.");
        dos.push("Track your daily ledger balances before making transaction decisions.");
        donts.push("Do not continue spending in categories that have already breached their limits.");
        donts.push("Avoid delaying transaction entry logs as it distorts budget warning indicators.");
        donts.push("Don't use credit cards to overdraw categories without real cash backing.");
      }
    }
    // 3. Intent: Savings Goals Timeline Projection
    else if (detectedIntent === "Savings Goals Timeline Projection") {
      const activeGoals = goals.filter(g => g.targetAmount.amount > g.currentAmount.amount);
      const velocity = savings > 0 ? savings : (netFlow > 0 ? netFlow : 0);

      if (isHinglish) {
        if (activeGoals.length > 0) {
          const projectionStr = activeGoals.map(g => {
            const remaining = g.targetAmount.amount - g.currentAmount.amount;
            if (velocity > 0) {
              const months = Math.ceil(remaining / velocity);
              return `'${g.title}' (remaining ₹${remaining.toLocaleString()}) ko complete karne me **${months} months** lagenge.`;
            }
            return `'${g.title}' abhi stagnant hai kyunki aapki savings speed 0 hai.`;
          }).join(" ");

          summary = `Aapke active saving goals check kiye hain. Aapki monthly savings ₹${savings.toLocaleString()} hai. ${projectionStr}`;
        } else {
          summary = `Aapke paas koi active saving goal nahi hai. Milestones achieve karne ke liye target tab par jaakar Emergency Fund ya MacBook goal set karein.`;
        }
        dos.push("Salary credit hote hi savings aur investment contribution automate karein (Pay Yourself First).");
        dos.push("Savings speed badhane ke liye monthly wants (dining/entertainment) ko 10% reduce karein.");
        dos.push("Emergency reserve fund ko direct liquid, low-risk accounts me allocate karein.");
        donts.push("Emergency reserves ko volatile assets jaise cryptocurrency ya stocks me lock na karein.");
        donts.push("Goals ke liye saved paise ko casual spending accounts ke sath mix na karein.");
        donts.push("Milestone dates ko extended timeline ke bina delay na karein.");
      } else {
        if (activeGoals.length > 0) {
          const projectionStr = activeGoals.map(g => {
            const remaining = g.targetAmount.amount - g.currentAmount.amount;
            if (velocity > 0) {
              const months = Math.ceil(remaining / velocity);
              return `'${g.title}' (₹${remaining.toLocaleString()} left) will take approx **${months} months** to complete.`;
            }
            return `'${g.title}' is stagnant due to zero savings velocity.`;
          }).join(" ");

          summary = `I've evaluated your goals. With a monthly savings velocity of ₹${savings.toLocaleString()}, here are the projections: ${projectionStr}`;
        } else {
          summary = `You have no active goals set. We advise defining an emergency fund covering 3-6 months of essential needs to secure your finances.`;
        }
        dos.push("Automate your savings transfers immediately after salary credits.");
        dos.push("Increase goal contributions by pruning recurrent monthly subscription drafts.");
        dos.push("Keep emergency funds liquid in high-yield savings or overnight mutual funds.");
        donts.push("Never lock emergency capital in illiquid or high-risk speculative tokens.");
        donts.push("Do not leave goals inactive without regular quarterly tracking updates.");
        donts.push("Avoid upgrading your lifestyle (lifestyle creep) as soon as your income climbs.");
      }
    }
    // 4. Intent: 50/30/20 Rule Comparison
    else if (detectedIntent === "50/30/20 Rule Comparison") {
      if (isHinglish) {
        summary = `50/30/20 rule ke hisab se: 50% Needs, 30% Wants aur 20% Savings hona chahiye. Aapka current budget split: **Needs: ~${Math.max(0, 100 - wantsRate - savingsRate)}%, Wants: ${wantsRate}%, Savings: ${savingsRate}%** hai. Savings target 20% se kam hai, bachat accelerate karein.`;
        dos.push("Savings rate ko increase karke target minimum 20% par set karein.");
        dos.push("Discretionary Wants (shopping/food) ko evaluate karke under 30% lock karein.");
        dos.push("Mutual funds me Regular plan ke bajaye Direct plans use karein to save 1% commissions.");
        donts.push("Salary aate hi saara paisa checking account me discretionary expense ke liye na chhodein.");
        donts.push("Needs and wants categorization ko loose ya misclassified na rakhein.");
        donts.push("Bina 3-month cash reserves build kiye aggressive investments na shuru karein.");
      } else {
        summary = `According to the 50/30/20 rule: 50% goes to Needs, 30% to Wants, and 20% to Savings. Your current breakdown is: **Needs: ~${Math.max(0, 100 - wantsRate - savingsRate)}%, Wants: ${wantsRate}%, Savings: ${savingsRate}%**. Boosting your savings rate to 20% will compound heavily.`;
        dos.push("Automate a minimum 20% savings contribution before checking Wants limits.");
        dos.push("Keep basic survival Needs (rent, utilities) bounded within 50% of monthly income.");
        dos.push("Switch regular investments to direct mutual funds to reduce recurring expense ratios.");
        donts.push("Do not allow flexible Wants (entertainment, dining) to slide past the 30% margin.");
        donts.push("Never skip monthly reviews of automated subscription payments.");
        donts.push("Don't begin investing in equities without an emergency cushion of 3 months.");
      }
    }
    // 5. Intent: General checkup / Greetings
    else {
      if (isHinglish) {
        summary = `Hi! Main aapka **AI Wealth Advisor** hoon. Aapke transactions (total ${transactions.length}), budgets (${budgets.length}) aur active goals (${goals.length}) check kiye hain. Cash flow balance ₹${netFlow.toLocaleString()} hai. Mujhse financial suggestions ke liye koi bhi query poochein (e.g. *'kharcha kam kaise karein?'*).`;
        dos.push("Daily transaction entries ko consistent and categorized rakhein.");
        dos.push("Month ke shuruat me budgets create karke limit monitor karein.");
        dos.push("Financial parameters check karne ke liye weekly diagnostics trace run karein.");
        donts.push("Transaction ledger ko manually update karna lambe samay tak delay na karein.");
        donts.push("Envelope warnings aur threshold alerts ko bina review kiye cancel na karein.");
        donts.push("Active goals progression ko zero savings rate ke saath pending na chhodein.");
      } else {
        summary = `Hello! I am your **AI Wealth Advisor**. I've indexed your transactions (${transactions.length} items), active budgets (${budgets.length} envelopes), and goals (${goals.length} milestones). Your net monthly cash balance is ₹${netFlow.toLocaleString()} (Savings rate: ${savingsRate}%). How can I guide you today?`;
        dos.push("Maintain a clean transaction journal with descriptive categories.");
        dos.push("Review and update envelope budget limit values at the start of each month.");
        dos.push("Run a diagnostics pipeline check weekly to view performance indices.");
        donts.push("Avoid delaying transaction records as it skews real-time advice summaries.");
        donts.push("Do not ignore warnings when category utilization crosses the 75% threshold.");
        donts.push("Do not skip compounding contributions even in months with tighter net cash.");
      }
    }

    // Safeguard lists lengths
    while (dos.length < 3) {
      dos.push(isHinglish ? "Salary aate hi savings automate karein." : "Automate savings allocations immediately upon payroll credits.");
    }
    while (donts.length < 3) {
      donts.push(isHinglish ? "Bina budget limit check kiye wants par spend na karein." : "Do not exceed defined envelope limits on flexible wants.");
    }

    const preprocessedQuery = this.tokenize(queryText);
    const payloadCharLength = JSON.stringify({ transactions, budgets, goals }).length;

    const trace: PipelineTrace = {
      phase1_query_preprocessing: {
        raw_query: queryText,
        tokens: preprocessedQuery
      },
      phase2_document_retrieval: {
        algorithm: "BM25 Vector Space Search",
        average_doc_length: bm25Trace.average_doc_length,
        corpus_size: bm25Trace.corpus_size,
        term_frequencies: bm25Trace.term_frequencies,
        document_frequencies: bm25Trace.document_frequencies,
        scores: bm25Trace.scores,
        selected_docs: bm25Trace.selected_docs
      },
      phase3_context_compilation: {
        transactions_count: transactions.length,
        budgets_count: budgets.length,
        goals_count: goals.length,
        income,
        expense,
        savings,
        net_flow: netFlow,
        savings_rate: savingsRate,
        payload_char_length: payloadCharLength
      },
      phase4_reasoning_engine: {
        type: "Local Analytical Reasoning Engine",
        latency_ms: Date.now() - startTime,
        detected_intent: detectedIntent
      },
      phase5_output_validation: {
        status: "SUCCESS",
        parsed_keys: ["dos", "donts", "summary"]
      }
    };

    return {
      dos: dos.slice(0, 3),
      donts: donts.slice(0, 3),
      summary,
      trace
    };
  }

  // 4. Remote Gemini LLM Response Generator
  public static async queryGeminiRAG(
    queryText: string,
    apiKey: string,
    transactions: Transaction[],
    budgets: Budget[],
    goals: Goal[],
    retrievedDocs: KnowledgeDoc[],
    bm25Trace: any
  ): Promise<AdvisorResponse> {
    const startTime = Date.now();
    const queryTokens = this.tokenize(queryText);

    let income = 0;
    let expense = 0;
    let savings = 0;
    transactions.forEach(t => {
      if (t.type === "INCOME") income += t.amount.amount;
      else if (t.type === "EXPENSE") expense += t.amount.amount;
      else if (t.type === "SAVINGS" || t.type === "INVESTMENT") savings += t.amount.amount;
    });

    const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;
    const netFlow = income - expense - savings;

    const budgetsText = budgets.map(b => {
      const spent = transactions
        .filter(t => t.categoryId === b.categoryId && t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount.amount, 0);
      return `- Category: ${b.categoryId}, Limit: ₹${b.limitAmount.amount}, Spent: ₹${spent}`;
    }).join("\n");

    const goalsText = goals.map(g => {
      return `- Goal: ${g.title}, Target: ₹${g.targetAmount.amount}, Saved: ₹${g.currentAmount.amount} (${g.getProgressPercentage()}% Completed)`;
    }).join("\n");

    const recentTxsText = transactions.slice(0, 10).map(t => {
      return `- Date: ${t.date.toISOString().split("T")[0]}, Title: ${t.title}, Type: ${t.type}, Category: ${t.categoryId}, Amount: ₹${t.amount.amount}`;
    }).join("\n");

    const retrievedKbText = retrievedDocs.map(doc => `[Source: ${doc.title}]\n${doc.content}`).join("\n\n");

    const prompt = `
You are FinTrack AI Advisor, a Principal Staff Financial Engineer. 
Analyze the user's financial snapshot, combine it with the retrieved knowledge base heuristics, and answer the user query: "${queryText}".

--- RETRIEVED KNOWLEDGE BASE contexto ---
${retrievedKbText}

--- USER FINANCIAL SNAPSHOT DATABASE ---
- Income this month: ₹${income}
- Expenses this month: ₹${expense}
- Savings this month: ₹${savings}
- Active Budgets Limits:
${budgetsText || "No budgets set."}
- Active Savings Goals:
${goalsText || "No goals set."}
- Recent Transaction Ledger entries:
${recentTxsText || "No transactions recorded."}

--- RESPONSE FORMAT RULES ---
You MUST respond using a strict JSON format with these exact three keys. Do NOT include markdown blocks around JSON or any other text prefix:
{
  "dos": [
    "Specific, quantitative action item based on their data 1 (e.g. state exact rupee values to save/budget)",
    "Specific, quantitative action item based on their data 2",
    "Specific, quantitative action item based on their data 3"
  ],
  "donts": [
    "Specific bad habit or budget tension point to avoid 1 (e.g. reference a category envelope breach)",
    "Specific bad habit or budget tension point to avoid 2",
    "Specific bad habit or budget tension point to avoid 3"
  ],
  "summary": "Professional, principal-level synthesis of their current health (max 2 sentences)."
}
`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini Server Error: ${response.statusText}`);
    }

    const json = await response.json();
    const textResponse = json.candidates[0].content.parts[0].text;
    const cleanData = JSON.parse(textResponse.trim());

    const payloadCharLength = JSON.stringify({ transactions, budgets, goals }).length + prompt.length;

    const trace: PipelineTrace = {
      phase1_query_preprocessing: {
        raw_query: queryText,
        tokens: queryTokens
      },
      phase2_document_retrieval: {
        algorithm: "BM25 Vector Space Search",
        average_doc_length: bm25Trace.average_doc_length,
        corpus_size: bm25Trace.corpus_size,
        term_frequencies: bm25Trace.term_frequencies,
        document_frequencies: bm25Trace.document_frequencies,
        scores: bm25Trace.scores,
        selected_docs: bm25Trace.selected_docs
      },
      phase3_context_compilation: {
        transactions_count: transactions.length,
        budgets_count: budgets.length,
        goals_count: goals.length,
        income,
        expense,
        savings,
        net_flow: netFlow,
        savings_rate: savingsRate,
        payload_char_length: payloadCharLength
      },
      phase4_reasoning_engine: {
        type: "Google Gemini 1.5 Flash API",
        latency_ms: Date.now() - startTime,
        detected_intent: "Generative Context Synthesis"
      },
      phase5_output_validation: {
        status: "SUCCESS",
        parsed_keys: Object.keys(cleanData)
      }
    };

    return {
      dos: cleanData.dos,
      donts: cleanData.donts,
      summary: cleanData.summary,
      trace
    };
  }

  // 5. Helper to construct prompt for local lightweight T5 LLM model
  public static buildLocalLlmPrompt(
    queryText: string,
    transactions: Transaction[],
    budgets: Budget[],
    goals: Goal[],
    retrievedDocs: KnowledgeDoc[]
  ): string {
    let income = 0;
    let expense = 0;
    let savings = 0;
    transactions.forEach(t => {
      if (t.type === "INCOME") income += t.amount.amount;
      else if (t.type === "EXPENSE") expense += t.amount.amount;
      else if (t.type === "SAVINGS" || t.type === "INVESTMENT") savings += t.amount.amount;
    });

    const budgetsText = budgets.map(b => {
      const spent = transactions
        .filter(t => t.categoryId === b.categoryId && t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount.amount, 0);
      return `- ${b.categoryId} Limit: ₹${b.limitAmount.amount}, Spent: ₹${spent}`;
    }).join("\n");

    const goalsText = goals.map(g => {
      return `- Goal: ${g.title}, Target: ₹${g.targetAmount.amount}, Saved: ₹${g.currentAmount.amount}`;
    }).join("\n");

    const retrievedKbText = retrievedDocs.map(doc => `- ${doc.title}: ${doc.content}`).join("\n");

    return `Instructions: Analyze the user's financial details and retrieved context, then answer the query. You must format your response exactly using "DO:", "DONT:", and "SUMMARY:" labels.

Context:
${retrievedKbText}

User Data:
Income: ₹${income}, Expenses: ₹${expense}, Savings: ₹${savings}
Budgets:
${budgetsText || "None"}
Goals:
${goalsText || "None"}

Query: ${queryText}

Format:
DO: [Action item 1]
DO: [Action item 2]
DO: [Action item 3]
DONT: [Avoid item 1]
DONT: [Avoid item 2]
DONT: [Avoid item 3]
SUMMARY: [Short assessment]`;
  }

  // 6. Parser helper to extract structured fields from Local LLM response
  public static parseLocalLlmResponse(
    text: string, 
    fallback: AdvisorResponse
  ): Omit<AdvisorResponse, "trace"> {
    const lines = text.split("\n");
    const dos: string[] = [];
    const donts: string[] = [];
    let summary = "";

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.toUpperCase().startsWith("DO:")) {
        const val = trimmed.substring(3).trim().replace(/^\[|\]$/g, "");
        if (val) dos.push(val);
      } else if (trimmed.toUpperCase().startsWith("DONT:") || trimmed.toUpperCase().startsWith("DON'T:")) {
        const colonIdx = trimmed.indexOf(":");
        const val = trimmed.substring(colonIdx + 1).trim().replace(/^\[|\]$/g, "");
        if (val) donts.push(val);
      } else if (trimmed.toUpperCase().startsWith("SUMMARY:")) {
        summary = trimmed.substring(8).trim().replace(/^\[|\]$/g, "");
      }
    });

    // Clean outputs: if we got less than 3, fill with fallback/analytical values
    while (dos.length < 3) {
      dos.push(fallback.dos[dos.length] || "Pay yourself first: Automate savings deposits directly to goals on pay day.");
    }
    while (donts.length < 3) {
      donts.push(fallback.donts[donts.length] || "Avoid consumer debt: Never carry credit balances for wants.");
    }
    if (!summary) {
      summary = fallback.summary;
    }

    return {
      dos: dos.slice(0, 3),
      donts: donts.slice(0, 3),
      summary
    };
  }

  // 7. Local Ollama LLM Response Generator
  public static async queryOllamaRAG(
    queryText: string,
    endpointUrl: string,
    modelName: string,
    transactions: Transaction[],
    budgets: Budget[],
    goals: Goal[],
    retrievedDocs: KnowledgeDoc[],
    bm25Trace: any
  ): Promise<AdvisorResponse> {
    const startTime = Date.now();
    const queryTokens = this.tokenize(queryText);

    let income = 0;
    let expense = 0;
    let savings = 0;
    transactions.forEach(t => {
      if (t.type === "INCOME") income += t.amount.amount;
      else if (t.type === "EXPENSE") expense += t.amount.amount;
      else if (t.type === "SAVINGS" || t.type === "INVESTMENT") savings += t.amount.amount;
    });

    const budgetsText = budgets.map(b => {
      const spent = transactions
        .filter(t => t.categoryId === b.categoryId && t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount.amount, 0);
      return `- Category: ${b.categoryId}, Limit: ₹${b.limitAmount.amount}, Spent: ₹${spent}`;
    }).join("\n");

    const goalsText = goals.map(g => {
      return `- Goal: ${g.title}, Target: ₹${g.targetAmount.amount}, Saved: ₹${g.currentAmount.amount}`;
    }).join("\n");

    const retrievedKbText = retrievedDocs.map(doc => `[Source: ${doc.title}]\n${doc.content}`).join("\n\n");

    const systemPrompt = `You are FinTrack AI Advisor, a Principal Staff Financial Engineer. 
Analyze the user's financial snapshot, combine it with the retrieved knowledge base heuristics, and generate structured financial suggestions.
You MUST format your output exactly as:
DO: [Action item 1]
DO: [Action item 2]
DO: [Action item 3]
DONT: [Avoid item 1]
DONT: [Avoid item 2]
DONT: [Avoid item 3]
SUMMARY: [Short assessment of overall financial health]`;

    const userPrompt = `Context:
${retrievedKbText}

User Data:
Income: ₹${income}, Expenses: ₹${expense}, Savings: ₹${savings}
Budgets:
${budgetsText || "None"}
Goals:
${goalsText || "None"}

Query: ${queryText}`;

    const endpoint = `${endpointUrl.trim().replace(/\/$/, "")}/api/chat`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName.trim(),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        stream: false,
        options: {
          temperature: 0.1
        }
      })
    });

    if (!response.ok) {
      let errMsg = response.statusText;
      try {
        const responseClone = response.clone();
        const errJson = await responseClone.json();
        if (errJson.error) {
          errMsg = errJson.error;
        }
      } catch (e) {
        try {
          const errText = await response.text();
          if (errText) errMsg = errText;
        } catch (_) {}
      }
      throw new Error(`Ollama Server Error: ${errMsg}`);
    }

    const json = await response.json();
    const responseText = json.message?.content || "";

    const fallbackResponse = this.calculateLocalInsights(queryText, transactions, budgets, goals, retrievedDocs, bm25Trace);
    const parsed = this.parseLocalLlmResponse(responseText, fallbackResponse);

    const payloadCharLength = JSON.stringify({ transactions, budgets, goals }).length + systemPrompt.length + userPrompt.length;

    const trace: PipelineTrace = {
      phase1_query_preprocessing: {
        raw_query: queryText,
        tokens: queryTokens
      },
      phase2_document_retrieval: {
        algorithm: "BM25 Vector Space Search",
        average_doc_length: bm25Trace.average_doc_length,
        corpus_size: bm25Trace.corpus_size,
        term_frequencies: bm25Trace.term_frequencies,
        document_frequencies: bm25Trace.document_frequencies,
        scores: bm25Trace.scores,
        selected_docs: bm25Trace.selected_docs
      },
      phase3_context_compilation: {
        transactions_count: transactions.length,
        budgets_count: budgets.length,
        goals_count: goals.length,
        income,
        expense,
        savings,
        net_flow: income - expense - savings,
        savings_rate: income > 0 ? Math.round((savings / income) * 100) : 0,
        payload_char_length: payloadCharLength
      },
      phase4_reasoning_engine: {
        type: `Local Ollama (${modelName})`,
        latency_ms: Date.now() - startTime,
        detected_intent: fallbackResponse.trace.phase4_reasoning_engine.detected_intent
      },
      phase5_output_validation: {
        status: "SUCCESS",
        parsed_keys: ["dos", "donts", "summary"]
      }
    };

    return {
      dos: parsed.dos,
      donts: parsed.donts,
      summary: parsed.summary,
      trace
    };
  }
}
