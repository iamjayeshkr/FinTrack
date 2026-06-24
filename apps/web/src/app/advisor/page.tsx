"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  LocalStorageTransactionRepository,
  LocalStorageBudgetRepository,
  LocalStorageGoalRepository,
} from "../../infrastructure/db/local-storage-repositories";
import { Transaction } from "../../domain/entities/transaction";
import { Budget } from "../../domain/entities/budget";
import { Goal } from "../../domain/entities/goal";
import {
  RagService,
  FINANCIAL_KNOWLEDGE_BASE,
  KnowledgeDoc,
  PipelineTrace,
  AdvisorResponse
} from "../../application/services/rag-service";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  timestamp: Date;
  content: string;
  dos?: string[];
  donts?: string[];
  trace?: PipelineTrace;
}

const QUICK_PROMPTS = [
  { label: "🔍 Analyze Food Spends", prompt: "Analyze my food spending habits and delivery leakage" },
  { label: "₹ Kharcha kam kaise karein?", prompt: "Kharcha kam kaise karein aur delivery leaks kaise rokein?" },
  { label: "📈 Goals Timeline pacing", prompt: "How can I accelerate saving for my target goals?" },
  { label: "🎯 MacBook savings kab hogi?", prompt: "MacBook ke liye saving kab tak hogi?" },
  { label: "⚖️ Evaluate 50/30/20 Rule", prompt: "Evaluate my current savings rate against the 50/30/20 rule" },
  { label: "📊 Budget limits status check", prompt: "Check if any category budget limits are breached or high tension" }
];

const StreamingText = ({ 
  text, 
  isUserMessage, 
  onComplete,
  onWordAdded
}: { 
  text: string; 
  isUserMessage: boolean; 
  onComplete?: () => void;
  onWordAdded?: () => void;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const words = useMemo(() => text.split(" "), [text]);
  const indexRef = useRef(0);

  const onCompleteRef = useRef(onComplete);
  const onWordAddedRef = useRef(onWordAdded);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onWordAddedRef.current = onWordAdded;
  }, [onComplete, onWordAdded]);

  useEffect(() => {
    if (isUserMessage) {
      setDisplayedText(text);
      onCompleteRef.current?.();
      return;
    }

    setDisplayedText("");
    indexRef.current = 0;
    
    const interval = setInterval(() => {
      if (indexRef.current < words.length) {
        setDisplayedText((prev) => (prev ? prev + " " + words[indexRef.current] : words[indexRef.current]));
        indexRef.current++;
        onWordAddedRef.current?.();
      } else {
        clearInterval(interval);
        onCompleteRef.current?.();
      }
    }, 45);

    return () => clearInterval(interval);
  }, [text, words, isUserMessage]);

  const formatText = (raw: string) => {
    if (!raw) return null;
    const lines = raw.split("\n");
    return lines.map((line, idx) => {
      const parts = line.split(/\*\*([^*]+)\*\*/g);
      return (
        <p key={idx} className={idx > 0 ? "mt-1.5" : ""}>
          {parts.map((part, pIdx) => {
            if (pIdx % 2 === 1) {
              return (
                <strong 
                  key={pIdx} 
                  className={`font-bold ${isUserMessage ? "text-white" : "text-slate-900"}`}
                >
                  {part}
                </strong>
              );
            }
            return part;
          })}
          {idx === lines.length - 1 && indexRef.current < words.length && !isUserMessage && (
            <span className="inline-block w-1.5 h-3.5 bg-indigo-600 ml-1 animate-pulse" />
          )}
        </p>
      );
    });
  };

  return <>{formatText(displayedText)}</>;
};

