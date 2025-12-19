
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { UserContext } from '../prompts/collection';
import { generatePromptStream, SYSTEM_INSTRUCTION_META_PROMPT, auditPrompt, critiquePrompt } from '../services/geminiService';

interface OptimizerViewProps {
    userContexts: UserContext[];
    onSaveNewContext: () => void;
    onDeleteContext: (contextId: string) => void;
    onSavePrompt: (prompt: string) => void;
    addToHistory: (prompt: string) => void;
}

// --- High-End High-Contrast Icon Set ---
const Icons = {
    Persona: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Logic: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    Safety: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Format: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>,
    Audience: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    Tone: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
    Compare: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    Copy: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    History: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Settings: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>,
    Check: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
    FewShot: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
    XML: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    Negative: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
};

type PatternId = 'persona' | 'logic' | 'safety' | 'format' | 'audience' | 'tone' | 'few_shot' | 'xml_tags' | 'negative_constraints';

interface Pattern {
    id: PatternId;
    label: string;
    icon: () => React.ReactNode;
    desc: string;
    category: 'Core' | 'Modifiers' | 'Control';
}

const PATTERNS: Pattern[] = [
    { id: 'persona', label: 'Persona', icon: Icons.Persona, desc: 'Assigns a specific professional role/identity', category: 'Core' },
    { id: 'audience', label: 'Audience', icon: Icons.Audience, desc: 'Targets content for specific user demographics', category: 'Core' },
    { id: 'logic', label: 'Reasoning', icon: Icons.Logic, desc: 'Enforces internal step-by-step reasoning', category: 'Core' },
    { id: 'few_shot', label: 'Few-Shot', icon: Icons.FewShot, desc: 'Includes example placeholders for instruction', category: 'Core' },
    { id: 'xml_tags', label: 'XML Tags', icon: Icons.XML, desc: 'Wraps instructions in XML for strict parsing', category: 'Modifiers' },
    { id: 'format', label: 'Structure', icon: Icons.Format, desc: 'Specifies output formats (JSON, Tables, etc.)', category: 'Modifiers' },
    { id: 'tone', label: 'Style/Tone', icon: Icons.Tone, desc: 'Calibrates vocabulary and stylistic vibe', category: 'Modifiers' },
    { id: 'negative_constraints', label: 'Negative', icon: Icons.Negative, desc: 'Lists what the AI MUST avoid doing', category: 'Control' },
    { id: 'safety', label: 'Safety', icon: Icons.Safety, desc: 'Injects hallucination-checking logic', category: 'Control' },
];

const TEMPLATES = [
    { cat: 'Development', title: 'Code Architect', content: 'Review this {{language}} logic for bottlenecks: {{code}}', patterns: ['persona', 'logic', 'few_shot'] as PatternId[] },
    { cat: 'Creative', title: 'Narrative Engine', content: 'Write a story in the style of {{author}} about {{topic}}', patterns: ['persona', 'tone', 'negative_constraints'] as PatternId[] },
    { cat: 'General', title: 'Concept Simplifier', content: 'Explain {{complex_topic}} to a {{target_level}} student', patterns: ['audience', 'few_shot', 'logic', 'safety'] as PatternId[] },
];

interface Iteration {
    id: string;
    prompt: string;
    timestamp: number;
    audit: { clarity: number; specificity: number; reasoning: number };
}

