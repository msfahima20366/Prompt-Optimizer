
import React, { useState, useMemo } from 'react';
import { UserContext, ALL_LLM_MODELS } from '../prompts/collection';
import { generatePromptStream, auditPrompt, getMetaPromptInstruction } from '../services/geminiService';

interface OptimizerViewProps {
    userContexts: UserContext[];
    onSaveNewContext: () => void;
    onDeleteContext: (contextId: string) => void;
    onSavePrompt: (prompt: string) => void;
    addToHistory: (prompt: string) => void;
}

const BLUEPRINTS = [
    { id: 'persona', label: 'Persona Architecture', desc: 'Injects a high-level professional identity.' },
    { id: 'cot', label: 'Chain of Thought', desc: 'Forces step-by-step logic and reasoning.' },
    { id: 'recursive', label: 'Recursive Refinement', desc: 'Self-correcting internal logic loops.' },
    { id: 'counter_probe', label: 'Counter-Probing', desc: 'AI analyzes flaws in its own reasoning.' },
    { id: 'negative_layer', label: 'Negative Layer', desc: 'Adds explicit constraints on what to avoid.' },
    { id: 'feynman', label: 'Feynman Filter', desc: 'Simplifies jargon for maximum clarity.' },
    { id: 'constraint', label: 'Constraint Mapping', desc: 'Strict boundary and limit enforcement.' },
    { id: 'bridging', label: 'Semantic Bridging', desc: 'Connects diverse concepts logically.' }
];

const STRATEGIES = [
    { id: 'meta', label: 'Meta Prompt', desc: 'Complex multi-section architecture.' },
    { id: 'refined', label: 'Direct Refined', desc: 'Polished professional draft.' },
    { id: 'concise', label: 'Concise Expert', desc: 'Token-saving logically dense form.' }
];

