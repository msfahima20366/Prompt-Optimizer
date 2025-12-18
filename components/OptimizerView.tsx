
import React, { useState, useEffect } from 'react';
import { UserContext } from '../prompts/collection';
import { generatePromptStream, SYSTEM_INSTRUCTION_META_PROMPT, auditPrompt, critiquePrompt } from '../services/geminiService';

interface OptimizerViewProps {
    userContexts: UserContext[];
    onSaveNewContext: () => void;
    onDeleteContext: (contextId: string) => void;
    onSavePrompt: (prompt: string) => void;
    addToHistory: (prompt: string) => void;
}

// --- Icons ---
const Icons = {
    Persona: () => <span className="text-2xl">🎭</span>,
    CoT: () => <span className="text-2xl">🧠</span>,
    FewShot: () => <span className="text-2xl">📚</span>,
    Negative: () => <span className="text-2xl">🚫</span>,
    Delimiters: () => <span className="text-2xl">🧱</span>,
    FactCheck: () => <span className="text-2xl">🛡️</span>,
    Format: () => <span className="text-2xl">📝</span>,
    Audience: () => <span className="text-2xl">👥</span>,
    Reflexion: () => <span className="text-2xl">🤔</span>,
    Tone: () => <span className="text-2xl">🎨</span>,
    Sparkles: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>,
    Play: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>,
    Check: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>,
    Copy: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    Magic: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
};

type StrategyId = 'persona' | 'cot' | 'few_shot' | 'negative' | 'delimiters' | 'fact_check' | 'format' | 'audience' | 'reflexion' | 'tone';

interface StrategyDef {
    id: StrategyId;
    title: string;
    icon: () => React.ReactNode;
}

const STRATEGIES: StrategyDef[] = [
    { id: 'persona', title: 'Persona', icon: Icons.Persona },
    { id: 'audience', title: 'Audience', icon: Icons.Audience },
    { id: 'tone', title: 'Tone', icon: Icons.Tone },
    { id: 'format', title: 'Format', icon: Icons.Format },
    { id: 'cot', title: 'Logic', icon: Icons.CoT },
    { id: 'delimiters', title: 'Structure', icon: Icons.Delimiters },
    { id: 'negative', title: 'Limits', icon: Icons.Negative },
    { id: 'fact_check', title: 'Safety', icon: Icons.FactCheck },
    { id: 'reflexion', title: 'Reflect', icon: Icons.Reflexion },
];

