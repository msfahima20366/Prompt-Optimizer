
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
    { id: 'cot', label: 'Chain of Thought', desc: 'Forces step-by-step reasoning before output.' },
    { id: 'recursive', label: 'Recursive Refinement', desc: 'Instructs AI to perform internal logic loops.' },
    { id: 'multi_perspective', label: 'Multi-Perspective', desc: 'Analyzes the task from 3 different expert viewpoints.' },
    { id: 'counter_probe', label: 'Counter-Argument Probing', desc: 'Looks for flaws and biases in its own logic.' },
    { id: 'anchoring', label: 'Instruction Anchoring', desc: 'Locks core goals at the beginning and end.' },
    { id: 'flourish', label: 'Creative Flourish', desc: 'Enhances metaphors and vocabulary richness.' },
    { id: 'constraints', label: 'Constraint Mapping', desc: 'Explicitly lists "What to Avoid" to prevent drift.' },
    { id: 'step_by_step', label: 'Step-by-Step Execution', desc: 'Strict breakdown of task components.' },
    { id: 'rigor', label: 'Academic Rigor', desc: 'Focuses on peer-reviewed style and logic.' },
    { id: 'emotion', label: 'Emotional Intelligence', desc: 'Adjusts tone for human-centric sensitivity.' },
    { id: 'verify', label: 'Verification Protocol', desc: 'Forces internal fact-checking before final output.' },
    { id: 'multimodal', label: 'Multimodal Preparation', desc: 'Adds instructions for vision or audio data handling.' },
    { id: 'safety', label: 'Strict Boundary Setting', desc: 'Defines rigid safety and topical scope limits.' }
];

const NEURAL_TUNING = [
    { id: 'tokenization', label: 'Correct Tokenization', desc: 'Optimizes text structure for model-specific token efficiency.' },
    { id: 'precision', label: 'Semantic Precision', desc: 'Narrows the latent space focus to exact domain terminology.' }
];

const STRATEGIES = [
    { id: 'meta', label: 'Meta Prompt', icon: '⚡', desc: 'Hierarchical: Complex, multi-section structured instructions.' },
    { id: 'refined', label: 'Direct Refined', icon: '✨', desc: 'Professional: A polished, clear version of your intent.' },
    { id: 'concise', label: 'Concise Expert', icon: '🎯', desc: 'Efficient: Short, direct, and token-saving instruction.' },
    { id: 'technical', label: 'Technical Spec', icon: '🛠️', desc: 'Architected: Formatted as structured dev requirements.' }
];