export const OptimizerView: React.FC<OptimizerViewProps> = ({ onSavePrompt }) => {
    const [basePrompt, setBasePrompt] = useState("");
    const [selectedPatterns, setSelectedPatterns] = useState<Set<PatternId>>(new Set(['persona', 'logic']));
    const [llmModel, setLlmModel] = useState<'Gemini' | 'ChatGPT' | 'Claude' | 'DeepSeek' | 'Llama' | 'Grok' | 'Qwen'>('Gemini');
    
    const [temp, setTemp] = useState(0.7);
    const [topP, setTopP] = useState(0.9);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [activeDraft, setActiveDraft] = useState<Iteration | null>(null);
    const [history, setHistory] = useState<Iteration[]>([]);
    const [critiques, setCritiques] = useState<{ weakness: string; fix_suggestion: string }[]>([]);
    
    const [activeTab, setActiveTab] = useState('General');
    const [showInsights, setShowInsights] = useState(true);
    const [copySuccess, setCopySuccess] = useState(false);

    const togglePattern = (id: PatternId) => {
        setSelectedPatterns(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleOptimize = async (feedback?: string) => {
        if (!basePrompt.trim() || isOptimizing) return;
        setIsOptimizing(true);
        setCritiques([]);

        const patternDetails = Array.from(selectedPatterns)
            .map(p => {
                const pat = PATTERNS.find(item => item.id === p);
                return `- ${pat?.label}: ${pat?.desc}`;
            })
            .join('\n');
            
        const input = `ACT AS: World-Class Prompt Engineer
TARGET LLM MODEL: ${llmModel}
OBJECTIVE: ${basePrompt}
MANDATORY LOGIC PATTERNS TO INTEGRATE:
${patternDetails}
${feedback ? `\nADDITIONAL REFINEMENT: ${feedback}` : ''}

INSTRUCTION: Synthesize the final optimized prompt structure. Ensure every selected logic pattern is explicitly functional in the output text. Return raw text only.`;

        try {
            const stream = await generatePromptStream(input, temp, topP, SYSTEM_INSTRUCTION_META_PROMPT);
            let fullText = "";
            for await (const chunk of stream) {
                fullText += chunk;
                // Partial update for visual feedback
                if (fullText.length % 50 === 0) {
                    setActiveDraft(prev => prev ? { ...prev, prompt: fullText } : { id: 'temp', prompt: fullText, timestamp: Date.now(), audit: { clarity: 0, specificity: 0, reasoning: 0 } });
                }
            }
            
            const auditData = await auditPrompt(fullText);
            const crit = await critiquePrompt(fullText);
            setCritiques(crit);

            const newIteration: Iteration = {
                id: Math.random().toString(36).substr(2, 9),
                prompt: fullText,
                timestamp: Date.now(),
                audit: { clarity: auditData.clarity, specificity: auditData.specificity, reasoning: auditData.reasoning }
            };

            setHistory(prev => [newIteration, ...prev].slice(0, 10));
            setActiveDraft(newIteration);
        } catch (e) {
            console.error("Cross-browser synthesis error:", e);
            alert("Neural connection failed. Please verify your API key and network connection.");
        } finally {
            setIsOptimizing(false);
        }
    };

    const MetricBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
        <div className="w-full">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                <span className={`text-xs font-black ${color}`}>{value}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div 
                    className={`h-full ${color.replace('text', 'bg')} shadow-[0_0_12px_rgba(99,102,241,0.5)] transition-all duration-1000 ease-out`} 
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 max-w-7xl mx-auto py-2 animate-fade-up">
            
            {/* --- SIDEBAR (LEFT) --- */}
            <aside className="lg:col-span-3 flex flex-col gap-8 overflow-y-auto custom-scrollbar pr-4">
                <div className="p-8 bg-indigo-600 dark:bg-indigo-950/40 rounded-[2.5rem] border border-indigo-400/30 shadow-[0_0_25px_rgba(99,102,241,0.2)]">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-white/10 rounded-2xl text-white"><Icons.Settings /></div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tighter">Optimizer</h2>
                            <p className="text-[9px] font-black text-indigo-200/60 uppercase tracking-widest">Protocol v5.2</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Target LLM Model</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Gemini', 'ChatGPT', 'Claude', 'DeepSeek', 'Llama', 'Grok', 'Qwen'].map(m => (
                                    <button 
                                        key={m} 
                                        onClick={() => setLlmModel(m as any)}
                                        className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${llmModel === m ? 'bg-white text-indigo-600 border-white shadow-lg' : 'bg-indigo-700/30 text-indigo-100/50 border-transparent hover:border-white/20'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8 p-4">
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-4">Core Synthesis Patterns</label>
                        <div className="grid grid-cols-2 gap-4">
                            {PATTERNS.map(p => {
                                const isActive = selectedPatterns.has(p.id);
                                return (
                                    <button 
                                        key={p.id} 
                                        onClick={() => togglePattern(p.id)}
                                        className={`flex flex-col items-center justify-center p-5 rounded-[2rem] border-2 transition-all group ${isActive ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-indigo-400'}`}
                                    >
                                        <div className={`mb-2 transform transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-300 dark:text-slate-700'}`}>
                                            {p.icon()}
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-center leading-none tracking-tight">{p.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between text-[11px] font-black uppercase text-slate-400">
                                <span>Entropy Level</span>
                                <span className="text-indigo-500 font-black">{temp}</span>
                            </div>
                            <input type="range" min="0" max="1" step="0.1" value={temp} onChange={e => setTemp(parseFloat(e.target.value))} className="w-full accent-indigo-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer" />
                        </div>
                    </div>
                </div>
            </aside>

            {/* --- MAIN CONTENT (CENTER/RIGHT) --- */}
            <main className="lg:col-span-9 flex flex-col gap-10">
                
                {/* Neural Composition Box */}
                <section className="bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-[3rem] p-10 shadow-premium relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] pointer-events-none group-focus-within:bg-indigo-500/20 transition-all duration-1000"></div>
                    
                    <div className="relative z-10 space-y-8">
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter uppercase leading-none">Neural Input</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Stage 01 // Objective Injection</p>
                            </div>
                            <div className="flex flex-wrap justify-end gap-2 max-w-md">
                                {Array.from(selectedPatterns).map(id => (
                                    <span key={id} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase rounded-xl border border-indigo-100 dark:border-indigo-900/40 shadow-sm">
                                        {PATTERNS.find(p => p.id === id)?.label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <textarea 
                            value={basePrompt}
                            onChange={(e) => setBasePrompt(e.target.value)}
                            placeholder={`Define your high-level goal for ${llmModel}...`}
                            className="w-full h-40 bg-transparent text-slate-900 dark:text-white text-4xl font-extrabold placeholder-slate-100 dark:placeholder-slate-800/40 outline-none resize-none leading-tight tracking-tight selection:bg-indigo-100"
                        />

                        <div className="flex justify-between items-center pt-8 border-t border-slate-50 dark:border-slate-800">
                            <span className="text-xs font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                                Target: {llmModel} Matrix
                            </span>
                            <button 
                                onClick={() => handleOptimize()}
                                disabled={isOptimizing || !basePrompt.trim()}
                                className="relative flex items-center gap-6 px-12 py-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-2xl font-black text-sm tracking-[0.2em] uppercase transition-all shadow-[0_10px_30px_rgba(99,102,241,0.4)] hover:-translate-y-1 active:translate-y-0"
                            >
                                {isOptimizing ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span className="animate-pulse">Synthesizing...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Icons.Logic />
                                        <span>Initialize Synthesis</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </section>

                <div className="flex flex-col xl:flex-row gap-10 flex-1 min-h-0">
                    
                    {/* Output Console */}
                    <div className={`flex flex-col bg-slate-950 border-2 border-indigo-500/30 rounded-[3rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-500 ${showInsights ? 'xl:w-2/3' : 'w-full'}`}>
                        <div className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-xl">
                            <div className="flex items-center gap-4">
                                <span className={`w-3 h-3 rounded-full ${isOptimizing ? 'bg-indigo-500 animate-ping' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`}></span>
                                <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em]">Optimized_Trace_Output</span>
                            </div>
                            <div className="flex items-center gap-4">
                                {activeDraft && (
                                    <button 
                                        onClick={() => { navigator.clipboard.writeText(activeDraft.prompt); setCopySuccess(true); setTimeout(()=>setCopySuccess(false), 2000); }}
                                        className="p-3 bg-white/5 text-indigo-400 hover:text-white border border-white/10 rounded-2xl transition-all"
                                    >
                                        {copySuccess ? <Icons.Check /> : <Icons.Copy />}
                                    </button>
                                )}
                                <button onClick={() => setShowInsights(!showInsights)} className={`p-3 rounded-2xl border transition-all ${showInsights ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white/5 text-indigo-400 border-white/10'}`}>
                                    <Icons.Logic />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar font-mono text-base leading-relaxed tracking-tight selection:bg-indigo-500 selection:text-white">
                            {activeDraft ? (
                                <div className="space-y-6 animate-fade-up">
                                    <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/10 shadow-inner">
                                        <pre className="whitespace-pre-wrap text-indigo-100">{activeDraft.prompt}</pre>
                                    </div>
                                    <div className="flex justify-end">
                                        <button 
                                            onClick={() => onSavePrompt(activeDraft.prompt)}
                                            className="px-8 py-3 bg-white text-slate-950 font-black uppercase text-[11px] tracking-widest rounded-xl hover:bg-indigo-400 transition-colors"
                                        >
                                            Commit_To_Library
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center py-20 opacity-20 text-center space-y-6">
                                    <div className="w-20 h-20 border-4 border-dashed border-indigo-500/50 rounded-full flex items-center justify-center animate-spin-slow">
                                        <Icons.Logic />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-[0.6em] text-indigo-400">System_Awaiting_Neural_Compute</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Diagnostics Panel */}
                    <div className={`flex flex-col bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-premium transition-all duration-500 ${showInsights ? 'xl:w-1/3' : 'hidden'}`}>
                        <div className="px-10 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Auditor_Diagnostics</span>
                        </div>
                        <div className="flex-1 p-8 space-y-10 overflow-y-auto custom-scrollbar">
                            {activeDraft ? (
                                <div className="space-y-12 animate-fade-up">
                                    <div className="space-y-8">
                                        <MetricBar label="Syntactic Clarity" value={activeDraft.audit.clarity} color="text-indigo-600" />
                                        <MetricBar label="Logical Specificity" value={activeDraft.audit.specificity} color="text-amber-600" />
                                        <MetricBar label="Inference Chain" value={activeDraft.audit.reasoning} color="text-emerald-600" />
                                    </div>

                                    <div className="space-y-6 pt-6 border-t border-slate-50 dark:border-slate-800">
                                        <p className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Neural Refinements</p>
                                        <div className="space-y-4">
                                            {critiques.map((c, i) => (
                                                <div key={i} className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border-2 border-transparent hover:border-amber-400/50 transition-all cursor-default">
                                                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300 italic mb-4 leading-relaxed">"{c.weakness}"</p>
                                                    <button 
                                                        onClick={() => handleOptimize(`Apply fix: ${c.fix_suggestion}`)}
                                                        className="w-full py-3 bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900/30 text-[10px] font-black uppercase text-amber-600 rounded-xl hover:bg-amber-500 hover:text-white transition-all"
                                                    >
                                                        Patch // {c.fix_suggestion}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-20 grayscale">
                                    <div className="text-7xl mb-8">🔭</div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.8em]">Observatory_Standby</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin-slow { animation: spin-slow 12s linear infinite; }
            `}</style>
        </div>
    );
};
