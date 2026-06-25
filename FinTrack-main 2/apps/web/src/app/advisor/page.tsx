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
  KnowledgeDoc,
  PipelineTrace,
  AdvisorResponse
} from "../../application/services/rag-service";
import { useUser } from "@clerk/nextjs";
import {
  Sparkles,
  Search,
  Settings,
  KeyRound,
  Database,
  ArrowUpRight,
  Target,
  Wallet,
  Activity,
  Send,
  HelpCircle,
  Clock,
  LayoutGrid,
  Info,
  Layers,
  ChevronDown,
  BookOpen
} from "lucide-react";

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
  { label: "Analyze Food Spends", prompt: "Analyze my food spending habits and delivery leakage" },
  { label: "Kharcha kam kaise karein?", prompt: "Kharcha kam kaise karein aur delivery leaks kaise rokein?" },
  { label: "Goals Timeline pacing", prompt: "How can I accelerate saving for my target goals?" },
  { label: "MacBook savings kab hogi?", prompt: "MacBook ke liye saving kab tak hogi?" },
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
                  className={`font-black ${isUserMessage ? "text-white" : "text-slate-900"}`}
                >
                  {part}
                </strong>
              );
            }
            return part;
          })}
          {idx === lines.length - 1 && indexRef.current < words.length && !isUserMessage && (
            <span className="inline-block w-1.5 h-3.5 bg-[#6D5DFC] ml-1 animate-pulse" />
          )}
        </p>
      );
    });
  };

  return <>{formatText(displayedText)}</>;
};