export const OptimizerView: React.FC<OptimizerViewProps> = ({ userContexts, onSaveNewContext, onDeleteContext }) => {
    const [input, setInput] = useState("");
    const [selectedBlueprints, setSelectedBlueprints] = useState<Set<string>>(new Set(['persona', 'cot']));
    const [selectedTuning, setSelectedTuning] = useState<Set<string>>(new Set(['tokenization']));
    const [strategy, setStrategy] = useState("meta");
    const [selectedContexts, setSelectedContexts] = useState<Set<string>>(new Set());
    const [model, setModel] = useState("ChatGPT");
    const [temperature, setTemperature] = useState(0.7);
    const [topP, setTopP] = useState(0.95);
    const [result, setResult] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [audit, setAudit] = useState<any>(null);

    const toggleBlueprint = (id: string) => {
        const next = new Set(selectedBlueprints);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedBlueprints(next);
    };

    const toggleTuning = (id: string) => {
        const next = new Set(selectedTuning);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedTuning(next);
    };

    const toggleContext = (id: string) => {
        const next = new Set(selectedContexts);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedContexts(next);
    };

    const estTokens = useMemo(() => {
        let base = Math.ceil(input.length / 4);
        if (selectedTuning.has('tokenization')) {
            base = Math.ceil(base * 0.85);
        }
        return base;
    }, [input, selectedTuning]);

    const handleImprove = async () => {
        if (!input.trim() || isProcessing) return;
        setIsProcessing(true);
        setResult("");
        
        const activeSettingsText = BLUEPRINTS.filter(s => selectedBlueprints.has(s.id)).map(s => s.label).join(", ");
        const tuningText = NEURAL_TUNING.filter(s => selectedTuning.has(s.id)).map(s => s.label).join(", ");
        const contextText = userContexts.filter(c => selectedContexts.has(c.id)).map(c => `${c.title}: ${c.content}`).join("\n");
        const fullRequest = `Model: ${model}\nOptimization Strategy Style: ${strategy.toUpperCase()}\nLogic Blueprints Active: ${activeSettingsText}\nNeural Tuning Protocols: ${tuningText}\nKnowledge Context:\n${contextText}\n\nUser Input Draft to Transform:\n${input}`;

        try {
            const systemInstruction = getMetaPromptInstruction(strategy);
            const stream = await generatePromptStream(fullRequest, temperature, topP, systemInstruction);
            let fullText = "";
            for await (const chunk of stream) {
                fullText += chunk;
                setResult(fullText);
            }
            const auditData = await auditPrompt(fullText);
            setAudit(auditData);
        } catch (e) {
            setResult("An inference error occurred. Please verify your connection or attempt a retry.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10">
            
            {/* Control Sidebar */}
            <aside className="lg:col-span-3 space-y-8">
                {/* 1. Optimization Strategy */}
                <div className="modern-card p-6 space-y-5 border-2 border-indigo-500 shadow-xl shadow-indigo-500/10">
                    <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-indigo-600 dark:text-indigo-400">1. Optimization Strategy</h3>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Select Transformation Output</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {STRATEGIES.map(s => (
                            <button 
                                key={s.id}
                                onClick={() => setStrategy(s.id)}
                                className={`text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${strategy === s.id ? 'bg-indigo-600 text-white border-indigo-400 shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 border-transparent hover:border-gray-200'}`}
                            >
                                <span className="text-xl">{s.icon}</span>
                                <div className="flex flex-col">
                                    <span className={`text-[11px] font-black uppercase ${strategy === s.id ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>{s.label}</span>
                                    <span className={`text-[9px] leading-tight ${strategy === s.id ? 'text-indigo-100' : 'text-gray-400'}`}>{s.desc}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Target Engine */}
                <div className="modern-card p-6 space-y-5">
                    <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">2. Target Engine</h3>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Model Selection</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto custom-scrollbar pr-2">
                        {ALL_LLM_MODELS.map(m => (
                            <button 
                                key={m}
                                onClick={() => setModel(m)}
                                className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${model === m ? 'bg-indigo-600 text-white border-indigo-400 shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 border-transparent hover:border-gray-200'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Neural Tuning */}
                <div className="modern-card p-6 space-y-5 border border-indigo-500/10 shadow-lg shadow-indigo-500/5">
                    <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">3. Advanced Neural Tuning</h3>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">High-Level Control</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {NEURAL_TUNING.map(s => (
                            <button 
                                key={s.id}
                                onClick={() => toggleTuning(s.id)}
                                className={`text-left p-4 rounded-2xl border-2 transition-all duration-500 group relative overflow-hidden ${selectedTuning.has(s.id) ? 'bg-indigo-600 border-indigo-400 shadow-md' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-indigo-300'}`}
                            >
                                {selectedTuning.has(s.id) && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]"></div>}
                                <span className={`block text-[11px] font-black uppercase tracking-tight mb-1 ${selectedTuning.has(s.id) ? 'text-white' : 'text-indigo-600'}`}>{s.label}</span>
                                <span className={`text-[10px] leading-snug font-medium ${selectedTuning.has(s.id) ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'}`}>{s.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. Knowledge Context */}
                <div className="modern-card p-6 space-y-5 border border-indigo-500/10">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                            <h3 className="font-bold text-gray-800 dark:text-gray-100">4. Knowledge Context</h3>
                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Inject Saved Background</p>
                        </div>
                        <button 
                            onClick={onSaveNewContext}
                            className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"
                            title="Add New Context"
                        >
                            +
                        </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                        {userContexts.length === 0 ? (
                            <p className="text-[10px] text-gray-400 font-medium italic p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">No contexts saved. Click "+" to add background info like Brand Voice or Project Goals.</p>
                        ) : (
                            userContexts.map(context => (
                                <button 
                                    key={context.id}
                                    onClick={() => toggleContext(context.id)}
                                    className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-2 flex items-center justify-between ${selectedContexts.has(context.id) ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-500' : 'bg-white dark:bg-gray-800 text-gray-500 border-transparent hover:border-gray-200'}`}
                                >
                                    <span className="truncate pr-2">{context.title}</span>
                                    {selectedContexts.has(context.id) && (
                                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* 5. Logic Blueprints - Expanded */}
                <div className="modern-card p-6 space-y-5">
                    <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">5. Logic Blueprints</h3>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Structural Modifiers</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                        {BLUEPRINTS.map(s => (
                            <button 
                                key={s.id}
                                onClick={() => toggleBlueprint(s.id)}
                                className={`text-left p-4 rounded-2xl border-2 transition-all duration-300 ${selectedBlueprints.has(s.id) ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-indigo-200'}`}
                            >
                                <span className={`block text-[11px] font-black uppercase tracking-tight mb-1 ${selectedBlueprints.has(s.id) ? 'text-indigo-600' : 'text-gray-700 dark:text-gray-300'}`}>{s.label}</span>
                                <span className="text-[10px] leading-snug text-gray-500 dark:text-gray-400 font-medium">{s.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Interface */}
            <main className="lg:col-span-9 space-y-10">
                <section className="modern-card p-8 space-y-6 overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Prompt Optimizer</h2>
                            <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest mt-1">Transform crude inputs into high-dimensional instructions</p>
                        </div>
                    </div>

                    <div className="relative group">
                        <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Input your base instruction or draft here..."
                            className="w-full h-56 p-8 text-xl bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[2.5rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 resize-none font-medium transition-all shadow-inner custom-scrollbar"
                        />
                        
                        <div className="absolute bottom-6 right-6 flex items-center gap-3">
                            <div className="px-4 py-2 bg-white/95 dark:bg-black/80 backdrop-blur-md rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-2xl flex items-center gap-4 transition-all hover:scale-105">
                                <div className="flex flex-col items-center border-r border-gray-200 dark:border-gray-800 pr-4">
                                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter">Characters</span>
                                    <span className="text-sm font-black text-gray-900 dark:text-white">{input.length}</span>
                                </div>
                                <div className="flex flex-col items-center relative">
                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Est. Tokens</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`text-sm font-black transition-all duration-300 ${selectedTuning.has('tokenization') ? 'text-indigo-600 scale-110' : 'text-gray-900 dark:text-white'}`}>
                                            {estTokens}
                                        </span>
                                        {selectedTuning.has('tokenization') && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" title="Optimized Mode Active"></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                        <p className="text-xs text-gray-500 font-semibold italic">Efficiency Status: {selectedTuning.has('tokenization') ? 'Structural Tokenization Active (Optimized)' : 'Standard Tokenization (Unoptimized)'}</p>
                        <button 
                            onClick={handleImprove}
                            disabled={isProcessing || !input.trim()}
                            className="btn-main w-full sm:w-auto px-12 py-4 shadow-xl shadow-indigo-500/20 disabled:opacity-50 text-base uppercase tracking-widest"
                        >
                            {isProcessing ? "Optimizing..." : "Initialize Optimization"}
                        </button>
                    </div>
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-10 gap-8">
                    <div className="xl:col-span-7 flex flex-col bg-indigo-600 rounded-[2.5rem] overflow-hidden shadow-2xl relative min-h-[500px]">
                        <div className="px-8 py-5 bg-black/10 flex justify-between items-center text-white border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className={`w-2.5 h-2.5 rounded-full ${isProcessing ? 'bg-white animate-pulse' : 'bg-indigo-300 shadow-[0_0_10px_#818cf8]'}`}></div>
                                <span className="font-black text-xs uppercase tracking-[0.3em]">Optimized Output</span>
                            </div>
                            {result && (
                                <button 
                                    onClick={() => navigator.clipboard.writeText(result)}
                                    className="px-4 py-2 hover:bg-white/10 rounded-xl transition-all text-[10px] font-black uppercase border border-white/20 tracking-widest"
                                >
                                    Copy Result
                                </button>
                            )}
                        </div>
                        <div className="flex-1 p-10 text-white text-xl font-medium whitespace-pre-wrap leading-relaxed">
                            {result ? (
                                <div className="animate-fade-in">{result}</div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-40 py-20 text-center">
                                    <span className="text-6xl mb-6">⚙️</span>
                                    <p className="text-sm font-black uppercase tracking-[0.5em]">Neural generation ready</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="xl:col-span-3 modern-card p-8 space-y-10 shadow-premium">
                        <div>
                            <h4 className="font-black text-gray-800 dark:text-white uppercase tracking-tight text-lg mb-1">Audit Suite</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Semantic Evaluation</p>
                        </div>
                        
                        {audit ? (
                            <div className="space-y-8 animate-fade-in">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-[11px] font-black uppercase">
                                            <span className="text-gray-500">Semantic Clarity</span>
                                            <span className="text-indigo-600">{audit.clarity}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 transition-all duration-1000" style={{width: `${audit.clarity}%`}}></div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-[11px] font-black uppercase">
                                            <span className="text-gray-500">Logical Rigor</span>
                                            <span className="text-emerald-500">{audit.specificity}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 transition-all duration-1000" style={{width: `${audit.specificity}%`}}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                                    <div className="p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border-l-4 border-indigo-500">
                                        <p className="text-[10px] font-black uppercase text-indigo-600 mb-3 tracking-widest">Final Audit Verdict</p>
                                        <p className="text-sm italic font-medium text-gray-700 dark:text-gray-300 leading-relaxed">"{audit.overall_verdict}"</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                                <p className="text-xs font-bold uppercase tracking-widest">Awaiting Analysis</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};
