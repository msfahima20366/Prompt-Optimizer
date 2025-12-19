
import React, { useState, useMemo } from 'react';
import { UserContext, ALL_LLM_MODELS, LLMModel } from '../prompts/collection';
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
    const [model, setModel] = useState<LLMModel>("Gemini");
    const [temperature, setTemperature] = useState(0.7);
    const [topP, setTopP] = useState(0.95);
    
    // Selection States
    const [selectedBlueprints, setSelectedBlueprints] = useState<Set<string>>(new Set(['persona', 'cot']));
    const [selectedContexts, setSelectedContexts] = useState<Set<string>>(new Set());

    // Protocols
    const [isDualMode, setIsDualMode] = useState(false);
    const [isBatchMode, setIsBatchMode] = useState(false);
    const [batchInputs, setBatchInputs] = useState<string[]>([]);
    const [languageMode, setLanguageMode] = useState<'auto' | 'en'>('auto');

    // Results
    const [resultA, setResultA] = useState("");
    const [resultB, setResultB] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [audit, setAudit] = useState<any>(null);

    const variables = useMemo(() => {
        const regex = /{{\s*(\w+)\s*}}/g;
        return [...new Set([...input.matchAll(regex)].map(m => m[1]))];
    }, [input]);

    const placeholderText = useMemo(() => {
        if (['Midjourney', 'Stable Diffusion', 'DALL-E', 'Imagen'].includes(model)) {
            return "Describe an image idea (e.g., 'A cyberpunk city at night with neon rain') to optimize for high-quality generation...";
        }
        if (['Sora', 'Veo', 'RunwayML', 'Pika'].includes(model)) {
            return "Describe a video scene (e.g., 'A drone shot of an alpine forest during sunset') for cinematic video prompt engineering...";
        }
        return "Describe what you want to achieve (e.g., 'Write a blog about AI ethics') to optimize it into a high-performance system prompt...";
    }, [model]);

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
            const systemA = getMetaPromptInstruction(strategy, 'A');
            const streamA = await generatePromptStream(fullRequest, temperature, topP, systemA);
            let fullA = "";
            for await (const chunk of streamA) {
                fullA += chunk;
                setResultA(fullA);
            }

            if (isDualMode) {
                const systemB = getMetaPromptInstruction(strategy, 'B');
                const streamB = await generatePromptStream(fullRequest, temperature + 0.1, topP, systemB);
                let fullB = "";
                for await (const chunk of streamB) {
                    fullB += chunk;
                    setResultB(fullB);
                }
            }

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
                
                {/* 1. Model Selection */}
                <div className="modern-card p-6 space-y-3 border-2 border-indigo-500 shadow-xl shadow-indigo-500/5">
                    <h3 className="font-bold text-indigo-600 dark:text-indigo-400 text-[10px] uppercase tracking-widest">Target Engine Architecture</h3>
                    <select 
                        value={model} 
                        onChange={e => setModel(e.target.value as LLMModel)} 
                        className="w-full bg-indigo-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-3 text-xs font-black outline-none cursor-pointer transition-all"
                    >
                        <optgroup label="Text Models">
                            <option value="ChatGPT">ChatGPT (OpenAI)</option>
                            <option value="Claude">Claude (Anthropic)</option>
                            <option value="Gemini">Gemini (Google)</option>
                            <option value="DeepSeek">DeepSeek</option>
                            <option value="Llama">Llama (Meta)</option>
                        </optgroup>
                        <optgroup label="Image Models">
                            <option value="Midjourney">Midjourney</option>
                            <option value="Stable Diffusion">Stable Diffusion</option>
                            <option value="DALL-E">DALL-E 3</option>
                            <option value="Imagen">Google Imagen</option>
                        </optgroup>
                        <optgroup label="Video Models">
                            <option value="Sora">OpenAI Sora</option>
                            <option value="Veo">Google Veo</option>
                            <option value="RunwayML">Runway Gen-3</option>
                        </optgroup>
                    </select>
                </div>

                {/* 2. Neural Tuning */}
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
                    </div>
                </div>

                {/* 3. Strategies */}
                <div className="modern-card p-6 space-y-4">
                    <h3 className="font-bold text-gray-800 dark:text-white text-[10px] uppercase tracking-widest">Optimization Strategy</h3>
                    <div className="space-y-2">
                        {STRATEGIES.map(s => (
                            <button key={s.id} onClick={() => setStrategy(s.id)} className={`w-full text-left p-3 rounded-xl border-2 transition-all ${strategy === s.id ? 'bg-indigo-600 text-white border-indigo-400 shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-transparent'}`}>
                                <div className="text-[10px] font-black uppercase">{s.label}</div>
                                <div className="text-[8px] mt-0.5 opacity-60 leading-tight">{s.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. Protocols */}
                <div className="modern-card p-6 space-y-4">
                    <h3 className="font-bold text-gray-800 dark:text-white text-[10px] uppercase tracking-widest">Smart Protocols</h3>
                    <div className="space-y-2">
                        {[
                            { id: 'dual', label: 'A/B Test Variant', active: isDualMode, toggle: () => setIsDualMode(!isDualMode) },
                            { id: 'batch', label: 'Batch Processing', active: isBatchMode, toggle: () => setIsBatchMode(!isBatchMode) },
                        ].map(f => (
                            <button key={f.id} onClick={f.toggle} className={`w-full flex justify-between items-center p-3 rounded-xl border-2 transition-all ${f.active ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-gray-50 dark:bg-gray-800 border-transparent text-gray-400'}`}>
                                <span className="text-[10px] font-black uppercase tracking-tighter">{f.label}</span>
                                <div className={`w-1.5 h-1.5 rounded-full ${f.active ? 'bg-white' : 'bg-gray-300'}`}></div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 5. Context */}
                <div className="modern-card p-6 space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 dark:text-white text-[10px] uppercase tracking-widest">Reference Context</h3>
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
            </aside>

            {/* Main Workspace */}
            <main className="lg:col-span-9 space-y-10">
                
                {/* Input Lab */}
                <section className="modern-card p-8 space-y-6 shadow-2xl relative overflow-hidden bg-white dark:bg-slate-900">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Neural Optimization Lab</h2>
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.25em]">Input crude draft for {model} specific architecture</p>
                        </div>
                    </div>

                    <textarea 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={placeholderText}
                        className="w-full h-64 p-8 text-xl bg-gray-50 dark:bg-gray-950 border-2 border-gray-100 dark:border-gray-800 rounded-[2.5rem] focus:outline-none focus:border-indigo-500 transition-all font-medium resize-none shadow-inner custom-scrollbar"
                    />

                    <div className="flex justify-end items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button 
                            onClick={handleImprove}
                            disabled={isProcessing || !input.trim()}
                            className="px-14 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-indigo-500/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isProcessing ? "Synthesizing..." : `Optimize for ${model}`}
                        </button>
                    </div>
                </section>

                {/* Result Grid */}
                <div className={`grid grid-cols-1 ${isDualMode && resultB ? 'xl:grid-cols-2' : ''} gap-8`}>
                    <div className="flex flex-col bg-[#0F172A] rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 min-h-[550px]">
                        <div className="px-10 py-6 bg-white/5 flex justify-between items-center border-b border-white/5 backdrop-blur-xl">
                            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.4em]">Optimized Result (Alpha)</span>
                            <button onClick={() => onSavePrompt(resultA)} className="text-[10px] font-black text-indigo-300 hover:text-white uppercase transition-colors">Add to Collection</button>
                        </div>
                        <div className="p-14 text-white/90 text-lg font-medium leading-[2.1] whitespace-pre-wrap font-sans">
                            {resultA || <div className="h-full flex items-center justify-center opacity-10 py-24 uppercase tracking-[0.6em] text-[9px]">Awaiting sequence injection</div>}
                        </div>
                    </div>

                    {isDualMode && resultB && (
                        <div className="flex flex-col bg-indigo-950/30 rounded-[3rem] overflow-hidden border-2 border-indigo-500/20 min-h-[550px] animate-fade-in">
                            <div className="px-10 py-6 bg-white/5 flex justify-between items-center border-b border-white/5">
                                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.4em]">Variant Beta (Creative)</span>
                            </div>
                            <div className="p-14 text-white/85 text-lg font-medium italic leading-[2.1] whitespace-pre-wrap font-sans">
                                {resultB}
                            </div>
                        </div>
                    )}
                </div>

                {/* Audit Scorer */}
                {audit && (
                    <div className="modern-card p-12 space-y-12 shadow-premium animate-fade-in border-t-8 border-indigo-600">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
                            <div>
                                <h3 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tight">AI Quality Audit</h3>
                                <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-2">Neural Analysis Result for {model}</p>
                            </div>
                            <div className="px-12 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-4xl">
                                {Math.round((audit.clarity + audit.specificity + audit.reasoning + audit.token_efficiency) / 4)}%
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                            {[
                                { label: 'Clarity', val: audit.clarity, color: 'bg-indigo-500' },
                                { label: 'Specificity', val: audit.specificity, color: 'bg-emerald-500' },
                                { label: 'Reasoning', val: audit.reasoning, color: 'bg-violet-500' },
                                { label: 'Efficiency', val: audit.token_efficiency, color: 'bg-amber-500' },
                            ].map(m => (
                                <div key={m.label} className="space-y-4">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-gray-400">{m.label}</span>
                                        <span className="text-gray-900 dark:text-white">{m.val}%</span>
                                    </div>
                                    <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${m.color} transition-all duration-1000`} style={{width: `${m.val}%`}}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