export default function AIAdvisorPage() {
  const [apiKey, setApiKey] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [retrievedDocs, setRetrievedDocs] = useState<KnowledgeDoc[]>([]);
  const [advisorResponse, setAdvisorResponse] = useState<AdvisorResponse | null>(null);
  const [traceLog, setTraceLog] = useState<PipelineTrace | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  // Reasoning Engine states
  const [reasoningMode, setReasoningMode] = useState<"gemini" | "local-llm" | "local-diagnostics" | "ollama">("local-diagnostics");
  const [modelLoading, setModelLoading] = useState(false);
  const [modelProgress, setModelProgress] = useState(0);
  const [modelReady, setModelReady] = useState(false);
  const [currentLoadingFile, setCurrentLoadingFile] = useState("");

  // Ollama configuration states
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [ollamaModel, setOllamaModel] = useState("llama3.2");

  // Chat conversation states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedMessages, setCompletedMessages] = useState<Record<string, boolean>>({
    "welcome": true
  });

  const workerRef = useRef<Worker | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const txRepo = useMemo(() => new LocalStorageTransactionRepository(), []);
  const bgRepo = useMemo(() => new LocalStorageBudgetRepository(), []);
  const glRepo = useMemo(() => new LocalStorageGoalRepository(), []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("fintrack_gemini_key") || "";
      setApiKey(savedKey);
      if (savedKey) {
        setReasoningMode("gemini");
      }
    }
    loadDataContext();

    // Initialize welcome message on client side to prevent Next.js SSR hydration date conflicts
    setMessages([
      {
        id: "welcome",
        sender: "assistant",
        timestamp: new Date(),
        content: "Hello! Main aapka AI Wealth Advisor hoon. Main aapke transactions, budgets aur savings goals ko analyze karke dynamic financial diagnostics aur suggestions de sakta hoon.\n\nAap mujhse English ya Hinglish me kuch bhi pooch sakte hain, jaise:\n- *'kharcha kam kaise karein?'*\n- *'macbook ke liye saving kab tak hogi?'*\n- *'budget status check karo'*"
      }
    ]);
  }, []);

  // Auto-scroll chat list to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Web Worker Cleanup on Unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // Auto initialize worker if local-llm is selected
  useEffect(() => {
    if (reasoningMode === "local-llm" && !modelReady && !modelLoading) {
      initLlmWorker();
    }
  }, [reasoningMode, modelReady, modelLoading]);

  const loadDataContext = async () => {
    const txs = await txRepo.searchTransactions("user1", "");
    const bgs = await bgRepo.findByUserAndMonth("user1", 6, 2026);
    const gls = await glRepo.findByUserId("user1");
    setTransactions(txs);
    setBudgets(bgs);
    setGoals(gls);
  };

  const initLlmWorker = () => {
    if (workerRef.current) return;

    setModelLoading(true);
    setModelProgress(0);
    setCurrentLoadingFile("Initializing worker...");

    try {
      const worker = new Worker(new URL("./llm.worker.ts", import.meta.url));

      worker.onmessage = (event) => {
        const { type, data, error } = event.data;
        if (type === "progress") {
          setCurrentLoadingFile(data.file || "Loading model files...");
          setModelProgress(Math.round(data.progress || 0));
        } else if (type === "ready") {
          setModelReady(true);
          setModelLoading(false);
          setCurrentLoadingFile("");
        } else if (type === "error") {
          console.error("[LLM Worker Load Error]", error);
          setModelLoading(false);
          alert(`Failed to load Local LLM. Falling back to local diagnostics. Error: ${error}`);
          setReasoningMode("local-diagnostics");
        }
      };

      worker.postMessage({ type: "load" });
      workerRef.current = worker;
    } catch (err: any) {
      console.error("Failed to instantiate Web Worker:", err);
      setModelLoading(false);
      alert(`Failed to instantiate Web Worker. Falling back to diagnostics. Error: ${err.message}`);
      setReasoningMode("local-diagnostics");
    }
  };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("fintrack_gemini_key", apiKey.trim());
      alert("Google Gemini API Key saved securely in your local browser state!");
    }
  };

  // Helper to handle message exchange with the Web Worker
  const runLlmInference = (prompt: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error("Local WebAssembly LLM worker is not active."));
        return;
      }

      const handleMessage = (e: MessageEvent) => {
        const { type, data, error } = e.data;
        if (type === "result") {
          workerRef.current?.removeEventListener("message", handleMessage);
          resolve(data);
        } else if (type === "error") {
          workerRef.current?.removeEventListener("message", handleMessage);
          reject(new Error(error));
        }
      };

      workerRef.current.addEventListener("message", handleMessage);
      workerRef.current.postMessage({ type: "generate", data: { prompt } });
    });
  };

  // Advanced RAG Generation Query
  const handleQueryRAG = async (quickPrompt?: string) => {
    const activeQuery = quickPrompt || query;
    if (!activeQuery.trim()) return;

    setLoading(true);
    setQuery("");

    // Append User Message to Chat
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      timestamp: new Date(),
      content: activeQuery
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      // 1. Retrieve Knowledge base documents using BM25 Relevance ranker
      const { docs: retrieved, traceLog: bm25Trace } = RagService.retrieveRelevantKnowledge(activeQuery);
      setRetrievedDocs(retrieved);

      // 2. Query Reasoning Engine
      let response: AdvisorResponse;

      if (reasoningMode === "local-diagnostics") {
        response = RagService.calculateLocalInsights(activeQuery, transactions, budgets, goals, retrieved, bm25Trace);
      } else if (reasoningMode === "local-llm") {
        if (!modelReady) {
          throw new Error("Local WebAssembly LLM is still downloading or initializing. Please wait.");
        }
        const startTime = Date.now();
        const prompt = RagService.buildLocalLlmPrompt(activeQuery, transactions, budgets, goals, retrieved);
        const rawResult = await runLlmInference(prompt);
        const fallbackResponse = RagService.calculateLocalInsights(activeQuery, transactions, budgets, goals, retrieved, bm25Trace);
        const parsed = RagService.parseLocalLlmResponse(rawResult, fallbackResponse);

        const payloadCharLength = JSON.stringify({ transactions, budgets, goals }).length + prompt.length;

        const trace: PipelineTrace = {
          phase1_query_preprocessing: {
            raw_query: activeQuery,
            tokens: RagService.tokenize(activeQuery)
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
            income: fallbackResponse.trace.phase3_context_compilation.income,
            expense: fallbackResponse.trace.phase3_context_compilation.expense,
            savings: fallbackResponse.trace.phase3_context_compilation.savings,
            net_flow: fallbackResponse.trace.phase3_context_compilation.net_flow,
            savings_rate: fallbackResponse.trace.phase3_context_compilation.savings_rate,
            payload_char_length: payloadCharLength
          },
          phase4_reasoning_engine: {
            type: "Local WebAssembly LLM",
            latency_ms: Date.now() - startTime,
            detected_intent: fallbackResponse.trace.phase4_reasoning_engine.detected_intent
          },
          phase5_output_validation: {
            status: "SUCCESS",
            parsed_keys: ["dos", "donts", "summary"]
          }
        };

        response = {
          dos: parsed.dos,
          donts: parsed.donts,
          summary: parsed.summary,
          trace
        };
      } else if (reasoningMode === "ollama") {
        response = await RagService.queryOllamaRAG(
          activeQuery,
          ollamaUrl || "http://localhost:11434",
          ollamaModel || "llama3.2",
          transactions,
          budgets,
          goals,
          retrieved,
          bm25Trace
        );
      } else {
        if (!apiKey.trim()) {
          alert("Gemini key is blank. Falling back to local diagnostics mode.");
          setReasoningMode("local-diagnostics");
          response = RagService.calculateLocalInsights(activeQuery, transactions, budgets, goals, retrieved, bm25Trace);
        } else {
          response = await RagService.queryGeminiRAG(activeQuery, apiKey.trim(), transactions, budgets, goals, retrieved, bm25Trace);
        }
      }

      // Append Assistant Message to Chat
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "assistant",
        timestamp: new Date(),
        content: response.summary,
        dos: response.dos,
        donts: response.donts,
        trace: response.trace
      };
      setMessages(prev => [...prev, assistantMsg]);
      setAdvisorResponse(response);
      setTraceLog(response.trace);
    } catch (err: any) {
      console.error(err);
      // Graceful fallback execution
      const { docs: retrieved, traceLog: bm25Trace } = RagService.retrieveRelevantKnowledge(activeQuery);
      const fallbackResponse = RagService.calculateLocalInsights(activeQuery, transactions, budgets, goals, retrieved, bm25Trace);
      
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "assistant",
        timestamp: new Date(),
        content: `Muje processing me error mili (Error: ${err.message}). Lekin analytical backup ke mutabik: ${fallbackResponse.summary}`,
        dos: fallbackResponse.dos,
        donts: fallbackResponse.donts,
        trace: fallbackResponse.trace
      };
      setMessages(prev => [...prev, assistantMsg]);
      setAdvisorResponse(fallbackResponse);
      setTraceLog(fallbackResponse.trace);
    } finally {
      setLoading(false);
    }
  };

  const getEngineBadge = (mode: string) => {
    switch (mode) {
      case "local-diagnostics": return "⚡ Instant Engine (<10ms)";
      case "ollama": return "🦙 Ollama local";
      case "local-llm": return "📦 WASM LLM local";
      case "gemini": return "🤖 Gemini Flash";
      default: return "Reasoning Engine";
    }
  };

  const formatMessageText = (text: string, isUserMessage: boolean) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const parts = line.split(/\*\*([^*]+)\*\*/g);
      return (
        <p key={idx} className={idx > 0 ? "mt-1.5" : ""}>
          {parts.map((part, pIdx) => {
            if (pIdx % 2 === 1) {
              return (
                <strong 
                  key={pIdx} 
                  className={`font-bold ${isUserMessage ? "text-white" : "text-slate-900"}`}
                >
                  {part}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-10px)] overflow-hidden bg-slate-50">
      
      {/* Top Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-indigo-100">
            💬
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">AI Wealth Chatbot</h1>
            <p className="text-[10px] text-slate-500 font-medium">
              Offline-first English & Hinglish Financial Diagnostics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Active reasoning mode badge */}
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active: {getEngineBadge(reasoningMode)}
          </span>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg flex items-center gap-1.5 transition-all text-xs font-semibold shadow-sm cursor-pointer"
            aria-label="Toggle settings panel"
          >
            ⚙️ <span className="hidden md:inline">{sidebarOpen ? "Hide Settings" : "Settings & RAG"}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace split panel */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Chat Panel */}
        <div className="flex-1 flex flex-col h-full bg-slate-50/50 relative overflow-hidden">
          
          {/* Messages scrollable area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 max-w-[85%] ${isUser ? "self-end ml-auto flex-row-reverse" : "self-start mr-auto"}`}
                >
                  {/* Avatar bubble */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${
                    isUser ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-700"
                  }`}>
                    {isUser ? "U" : "🤖"}
                  </div>

                  {/* Bubble Content */}
                  <div className="flex flex-col">
                    <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed border ${
                      isUser 
                        ? "bg-indigo-600 text-white border-indigo-700 rounded-tr-none" 
                        : "bg-white text-slate-800 border-slate-200/80 rounded-tl-none"
                    }`}>
                      <StreamingText
                        text={msg.content}
                        isUserMessage={isUser}
                        onComplete={() => {
                          setCompletedMessages((prev) => ({ ...prev, [msg.id]: true }));
                        }}
                        onWordAdded={() => {
                          chatEndRef.current?.scrollIntoView({ behavior: "auto" });
                        }}
                      />

                      {/* Action cards for Assistant messages */}
                      {!isUser && completedMessages[msg.id] && (msg.dos || msg.donts) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 animate-fadeIn">
                          {/* DOs List */}
                          {msg.dos && msg.dos.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                                <span>💡</span> Things to Do (DOs)
                              </h4>
                              <ul className="space-y-1.5">
                                {msg.dos.map((doItem, idx) => (
                                  <li key={idx} className="p-2.5 bg-emerald-50/50 border border-emerald-100/50 rounded-xl text-xs text-slate-700 flex gap-2 items-start leading-normal">
                                    <span className="text-emerald-500 font-bold text-sm shrink-0 leading-none">✓</span>
                                    <span>{doItem}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* DONTs List */}
                          {msg.donts && msg.donts.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-[10px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                                <span>⚠️</span> Avoid (DONTs)
                              </h4>
                              <ul className="space-y-1.5">
                                {msg.donts.map((dontItem, idx) => (
                                  <li key={idx} className="p-2.5 bg-rose-50/50 border border-rose-100/50 rounded-xl text-xs text-slate-700 flex gap-2 items-start leading-normal">
                                    <span className="text-rose-500 font-bold text-sm shrink-0 leading-none">✗</span>
                                    <span>{dontItem}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Collapsible pipeline trace inside Assistant message */}
                      {!isUser && completedMessages[msg.id] && msg.trace && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100/60 animate-fadeIn">
                          <details className="group">
                            <summary className="list-none flex items-center gap-1 text-[10px] font-bold text-slate-400 cursor-pointer select-none hover:text-slate-600 transition-colors">
                              <span>🛠️</span>
                              <span>Developer Trace ({msg.trace.phase4_reasoning_engine.type})</span>
                              <span className="text-[9px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded ml-2">
                                {msg.trace.phase4_reasoning_engine.latency_ms} ms
                              </span>
                              <span className="group-open:rotate-180 transition-transform text-[8px] ml-auto">▼</span>
                            </summary>
                            <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-[10px] font-mono text-slate-600 space-y-2.5 overflow-x-auto max-h-56">
                              <div>
                                <span className="text-indigo-600 font-bold uppercase tracking-wider text-[8px]">Phase 1: Preprocessing</span>
                                <div>Tokens: {JSON.stringify(msg.trace.phase1_query_preprocessing.tokens)}</div>
                              </div>
                              <div>
                                <span className="text-indigo-600 font-bold uppercase tracking-wider text-[8px]">Phase 2: RAG Doc Search</span>
                                <div>Matches: {JSON.stringify(msg.trace.phase2_document_retrieval.selected_docs)}</div>
                              </div>
                              <div>
                                <span className="text-indigo-600 font-bold uppercase tracking-wider text-[8px]">Phase 3: Snapshot Compiled</span>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-slate-500">
                                  <div>Income: ₹{msg.trace.phase3_context_compilation.income}</div>
                                  <div>Expense: ₹{msg.trace.phase3_context_compilation.expense}</div>
                                  <div>Net Balance: ₹{msg.trace.phase3_context_compilation.net_flow}</div>
                                  <div>Savings rate: {msg.trace.phase3_context_compilation.savings_rate}%</div>
                                </div>
                              </div>
                              <div>
                                <span className="text-indigo-600 font-bold uppercase tracking-wider text-[8px]">Phase 4: Reasoning Model</span>
                                <div>Intent: {msg.trace.phase4_reasoning_engine.detected_intent}</div>
                                <div>Lat: {msg.trace.phase4_reasoning_engine.latency_ms}ms</div>
                              </div>
                            </div>
                          </details>
                        </div>
                      )}
                    </div>

                    {/* Time label */}
                    <span className={`text-[9px] text-slate-400 mt-1 select-none font-medium ${isUser ? "self-end mr-1" : "self-start ml-1"}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Typing Loader animation */}
            {loading && (
              <div className="flex gap-3 max-w-[85%] self-start mr-auto animate-pulse">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shadow-sm shrink-0">
                  🤖
                </div>
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1 h-[38px]">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap gap-1.5 px-6 py-2 bg-slate-50/50 border-t border-slate-200/60 overflow-x-auto shrink-0 select-none">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleQueryRAG(qp.prompt)}
                disabled={loading}
                className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 text-slate-600 hover:text-indigo-700 rounded-lg text-[10px] font-semibold transition-all cursor-pointer shadow-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input text box container */}
          <div className="p-4 bg-white border-t border-slate-200 shrink-0">
            <div className="flex gap-2 max-w-5xl mx-auto">
              <input
                type="text"
                placeholder="Ask advisor: e.g. kharcha kam kaise karein?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading && query.trim()) {
                    handleQueryRAG();
                  }
                }}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-400 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-800 transition-all shadow-inner"
              />
              <button
                onClick={() => handleQueryRAG()}
                disabled={loading || !query.trim()}
                className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md hover:shadow-indigo-100 flex items-center justify-center cursor-pointer disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed w-11 h-11 shrink-0"
                aria-label="Send query"
              >
                <svg className="w-5 h-5 shrink-0 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar panel (Settings, keys, details) */}
        {sidebarOpen && (
          <aside className="w-80 h-full border-l border-slate-200 bg-white overflow-y-auto hidden md:flex flex-col p-6 space-y-6 shrink-0 shadow-inner">
            
            {/* Reasoning Engine Settings */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="text-sm">⚙️</span>
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Reasoning Target</h3>
              </div>
              
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <select
                    value={reasoningMode}
                    onChange={(e) => setReasoningMode(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-semibold shadow-sm"
                  >
                    <option value="local-diagnostics">Instant NLP Engine (&lt;10ms)</option>
                    <option value="ollama">Local Ollama Link (GPT-Quality)</option>
                    <option value="local-llm">Local WebAssembly LLM (WASM)</option>
                    <option value="gemini">Google Gemini 1.5 Flash (Cloud)</option>
                  </select>
                </div>

                {reasoningMode === "gemini" && (
                  <form onSubmit={handleSaveKey} className="space-y-3 pt-2 border-t border-slate-100">
                    <p className="text-slate-500 leading-relaxed text-[10px]">
                      Requires a Gemini API Key from Google AI Studio. Key is saved in local storage.
                    </p>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Google Gemini API Key</label>
                      <input
                        type="password"
                        placeholder="AIzaSy..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-all cursor-pointer shadow-sm text-center"
                    >
                      Save Key in Browser
                    </button>
                  </form>
                )}

                {reasoningMode === "local-llm" && (
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <p className="text-slate-500 leading-relaxed text-[10px]">
                      Runs **Qwen1.5-0.5B-Chat** (~350MB) locally in the browser using WebAssembly. Files are cached locally after downloading.
                    </p>
                    
                    {modelLoading && (
                      <div className="space-y-2 p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-lg">
                        <div className="flex justify-between font-bold text-indigo-900 text-[10px]">
                          <span className="truncate max-w-[150px]">{currentLoadingFile}</span>
                          <span>{modelProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 transition-all duration-300" 
                            style={{ width: `${modelProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {modelReady && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-850 font-bold text-[10px] flex items-center gap-1.5">
                        <span>🟢</span> Local WebAssembly LLM is ready offline.
                      </div>
                    )}

                    {!modelReady && !modelLoading && (
                      <button
                        onClick={initLlmWorker}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all cursor-pointer text-center shadow-sm"
                      >
                        Download & Init Model (~350MB)
                      </button>
                    )}
                  </div>
                )}

                {reasoningMode === "ollama" && (
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <p className="text-slate-500 leading-relaxed text-[10px]">
                      Queries a local **Ollama** server running on your Mac. Gives you high-speed, GPT-quality local inference for free!
                    </p>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Ollama API URL</label>
                      <input
                        type="text"
                        placeholder="http://localhost:11434"
                        value={ollamaUrl}
                        onChange={(e) => setOllamaUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Model Name</label>
                      <input
                        type="text"
                        placeholder="llama3.2"
                        value={ollamaModel}
                        onChange={(e) => setOllamaModel(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-600 leading-relaxed space-y-1.5">
                      <div className="font-bold text-slate-700">Setup Instructions:</div>
                      <div>1. Install Ollama: <code className="bg-slate-200 px-1 rounded text-[9px] font-mono">brew install ollama</code></div>
                      <div>2. Start and pull model:</div>
                      <code className="block bg-slate-800 text-slate-200 p-2 rounded text-[9px] whitespace-pre-wrap select-all font-mono">
                        ollama run llama3.2
                      </code>
                    </div>
                  </div>
                )}

                {reasoningMode === "local-diagnostics" && (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="p-2.5 bg-indigo-55/40 border border-indigo-100 rounded-lg text-indigo-950 font-bold text-[10px] flex items-center gap-1.5 leading-normal">
                      <span>🟢</span> Instant NLP local synthesizer is active for offline diagnostics under 100ms.
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* RAG Context Diagnostics Panel */}
            <section className="space-y-4 text-xs flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="text-sm">🔍</span>
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs">Context Diagnostics</h3>
              </div>
              
              <ul className="space-y-2.5 text-slate-600 select-none">
                <li className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-150">
                  <span className="font-semibold text-slate-700 text-[10px]">Knowledge base docs</span>
                  <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded text-[9px]">
                    {FINANCIAL_KNOWLEDGE_BASE.length} Indexed
                  </span>
                </li>
                <li className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-150">
                  <span className="font-semibold text-slate-700 text-[10px]">Active Ledger records</span>
                  <span className="bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded text-[9px]">
                    {transactions.length} items
                  </span>
                </li>
                <li className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-150">
                  <span className="font-semibold text-slate-700 text-[10px]">Budget envelopes</span>
                  <span className="bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded text-[9px]">
                    {budgets.length} envelopes
                  </span>
                </li>
                <li className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-150">
                  <span className="font-semibold text-slate-700 text-[10px]">Active Goals milestones</span>
                  <span className="bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded text-[9px]">
                    {goals.length} goals
                  </span>
                </li>
              </ul>

              {retrievedDocs.length > 0 && (
                <div className="pt-2 flex-1 flex flex-col min-h-0 overflow-hidden">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider">
                    Retrieved KB (BM25)
                  </div>
                  <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
                    {retrievedDocs.map(doc => (
                      <div 
                        key={doc.id} 
                        className="p-2 bg-indigo-50/40 border border-indigo-100/50 rounded-lg text-slate-700 text-[10px] leading-relaxed"
                      >
                        <div className="font-bold text-indigo-900 mb-0.5">🗂️ {doc.title}</div>
                        <div className="text-slate-500 font-medium text-[9px] truncate">{doc.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </aside>
        )}

      </div>
    </div>
  );
}