export const OptimizerView: React.FC<OptimizerViewProps> = ({ userContexts, onSaveNewContext, onDeleteContext, onSavePrompt, addToHistory }) => {
    // Core States
    const [input, setInput] = useState("");
    const [strategy, setStrategy] = useState("meta");
    const [model, setModel] = useState("Gemini");
    const [temperature, setTemperature] = useState(0.7);
    const [topP, setTopP] = useState(0.95);
    
    // Selection States
    const [selectedBlueprints, setSelectedBlueprints] = useState<Set<string>>(new Set(['persona', 'cot']));
    const [selectedContexts, setSelectedContexts] = useState<Set<string>>(new Set());

    // --- FEATURE INTEGRATION ---
    const [isDualMode, setIsDualMode] = useState(false); // F1: A/B Testing
    const [isBatchMode, setIsBatchMode] = useState(false); // F9: Batch Processing
    const [batchInputs, setBatchInputs] = useState<string[]>([]);
    const [languageMode, setLanguageMode] = useState<'auto' | 'en'>('auto'); // F7: Translation

    // Results & Analysis (F5: Scorer)
    const [resultA, setResultA] = useState("");
    const [resultB, setResultB] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [audit, setAudit] = useState<any>(null);

    // F3: Variable Detection
    const variables = useMemo(() => {
        const regex = /{{\s*(\w+)\s*}}/g;
        return [...new Set([...input.matchAll(regex)].map(m => m[1]))];
    }, [input]);

    const toggleSet = (id: string, state: Set<string>, setter: (s: Set<string>) => void) => {
        const next = new Set(state);
        next.has(id) ? next.delete(id) : next.add(id);
        setter(next);
    };

    const handleImprove = async () => {
        if (!input.trim() || isProcessing) return;
        setIsProcessing(true);
        setResultA("");
        setResultB("");
        setAudit(null);

        const blueprintText = BLUEPRINTS.filter(b => selectedBlueprints.has(b.id)).map(b => b.label).join(", ");
        const contextText = userContexts.filter(c => selectedContexts.has(c.id)).map(c => `${c.title}: ${c.content}`).join("\n");
        
        const fullRequest = `
            Target Engine: ${model}
            Optimization Parameters: Temperature=${temperature}, Top-P=${topP}
            Active Frameworks: ${blueprintText}
            Knowledge Context: ${contextText}
            Detected Variables: ${variables.join(", ")}
            Translation Logic: ${languageMode}
            
            USER SOURCE DRAFT:
            ${input}
        `;

        try {
            // Version Alpha
            const systemA = getMetaPromptInstruction(strategy, 'A');
            const streamA = await generatePromptStream(fullRequest, temperature, topP, systemA);
            let fullA = "";
            for await (const chunk of streamA) {
                fullA += chunk;
                setResultA(fullA);
            }

            // Version Beta (F1)
            if (isDualMode) {
                const systemB = getMetaPromptInstruction(strategy, 'B');
                const streamB = await generatePromptStream(fullRequest, temperature + 0.1, topP, systemB);
                let fullB = "";
                for await (const chunk of streamB) {
                    fullB += chunk;
                    setResultB(fullB);
                }
            }

            // Audit Scorer (F5)
            const auditData = await auditPrompt(fullA);
            setAudit(auditData);
            addToHistory(input);
        } catch (e) {
            setResultA("Neural Linkage Failure. Sequence Aborted.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBatchAdd = () => {
        if (input.trim()) {
            setBatchInputs([...batchInputs, input]);
            setInput("");
        }
    };

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10">
            {/* Sidebar Controls */}
            <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-24 h-fit pb-10">
                
                {/* 1. Smart Protocols (F1, F7, F9) */}
                <div className="modern-card p-6 space-y-4 border-2 border-indigo-500 shadow-xl shadow-indigo-500/5">
                    <h3 className="font-bold text-indigo-600 dark:text-indigo-400 text-[10px] uppercase tracking-widest">Smart Protocols</h3>
                    <div className="space-y-2">
                        {[
                            { id: 'dual', label: 'A/B Testing Lab', active: isDualMode, toggle: () => setIsDualMode(!isDualMode) },
                            { id: 'batch', label: 'Batch Processing', active: isBatchMode, toggle: () => setIsBatchMode(!isBatchMode) },
                            { id: 'lang', label: 'Auto Translation', active: languageMode === 'auto', toggle: () => setLanguageMode(languageMode === 'auto' ? 'en' : 'auto') },
                        ].map(f => (
                            <button key={f.id} onClick={f.toggle} className={`w-full flex justify-between items-center p-3 rounded-xl border-2 transition-all duration-300 ${f.active ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-800 border-transparent text-gray-400'}`}>
                                <span className="text-[10px] font-black uppercase tracking-tighter">{f.label}</span>
                                <div className={`w-1.5 h-1.5 rounded-full ${f.active ? 'bg-white shadow-[0_0_8px_#fff]' : 'bg-gray-300'}`}></div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Neural Tuning Sliders */}
                <div className="modern-card p-6 space-y-6">
                    <h3 className="font-bold text-gray-800 dark:text-white text-[10px] uppercase tracking-widest">Neural Tuning</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[9px] font-bold text-gray-500 uppercase">
                                <span>Temperature</span>
                                <span className="text-indigo-500 font-black">{temperature.toFixed(2)}</span>
                            </div>
                            <input type="range" min="0" max="1.5" step="0.05" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[9px] font-bold text-gray-500 uppercase">
                                <span>Top-P (Nucleus)</span>
                                <span className="text-indigo-500 font-black">{topP.toFixed(2)}</span>
                            </div>
                            <input type="range" min="0" max="1" step="0.01" value={topP} onChange={e => setTopP(parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                        </div>
                    </div>
                </div>

                {/* 3. Strategy */}
                <div className="modern-card p-6 space-y-4">
                    <h3 className="font-bold text-gray-800 dark:text-white text-[10px] uppercase tracking-widest">Architecture Strategy</h3>
                    <div className="space-y-2">
                        {STRATEGIES.map(s => (
                            <button key={s.id} onClick={() => setStrategy(s.id)} className={`w-full text-left p-3 rounded-xl border-2 transition-all ${strategy === s.id ? 'bg-indigo-600 text-white border-indigo-400 shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-transparent'}`}>
                                <div className="text-[10px] font-black uppercase">{s.label}</div>
                                <div className="text-[8px] mt-0.5 opacity-60 leading-tight">{s.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. Logic Blueprints (RESTORED) */}
                <div className="modern-card p-6 space-y-4">
                    <h3 className="font-bold text-gray-800 dark:text-white text-[10px] uppercase tracking-widest">Logic Blueprints</h3>
                    <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                        {BLUEPRINTS.map(b => (
                            <button key={b.id} onClick={() => toggleSet(b.id, selectedBlueprints, setSelectedBlueprints)} className={`w-full text-left p-3 rounded-xl border transition-all ${selectedBlueprints.has(b.id) ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold' : 'bg-transparent border-gray-100 dark:border-gray-800 text-gray-500 hover:border-gray-300'}`}>
                                <div className="text-[10px] font-black uppercase tracking-tight">{b.label}</div>
                                <div className="text-[8px] opacity-60 mt-0.5 leading-none">{b.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 5. Target Engine */}
                <div className="modern-card p-6 space-y-3">
                    <h3 className="font-bold text-gray-800 dark:text-white text-[10px] uppercase tracking-widest">Target Engine</h3>
                    <select value={model} onChange={e => setModel(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-3 text-xs font-black outline-none cursor-pointer">
                        {ALL_LLM_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>

                {/* 6. Context Knowledge */}
                <div className="modern-card p-6 space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 dark:text-white text-[10px] uppercase tracking-widest">Knowledge Base</h3>
                        <button onClick={onSaveNewContext} className="text-indigo-500 font-black text-xl hover:scale-125 transition-transform">+</button>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                        {userContexts.map(c => (
                            <button key={c.id} onClick={() => toggleSet(c.id, selectedContexts, setSelectedContexts)} className={`w-full text-left p-3 rounded-xl border transition-all text-[9px] font-bold truncate ${selectedContexts.has(c.id) ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700' : 'bg-gray-50 dark:bg-gray-800 border-transparent text-gray-500'}`}>
                                {c.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* F3: Variable Inspector */}
                {variables.length > 0 && (
                    <div className="modern-card p-6 space-y-4 border-l-4 border-emerald-500 animate-fade-in shadow-xl shadow-emerald-500/5">
                        <h3 className="font-bold text-emerald-600 text-[10px] uppercase tracking-widest">Variable Inspector</h3>
                        <div className="flex flex-wrap gap-1.5">
                            {variables.map(v => <span key={v} className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 text-[9px] font-black rounded-lg border border-emerald-200">{"{{" + v + "}}"}</span>)}
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Workspace */}
            <main className="lg:col-span-9 space-y-10">
                
                {/* Input Lab (F9) */}
                <section className="modern-card p-8 space-y-6 shadow-2xl relative overflow-hidden border-white/5 bg-white dark:bg-slate-900">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Neural Transformation Lab</h2>
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.25em]">Input crude draft for architectural optimization</p>
                        </div>
                        {isBatchMode && <div className="px-5 py-2 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase shadow-lg animate-pulse">Batch Queue: {batchInputs.length}</div>}
                    </div>

                    <textarea 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={isBatchMode ? "Enter one draft and click [+] to queue..." : "Describe what you want to achieve (Supports multi-language auto-detect)..."}
                        className="w-full h-64 p-8 text-xl bg-gray-50 dark:bg-gray-950 border-2 border-gray-100 dark:border-gray-800 rounded-[2.5rem] focus:outline-none focus:border-indigo-500 transition-all font-medium resize-none shadow-inner custom-scrollbar"
                    />

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex gap-6">
                            <span>Chars: {input.length}</span>
                            <span>Tokens: ~{Math.ceil(input.length / 4)}</span>
                            <span className={languageMode === 'auto' ? 'text-indigo-500' : ''}>Auto-Translation: {languageMode === 'auto' ? 'ON' : 'OFF'}</span>
                        </div>
                        <div className="flex gap-4 w-full sm:w-auto">
                            {isBatchMode && <button onClick={handleBatchAdd} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-lg border border-emerald-200 hover:scale-110 active:scale-95">+</button>}
                            <button 
                                onClick={handleImprove}
                                disabled={isProcessing || !input.trim()}
                                className="flex-1 sm:flex-none px-14 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-indigo-500/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isProcessing ? "Synthesizing..." : "Optimize Neural Path"}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Result Grid (F1) */}
                <div className={`grid grid-cols-1 ${isDualMode && resultB ? 'xl:grid-cols-2' : ''} gap-8`}>
                    
                    {/* Alpha Result */}
                    <div className="flex flex-col bg-[#0F172A] rounded-[3rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] border border-white/10 min-h-[550px]">
                        <div className="px-10 py-6 bg-white/5 flex justify-between items-center border-b border-white/5 backdrop-blur-xl">
                            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.4em]">
                                {isDualMode ? "Variant Alpha (Logical)" : "Optimized Architecture"}
                            </span>
                            <div className="flex gap-4">
                                <button onClick={() => onSavePrompt(resultA)} className="text-[10px] font-black text-indigo-300 hover:text-white uppercase transition-colors">Save to Vault</button>
                                <button onClick={() => navigator.clipboard.writeText(resultA)} className="text-[10px] font-black text-white/40 hover:text-white uppercase transition-colors">Copy</button>
                            </div>
                        </div>
                        <div className="p-14 text-white/90 text-lg font-medium leading-[2.1] whitespace-pre-wrap font-sans tracking-tight">
                            {resultA || <div className="h-full flex flex-col items-center justify-center opacity-10 py-24 uppercase tracking-[0.6em] text-[9px]">Awaiting sequence injection</div>}
                        </div>
                    </div>

                    {/* Beta Result (F1) */}
                    {isDualMode && resultB && (
                        <div className="flex flex-col bg-indigo-950/30 rounded-[3rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(79,70,229,0.2)] border-2 border-indigo-500/20 min-h-[550px] animate-fade-in">
                            <div className="px-10 py-6 bg-white/5 flex justify-between items-center border-b border-white/5">
                                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.4em]">Variant Beta (Creative)</span>
                                <button onClick={() => navigator.clipboard.writeText(resultB)} className="text-[10px] font-black text-white/40 hover:text-white uppercase transition-colors">Copy</button>
                            </div>
                            <div className="p-14 text-white/85 text-lg font-medium italic leading-[2.1] whitespace-pre-wrap font-sans tracking-tight">
                                {resultB}
                            </div>
                        </div>
                    )}
                </div>

                {/* Audit Scorer (F5) */}
                {audit && (
                    <div className="modern-card p-12 space-y-12 shadow-premium animate-fade-in border-t-8 border-indigo-600">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
                            <div>
                                <h3 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Prompt Quality Scorer</h3>
                                <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-2">Heuristic Neural Analysis Result</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="px-12 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-4xl shadow-2xl shadow-indigo-600/30">
                                    {Math.round((audit.clarity + audit.specificity + audit.reasoning + audit.token_efficiency) / 4)}%
                                </div>
                                <span className="text-[9px] font-black uppercase mt-3 tracking-widest text-gray-400">Efficiency Index</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                            {[
                                { label: 'Clarity Index', val: audit.clarity, color: 'bg-indigo-500' },
                                { label: 'Specificity Matrix', val: audit.specificity, color: 'bg-emerald-500' },
                                { label: 'Logical Depth', val: audit.reasoning, color: 'bg-violet-500' },
                                { label: 'Token Density', val: audit.token_efficiency, color: 'bg-amber-500' },
                            ].map(m => (
                                <div key={m.label} className="space-y-4">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-gray-400">{m.label}</span>
                                        <span className="text-gray-900 dark:text-white">{m.val}%</span>
                                    </div>
                                    <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                                        <div className={`h-full ${m.color} transition-all duration-1000 ease-out`} style={{width: `${m.val}%`}}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-10 bg-indigo-50 dark:bg-indigo-950/20 rounded-[2.5rem] border-l-[10px] border-indigo-500 shadow-inner">
                            <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Architectural Verdict</h4>
                            <p className="text-xl italic font-medium text-gray-700 dark:text-gray-300 leading-relaxed tracking-tight">"{audit.overall_verdict}"</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