export default function AIAdvisorPage() {
  const { user } = useUser();
  const userId = user?.id || "user1";

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

    setMessages([
      {
        id: "welcome",
        sender: "assistant",
        timestamp: new Date(),
        content: "Hello! Main aapka AI Wealth Advisor hoon. Main aapke transactions, budgets aur savings goals ko analyze karke dynamic financial diagnostics aur suggestions de sakta hoon.\n\nAap mujhse English ya Hinglish me kuch bhi pooch sakte hain, jaise:\n- *'kharcha kam kaise karein?'*\n- *'macbook ke liye saving kab tak hogi?'*\n- *'budget status check karo'*"
      }
    ]);
  }, [userId]);

  // Auto-scroll chat list to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  useEffect(() => {
    if (reasoningMode === "local-llm" && !modelReady && !modelLoading) {
      initLlmWorker();
    }
  }, [reasoningMode, modelReady, modelLoading]);

  const loadDataContext = async () => {
    const txs = await txRepo.searchTransactions(userId, "");
    const bgs = await bgRepo.findByUserAndMonth(userId, 6, 2026);
    const gls = await glRepo.findByUserId(userId);
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

  const handleQueryRAG = async (quickPrompt?: string) => {
    const activeQuery = quickPrompt || query;
    if (!activeQuery.trim()) return;

    setLoading(true);
    setQuery("");

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      timestamp: new Date(),
      content: activeQuery
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const { docs: retrieved, traceLog: bm25Trace } = RagService.retrieveRelevantKnowledge(activeQuery);
      setRetrievedDocs(retrieved);

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
      case "local-diagnostics": return "⚡ Instant Engine";
      case "ollama": return "🦙 Ollama Local";
      case "local-llm": return "📦 WASM LLM";
      case "gemini": return "🤖 Gemini Cloud";
      default: return "Reasoning Engine";
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-hidden bg-[#F7F8FC] select-none">
      
      {/* Split Workspace */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Left Column: Conversation History */}
        <aside className="w-64 border-r border-[#E9ECF5] bg-white hidden lg:flex flex-col p-4 space-y-4 shrink-0">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider px-2">
            Advisor History
          </span>
          <div className="flex-1 space-y-1 overflow-y-auto">
            <div className="flex items-center gap-3 p-2.5 bg-[#F7F8FC] rounded-xl border border-[#E9ECF5] cursor-pointer">
              <Clock className="w-4 h-4 text-[#6D5DFC]" />
              <div className="text-left truncate min-w-0">
                <span className="block font-bold text-xs text-[#0A0D14] truncate">Active Session Context</span>
                <span className="block text-[9px] text-slate-400 mt-0.5">Real-time chat active</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Column: Chat Client */}
        <div className="flex-grow flex flex-col h-full bg-[#F7F8FC]/50 relative overflow-hidden min-h-0">
          
          {/* Top Status Bar */}
          <div className="px-6 py-3 bg-white border-b border-[#E9ECF5] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00C875] animate-pulse"></div>
              <span className="text-[10px] font-black text-[#0A0D14] tracking-wide uppercase uppercase">
                AI Wealth Advisor (Hinglish/English)
              </span>
            </div>
            
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="px-3.5 py-1.5 bg-[#F7F8FC] hover:bg-[#E9ECF5] border border-[#E9ECF5] rounded-xl text-slate-500 hover:text-[#0A0D14] text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" /> Settings Panel
            </button>
          </div>

          {/* Messages scroll content */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6 min-h-0">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-3.5 max-w-[85%] ${isUser ? "self-end ml-auto flex-row-reverse" : "self-start mr-auto"}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm ${
                    isUser ? "bg-[#6D5DFC] text-white" : "bg-[#F7F8FC] border border-[#E9ECF5] text-[#6D5DFC]"
                  }`}>
                    {isUser ? "U" : "🤖"}
                  </div>

                  <div className="space-y-1">
                    <div className={`px-4 py-3 rounded-2xl shadow-sm text-xs leading-relaxed border ${
                      isUser 
                        ? "bg-[#6D5DFC] text-white border-[#6D5DFC]/80 rounded-tr-none" 
                        : "bg-white text-slate-800 border-[#E9ECF5] rounded-tl-none"
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

                      {/* Expandable Trace Log */}
                      {!isUser && completedMessages[msg.id] && msg.trace && (
                        <div className="mt-4 pt-3 border-t border-slate-100/60 animate-fade-in">
                          <details className="group">
                            <summary className="list-none flex items-center gap-1.5 text-[9px] font-black text-slate-400 cursor-pointer hover:text-slate-600 select-none">
                              <Database className="w-3.5 h-3.5 text-slate-400" />
                              <span>BM25 RAG Pipeline Trace</span>
                              <span className="bg-[#F7F8FC] border border-[#E9ECF5] px-1.5 py-0.5 rounded text-[8px] font-bold text-slate-500 ml-2">
                                {msg.trace.phase4_reasoning_engine.latency_ms} ms
                              </span>
                            </summary>
                            <div className="mt-2.5 p-3 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl font-mono text-[9px] text-slate-500 space-y-2.5 overflow-x-auto max-h-48">
                              <div>
                                <span className="text-[#6D5DFC] font-bold uppercase tracking-wider text-[8px]">Token Matches</span>
                                <div>{JSON.stringify(msg.trace.phase1_query_preprocessing.tokens)}</div>
                              </div>
                              <div>
                                <span className="text-[#6D5DFC] font-bold uppercase tracking-wider text-[8px]">BM25 Scores</span>
                                <div>{JSON.stringify(msg.trace.phase2_document_retrieval.selected_docs)}</div>
                              </div>
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                    
                    <span className="block text-[8px] text-slate-400 font-extrabold px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3.5 max-w-[85%] self-start mr-auto animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-[#F7F8FC] border border-[#E9ECF5] flex items-center justify-center text-[10px] text-[#6D5DFC] font-bold shrink-0">
                  🤖
                </div>
                <div className="bg-white border border-[#E9ECF5] px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1 h-9">
                  <span className="w-1.5 h-1.5 bg-[#6D5DFC] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#6D5DFC] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#6D5DFC] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap gap-2 px-6 py-2 bg-white border-t border-[#E9ECF5] overflow-x-auto shrink-0">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleQueryRAG(qp.prompt)}
                disabled={loading}
                className="px-3 py-1.5 bg-[#F7F8FC] border border-[#E9ECF5] hover:border-[#6D5DFC]/40 hover:bg-[#6D5DFC]/5 text-slate-500 hover:text-[#6D5DFC] rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Text Input Console */}
          <div className="p-4 bg-white border-t border-[#E9ECF5] shrink-0">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <input
                type="text"
                placeholder="Ask: Which category wastes the most money?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading && query.trim()) {
                    handleQueryRAG();
                  }
                }}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-[#F7F8FC] border border-[#E9ECF5] focus:border-[#6D5DFC] rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#6D5DFC] focus:bg-white text-[#0A0D14] transition-all font-semibold shadow-inner"
              />
              <button
                onClick={() => handleQueryRAG()}
                disabled={loading || !query.trim()}
                className="p-3 bg-[#6D5DFC] hover:bg-[#8B7CFF] text-white rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer disabled:bg-slate-200 disabled:shadow-none disabled:cursor-not-allowed w-11 h-11 shrink-0 active:scale-95"
              >
                <Send className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Insights & RAG Engines Configuration */}
        {sidebarOpen && (
          <aside className="w-80 h-full border-l border-[#E9ECF5] bg-white overflow-y-auto hidden md:flex flex-col p-6 space-y-6 shrink-0 shadow-inner">
            
            {/* Reasoning settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E9ECF5] pb-3">
                <Settings className="w-4 h-4 text-slate-400" />
                <h3 className="font-extrabold text-[#0A0D14] text-xs uppercase tracking-wider">Reasoning Target</h3>
              </div>
              
              <div className="space-y-4 text-xs font-semibold text-slate-600">
                <select
                  value={reasoningMode}
                  onChange={(e) => setReasoningMode(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-[#E9ECF5] rounded-xl text-[#0A0D14] focus:outline-none focus:ring-1 focus:ring-[#6D5DFC] cursor-pointer"
                >
                  <option value="local-diagnostics">⚡ Instant Diagnostics Engine</option>
                  <option value="ollama">🦙 Local Ollama Service</option>
                  <option value="local-llm">📦 Local WebAssembly LLM</option>
                  <option value="gemini">🤖 Cloud Gemini flash</option>
                </select>

                {reasoningMode === "gemini" && (
                  <form onSubmit={handleSaveKey} className="space-y-3 pt-2 border-t border-slate-100">
                    <p className="text-slate-400 leading-relaxed text-[10px]">
                      Provide your Google AI Studio API Key. Saved locally in browser storage.
                    </p>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Gemini API Key</label>
                      <input
                        type="password"
                        placeholder="AIzaSy..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl text-[#0A0D14] focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl transition-all cursor-pointer text-center text-[10px]"
                    >
                      Save Key
                    </button>
                  </form>
                )}

                {reasoningMode === "local-llm" && (
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <p className="text-slate-400 leading-relaxed text-[10px]">
                      Runs Qwen1.5-0.5B locally inside the browser using WebAssembly.
                    </p>
                    {modelLoading && (
                      <div className="space-y-2 p-3 bg-[#6D5DFC]/5 border border-[#6D5DFC]/10 rounded-xl">
                        <div className="flex justify-between font-extrabold text-[#6D5DFC] text-[10px]">
                          <span className="truncate max-w-[150px]">{currentLoadingFile}</span>
                          <span>{modelProgress}%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#6D5DFC] transition-all duration-300" style={{ width: `${modelProgress}%` }} />
                        </div>
                      </div>
                    )}
                    {modelReady && (
                      <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-[#00C875] text-[10px]">
                        🟢 WASM LLM Ready Offline
                      </div>
                    )}
                    {!modelReady && !modelLoading && (
                      <button
                        onClick={initLlmWorker}
                        className="w-full py-2 bg-[#6D5DFC] hover:bg-[#8B7CFF] text-white font-extrabold rounded-xl transition-all text-center text-[10px]"
                      >
                        Download & Init (350MB)
                      </button>
                    )}
                  </div>
                )}

                {reasoningMode === "ollama" && (
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <p className="text-slate-400 leading-relaxed text-[10px]">
                      Connects directly to an Ollama server running locally on your Mac.
                    </p>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Ollama API URL</label>
                      <input
                        type="text"
                        value={ollamaUrl}
                        onChange={(e) => setOllamaUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl text-[#0A0D14] focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Health Snapshot Panel */}
            <div className="space-y-4 pt-4 border-t border-[#E9ECF5]">
              <div className="flex items-center gap-2 border-b border-[#E9ECF5] pb-3">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <h3 className="font-extrabold text-[#0A0D14] text-xs uppercase tracking-wider">Live Context</h3>
              </div>
              <div className="space-y-3.5 text-xs font-semibold text-slate-600">
                <div className="p-3 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#6D5DFC]" />
                    <span>Active Envelopes</span>
                  </div>
                  <span className="font-bold text-[#0A0D14]">{budgets.length}</span>
                </div>
                <div className="p-3 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#6D5DFC]" />
                    <span>Compounding Goals</span>
                  </div>
                  <span className="font-bold text-[#0A0D14]">{goals.length}</span>
                </div>
              </div>
            </div>

          </aside>
        )}

      </div>

    </div>
  );
}