export const OptimizerView: React.FC<OptimizerViewProps> = ({ onSavePrompt, addToHistory }) => {
    const [basePrompt, setBasePrompt] = useState("");
    const [activeStrategies, setActiveStrategies] = useState<Set<StrategyId>>(new Set(['delimiters', 'persona']));
    const [targetModel, setTargetModel] = useState<'Generic' | 'Gemini' | 'Claude' | 'ChatGPT'>('Gemini');
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizedPrompt, setOptimizedPrompt] = useState("");
    const [auditScores, setAuditScores] = useState({ clarity: 0, specificity: 0, reasoning: 0, verdict: "" });
    const [critiques, setCritiques] = useState<{ weakness: string, fix_suggestion: string }[]>([]);
    const [variables, setVariables] = useState<Record<string, string>>({});
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState("");

    // Detect variables in the prompt draft
    useEffect(() => {
        const regex = /{{\s*(\w+)\s*}}/g;
        const matches = [...basePrompt.matchAll(regex)];
        const found = [...new Set(matches.map(m => m[1]))];
        setVariables(prev => {
            const next: Record<string, string> = {};
            found.forEach(f => next[f] = prev[f] || "");
            return next;
        });
    }, [basePrompt]);

    const toggleStrategy = (id: StrategyId) => {
        setActiveStrategies(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const handleOptimize = async () => {
        if (!basePrompt.trim()) return;
        setIsOptimizing(true);
        setOptimizedPrompt("");
        setTestResult("");
        setCritiques([]);

        // INTEGRATION: Smart Strategy Matrix - inject active patterns into the system instruction
        const strategyPatterns = Array.from(activeStrategies).map(s => STRATEGIES.find(st => st.id === s)?.title).join(', ');
        const compiled = `Target Platform: ${targetModel}\nApplied Patterns: ${strategyPatterns}\nDraft Content: ${basePrompt}`;

        try {
            const stream = await generatePromptStream(compiled, 0.7, 0.95, SYSTEM_INSTRUCTION_META_PROMPT);
            let fullText = "";
            for await (const chunk of stream) {
                fullText += chunk;
                setOptimizedPrompt(prev => prev + chunk);
            }
            const scores = await auditPrompt(fullText);
            setAuditScores({ clarity: scores.clarity, specificity: scores.specificity, reasoning: scores.reasoning, verdict: scores.overall_verdict });
            const crit = await critiquePrompt(fullText);
            setCritiques(crit);
        } catch (e) {
            console.error(e);
        } finally {
            setIsOptimizing(false);
        }
    };

    // TERMINAL ACTIVATION: Run optimized prompt with live variables
    const handleTestRun = async () => {
        if (!optimizedPrompt.trim()) return;
        setIsTesting(true);
        setTestResult("");
        
        let executablePrompt = optimizedPrompt;
        Object.entries(variables).forEach(([k, v]) => {
            const placeholder = new RegExp(`{{\\s*${k}\\s*}}`, 'g');
            executablePrompt = executablePrompt.replace(placeholder, v || `[${k}]`);
        });

        try {
            const stream = await generatePromptStream(executablePrompt, 0.8, 0.9);
            addToHistory(optimizedPrompt);
            for await (const chunk of stream) {
                setTestResult(prev => prev + chunk);
            }
        } catch (e) { 
            console.error(e); 
            setTestResult("FATAL: Inference link severed. Check API status.");
        } finally { 
            setIsTesting(false); 
        }
    };

    const Metric = ({ label, score, color }: { label: string, score: number, color: string }) => (
        <div className="flex-1 px-4">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{label}</span>
                <span className={`text-base font-black ${color}`}>{score}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full ${color.replace('text', 'bg')} transition-all duration-1000 ease-out`} style={{ width: `${score}%` }}></div>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto h-[calc(100vh-140px)] flex flex-col lg:grid lg:grid-cols-12 gap-12 animate-fade-in">

            {/* --- ENGINEERING CONTROL PANEL (3/12) --- */}
            <aside className="lg:col-span-3 flex flex-col gap-10 overflow-y-auto custom-scrollbar pr-2 pb-10">
                <header className="space-y-3 border-b border-gray-200 dark:border-gray-800 pb-6">
                    <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Suite Console</h2>
                    <p className="text-[11px] text-gray-400 uppercase font-black tracking-[0.3em]">Module v3.2_Active</p>
                </header>

                <div className="space-y-10">
                    {/* Inference Core Selection */}
                    <section className="space-y-4">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block">Inference Core</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['Gemini', 'Claude', 'ChatGPT', 'Generic'].map(m => (
                                <button
                                    key={m}
                                    onClick={() => setTargetModel(m as any)}
                                    className={`px-5 py-3 text-sm font-black rounded-2xl border-2 transition-all ${targetModel === m ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-600/40' : 'bg-white dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 text-gray-400 hover:border-indigo-400 hover:text-indigo-500'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* SMART STRATEGY MATRIX */}
                    <section className="space-y-4">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block">Strategy Matrix</label>
                        <div className="grid grid-cols-3 gap-3">
                            {STRATEGIES.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => toggleStrategy(s.id)}
                                    className={`group flex flex-col items-center justify-center gap-3 p-5 rounded-3xl border-2 transition-all duration-300 hover:scale-[1.05] ${activeStrategies.has(s.id) ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-500/10' : 'bg-white dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 text-gray-400 hover:bg-gray-50'}`}
                                >
                                    <span className="transform transition-transform group-hover:scale-110">{s.icon()}</span>
                                    <span className="text-[10px] font-black uppercase tracking-tighter leading-none">{s.title}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* VARIABLE DECK */}
                    {Object.keys(variables).length > 0 && (
                        <section className="p-8 bg-amber-50 dark:bg-amber-900/10 rounded-[2.5rem] border-2 border-amber-200 dark:border-amber-900/30 space-y-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
                                <label className="text-xs font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest">Data Inputs</label>
                            </div>
                            <div className="space-y-4">
                                {Object.keys(variables).map(v => (
                                    <div key={v} className="space-y-2">
                                        <p className="text-[10px] font-bold text-amber-600/80 uppercase tracking-wider">Parameter: {v}</p>
                                        <input
                                            placeholder={`Value for {{${v}}}`}
                                            value={variables[v]}
                                            onChange={e => setVariables({ ...variables, [v]: e.target.value })}
                                            className="w-full text-sm px-5 py-3.5 bg-white dark:bg-gray-950 border border-amber-200 dark:border-amber-800 rounded-2xl focus:ring-4 focus:ring-amber-500/20 outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </aside>

            {/* --- PRO WORKSPACE (9/12) --- */}
            <main className="lg:col-span-9 flex flex-col gap-10">

                {/* COMPOSITION ENGINE */}
                <div className="bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-[3rem] p-10 shadow-sm flex flex-col gap-8 focus-within:ring-8 focus-within:ring-indigo-500/5 transition-all">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Drafting Canvas</span>
                        <div className="flex gap-4">
                             <button
                                onClick={handleOptimize}
                                disabled={isOptimizing || !basePrompt}
                                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-base shadow-2xl shadow-indigo-600/40 flex items-center gap-3 disabled:opacity-50 transition-all active:scale-95"
                            >
                                {isOptimizing ? <span className="animate-spin text-xl">🌀</span> : <Icons.Magic />}
                                {isOptimizing ? 'Optimizing...' : 'Synthesize Architecture'}
                            </button>
                            {optimizedPrompt && (
                                <button
                                    onClick={handleTestRun}
                                    disabled={isTesting}
                                    className="px-8 py-4 bg-gray-900 dark:bg-gray-800 hover:bg-black dark:hover:bg-gray-700 text-white rounded-2xl font-black text-base shadow-xl flex items-center gap-3 disabled:opacity-50 transition-all active:scale-95"
                                >
                                    {isTesting ? <span className="animate-spin text-xl">⚙️</span> : <Icons.Play />}
                                    Simulate Logic
                                </button>
                            )}
                        </div>
                    </div>
                    <textarea
                        value={basePrompt}
                        onChange={e => setBasePrompt(e.target.value)}
                        placeholder="Define your prompt's core goal... Use {{dynamic}} fields for simulation."
                        className="w-full h-44 bg-transparent text-gray-900 dark:text-white text-2xl font-semibold placeholder-gray-300 dark:placeholder-gray-700 outline-none resize-none leading-relaxed"
                    />
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10 min-h-0">

                    {/* META-ARCHITECTURE (Pure White / Black Text) */}
                    <div className="flex flex-col bg-white rounded-[3.5rem] overflow-hidden border-4 border-gray-100 shadow-2xl">
                        <div className="px-10 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                            <div className="flex items-center gap-4">
                                <div className={`w-3.5 h-3.5 rounded-full ${isOptimizing ? 'bg-amber-500 animate-pulse' : 'bg-indigo-600 shadow-[0_0_12px_#4f46e5]'}`}></div>
                                <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">Meta-Architecture</span>
                            </div>
                            {optimizedPrompt && (
                                <div className="flex gap-3">
                                    <button onClick={() => navigator.clipboard.writeText(optimizedPrompt)} className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"><Icons.Copy /></button>
                                    <button onClick={() => onSavePrompt(optimizedPrompt)} className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-black rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all">SAVE ARCHITECTURE</button>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-white">
                            <pre className="text-lg font-mono text-black whitespace-pre-wrap leading-[1.9] tracking-tight">
                                {optimizedPrompt || <span className="text-gray-300 italic select-none">Synthesizing engineering structures...</span>}
                            </pre>
                        </div>

                        {auditScores.clarity > 0 && (
                            <div className="p-10 bg-gray-50 border-t border-gray-100">
                                <div className="flex gap-8">
                                    <Metric label="Clarity" score={auditScores.clarity} color="text-blue-600" />
                                    <Metric label="Specificity" score={auditScores.specificity} color="text-emerald-600" />
                                    <Metric label="Logic" score={auditScores.reasoning} color="text-indigo-600" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* INSIGHTS & TERMINAL */}
                    <div className="flex flex-col gap-10">
                        {/* Review Insights Feed */}
                        <div className="flex-1 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-[3.5rem] flex flex-col overflow-hidden shadow-sm">
                            <div className="px-10 py-6 border-b border-gray-200/60 dark:border-gray-800/50 bg-white/50 dark:bg-gray-800/30">
                                <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Logic Analysis</span>
                            </div>
                            <div className="flex-1 p-10 space-y-6 overflow-y-auto custom-scrollbar">
                                {isOptimizing ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-6 opacity-60">
                                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Executing Deep Scan</span>
                                    </div>
                                ) : critiques.length > 0 ? (
                                    critiques.map((c, i) => (
                                        <div key={i} className="group p-8 bg-white dark:bg-gray-800/60 rounded-[2.5rem] border border-transparent hover:border-indigo-200 dark:hover:border-indigo-900/50 shadow-sm transition-all duration-400">
                                            <p className="text-base text-gray-900 dark:text-white font-bold mb-4 leading-relaxed">{c.weakness}</p>
                                            <div className="flex items-start gap-4 text-sm text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/50 p-6 rounded-[2rem] border border-indigo-100/50 dark:border-indigo-900/30">
                                                <Icons.Check />
                                                <span className="leading-relaxed">REFACTOR: {c.fix_suggestion}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-12 grayscale">
                                        <div className="text-6xl mb-8">🔭</div>
                                        <div className="text-[11px] font-black uppercase tracking-[0.3em] leading-relaxed">System Idle.<br/>Scan requested for analysis.</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ACTIVATED INFERENCE TERMINAL (Midnight Styling) */}
                        <div className="h-72 bg-[#0a0f1d] border-4 border-[#1e293b] rounded-[3.5rem] flex flex-col overflow-hidden shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] relative group">
                            <div className="px-10 py-5 border-b border-[#1e293b] flex justify-between items-center bg-[#111827]/90">
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-3">
                                    <span className={`w-2.5 h-2.5 rounded-full ${isTesting ? 'bg-emerald-400 animate-pulse shadow-[0_0_12px_#10b981]' : 'bg-gray-700'}`}></span> Inference Terminal v1.0
                                </span>
                                <span className="text-[10px] text-[#475569] font-mono tracking-widest">SYS:READY_8080</span>
                            </div>
                            <div className="flex-1 p-10 overflow-y-auto custom-scrollbar font-mono text-base text-gray-200 leading-relaxed scroll-smooth selection:bg-emerald-500/30">
                                {isTesting && !testResult ? (
                                    <div className="flex gap-3 items-center text-emerald-500/80">
                                        <span className="animate-bounce">_</span> 
                                        <span className="text-xs uppercase font-black tracking-widest">Initializing Neural Stream...</span>
                                    </div>
                                ) : (
                                    <div className="whitespace-pre-wrap">
                                        {testResult || <span className="text-gray-600 italic select-none">Terminal secure. Click 'Simulate' to execute architecture against inference core.</span>}
                                        {isTesting && <span className="inline-block w-2.5 h-5 bg-emerald-500 ml-2 animate-pulse align-middle"></span>}
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-6 right-10 opacity-0 group-hover:opacity-60 transition-opacity">
                                <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Execution Sandbox</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.2); border-radius: 30px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.4); }
            `}</style>
        </div>
    );
};
