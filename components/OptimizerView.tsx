
import React, { useState, useMemo, useEffect } from 'react';
import { UserContext } from '../prompts/collection';
import { generatePromptStream, SYSTEM_INSTRUCTION_META_PROMPT, auditPrompt, critiquePrompt } from '../services/geminiService';

interface OptimizerViewProps {
    userContexts: UserContext[];
    onSaveNewContext: () => void;
    onDeleteContext: (contextId: string) => void;
    onSavePrompt: (prompt: string) => void;
    addToHistory: (prompt: string) => void;
}

const Icons = {
    Persona: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Logic: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    Safety: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Format: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>,
    Audience: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    Tone: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
    Copy: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    Check: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
    Clear: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
    Add: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
    Book: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    Scan: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01" /></svg>,
    Settings: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

type PatternId = 'persona' | 'logic' | 'safety' | 'format' | 'audience' | 'tone' | 'few_shot' | 'xml_tags' | 'negative_constraints';

interface Pattern {
    id: PatternId;
    label: string;
    icon: () => React.ReactNode;
    desc: string;
    impact: string;
    category: 'Essential' | 'Styling' | 'Advanced';
}

const PATTERNS: Pattern[] = [
    { id: 'persona', label: 'Expert Role', icon: Icons.Persona, desc: 'Tells the AI to act like a specific professional.', impact: 'Forces the model to adopt the lexicon and mindset of an authority, leading to deeper insights.', category: 'Essential' },
    { id: 'audience', label: 'Target Users', icon: Icons.Audience, desc: 'Defines who will read or use the answer.', impact: 'Calibrates readability and complexity levels based on the user\'s expertise.', category: 'Essential' },
    { id: 'logic', label: 'Thinking Steps', icon: Icons.Logic, desc: 'Makes the AI think step-by-step for better logic.', impact: 'Enables Chain-of-Thought reasoning, significantly reducing hallucinations in complex tasks.', category: 'Essential' },
    { id: 'few_shot', label: 'Show Examples', icon: Icons.Format, desc: 'Includes example answers for the AI to follow.', impact: 'Provides clear structural patterns for the model to mimic, ensuring predictable formatting.', category: 'Essential' },
    { id: 'xml_tags', label: 'Organized Info', icon: Icons.Logic, desc: 'Uses structured tags to keep the prompt clean.', impact: 'Improves machine parsability and helps the LLM distinguish between instructions and data.', category: 'Styling' },
    { id: 'format', label: 'Clear Layout', icon: Icons.Format, desc: 'Specifies how the answer should look (e.g. Tables).', impact: 'Eliminates ambiguity in the final response structure for easier integration into workflows.', category: 'Styling' },
    { id: 'tone', label: 'Writing Vibe', icon: Icons.Tone, desc: 'Sets the mood (e.g. Friendly, Professional).', impact: 'Adjusts the linguistic flavor to match your brand or project personality.', category: 'Styling' },
    { id: 'negative_constraints', label: 'Do Not List', icon: Icons.Safety, desc: 'Lists things the AI MUST NOT mention or do.', impact: 'Explicitly restricts output to avoid common pitfalls or unwanted topics.', category: 'Advanced' },
    { id: 'safety', label: 'Safe Guard', icon: Icons.Safety, desc: 'Prevents the AI from making up fake info.', impact: 'Reinforces grounding and truthfulness, though it may limit creative speculation.', category: 'Advanced' },
];

const MODEL_TOOLTIPS = {
    Gemini: "Optimizes for Google's multimodal reasoning. Best for creative synthesis and large context windows.",
    ChatGPT: "Calibrates syntax for OpenAI's GPT models. Excels at conversational flow and instruction following.",
    Claude: "Tailors instructions for Anthropic's constitutional AI. Focuses on nuance, safety, and long-form precision.",
    DeepSeek: "Specialized syntax for DeepSeek's coding and mathematical reasoning cores.",
    Llama: "Generic open-source optimization. Suitable for local LLM deployments and Meta's Llama models.",
    Grok: "Injects personality-aware instructions for xAI's real-time knowledge integration.",
    Qwen: "Optimizes for Alibaba's Qwen models, focusing on bilingual proficiency and technical tasks."
};

interface Iteration {
    id: string;
    prompt: string;
    timestamp: number;
    audit: { clarity: number; specificity: number; reasoning: number };
}

export const OptimizerView: React.FC<OptimizerViewProps> = ({ userContexts, onSaveNewContext, onDeleteContext, onSavePrompt }) => {
    const [basePrompt, setBasePrompt] = useState("");
    const [selectedPatterns, setSelectedPatterns] = useState<Set<PatternId>>(new Set(['persona', 'logic']));
    const [selectedContextIds, setSelectedContextIds] = useState<Set<string>>(new Set());
    const [llmModel, setLlmModel] = useState<'Gemini' | 'ChatGPT' | 'Claude' | 'DeepSeek' | 'Llama' | 'Qwen' | 'Grok' | 'Qwen'>('Gemini');
    
    // Tuning Parameters
    const [temp, setTemp] = useState(0.7);
    const [topP, setTopP] = useState(0.9);
    const [inferenceDepth, setInferenceDepth] = useState<'Draft' | 'Standard' | 'Deep'>('Standard');
    const [lengthLimit, setLengthLimit] = useState<'Short' | 'Medium' | 'Long'>('Medium');
    const [showAdvancedTuning, setShowAdvancedTuning] = useState(false);

    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isAuditing, setIsAuditing] = useState(false);
    const [optimizationError, setOptimizationError] = useState<string | null>(null);
    const [activeDraft, setActiveDraft] = useState<Iteration | null>(null);
    const [critiques, setCritiques] = useState<{ weakness: string; fix_suggestion: string }[]>([]);
    const [showInsights, setShowInsights] = useState(true);
    const [copySuccess, setCopySuccess] = useState(false);

    const MAX_LENGTH = 2500;

    const dynamicPlaceholder = useMemo(() => {
        const activeNames = Array.from(selectedPatterns).map(id => PATTERNS.find(p => p.id === id)?.label).filter(Boolean);
        let baseMsg = `Define your high-level goal for ${llmModel}...`;
        if (activeNames.includes('Expert Role')) baseMsg = `Describe the project your ${llmModel} expert should tackle...`;
        else if (activeNames.includes('Target Users')) baseMsg = `What should ${llmModel} create for your specific audience?`;
        else if (activeNames.includes('Writing Vibe')) baseMsg = `What content should ${llmModel} write in your selected style?`;
        return baseMsg;
    }, [llmModel, selectedPatterns]);

    const togglePattern = (id: PatternId) => {
        setSelectedPatterns(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleContext = (id: string) => {
        setSelectedContextIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleOptimize = async (feedback?: string) => {
        if (!basePrompt.trim() || isOptimizing) return;
        setIsOptimizing(true);
        setOptimizationError(null);
        setCritiques([]);

        try {
            const activeSkills = Array.from(selectedPatterns).map(id => PATTERNS.find(p => p.id === id)?.label).join(', ');
            const activeContextsText = Array.from(selectedContextIds)
                .map(id => userContexts.find(c => c.id === id))
                .filter(Boolean)
                .map(c => `[KNOWLEDGE_BASE: ${c?.title}]\n${c?.content}`)
                .join('\n\n');

            const instructionInput = `
TARGET MODEL: ${llmModel}
USER REQUEST: ${basePrompt}
ACTIVE SKILLS TO INJECT: ${activeSkills}
TUNING PARAMETERS:
- Temperature: ${temp}
- Top-P: ${topP}
- Inference Depth: ${inferenceDepth} (Draft=Low Detail, Deep=Ultra Technical)
- Output Length Preference: ${lengthLimit}
${activeContextsText ? `SUPPLEMENTARY CONTEXT:\n${activeContextsText}` : ''}
${feedback ? `\nFEEDBACK REFINEMENT: ${feedback}` : ''}
            `.trim();

            const stream = await generatePromptStream(instructionInput, temp, topP, SYSTEM_INSTRUCTION_META_PROMPT);
            
            let fullText = "";
            for await (const chunk of stream) {
                fullText += chunk;
                if (fullText.length % 20 === 0) {
                    setActiveDraft({ id: 'temp', prompt: fullText, timestamp: Date.now(), audit: { clarity: 0, specificity: 0, reasoning: 0 } });
                }
            }
            
            setIsAuditing(true);
            const auditData = await auditPrompt(fullText);
            const crit = await critiquePrompt(fullText);
            setCritiques(crit);
            setActiveDraft({ id: Date.now().toString(), prompt: fullText, timestamp: Date.now(), audit: auditData });
        } catch (e: any) {
            console.error("Optimization Failure:", e);
            const msg = e.message || "Connection failed.";
            if (msg.includes("blocked") || msg.includes("Failed to fetch")) {
                setOptimizationError("Connection blocked by browser or network. Please disable VPN or Ad-blockers and try again.");
            } else {
                setOptimizationError("Neural Core Timeout. Please check your API key and network stability.");
            }
        } finally {
            setIsOptimizing(false);
            setIsAuditing(false);
        }
    };

    const triggerReAudit = async () => {
        if (!activeDraft || isAuditing) return;
        setIsAuditing(true);
        try {
            const auditData = await auditPrompt(activeDraft.prompt);
            const crit = await critiquePrompt(activeDraft.prompt);
            setCritiques(crit);
            setActiveDraft(prev => prev ? { ...prev, audit: auditData } : null);
        } finally {
            setIsAuditing(false);
        }
    };

    const MetricBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
        <div className="w-full">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                <span className={`text-xs font-black ${color}`}>{value}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div className={`h-full ${color.replace('text', 'bg')} shadow-[0_0_10px_currentColor] transition-all duration-1000 ease-out`} style={{ width: `${value}%` }} />
            </div>
        </div>
    );

    const counterStatus = useMemo(() => {
        const percent = (basePrompt.length / MAX_LENGTH) * 100;
        if (percent > 95) return { color: 'text-rose-500', bg: 'bg-rose-500/10', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.4)]', border: 'border-rose-500/50', pulse: true };
        if (percent > 80) return { color: 'text-amber-500', bg: 'bg-amber-500/10', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]', border: 'border-amber-500/50', pulse: false };
        return { color: 'text-indigo-500', bg: 'bg-indigo-500/10', glow: 'shadow-sm', border: 'border-indigo-500/20', pulse: false };
    }, [basePrompt.length]);

    const neuralComplexityRating = useMemo(() => {
        const count = selectedPatterns.size + selectedContextIds.size;
        if (count > 6) return { label: 'High Precision', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
        if (count > 3) return { label: 'Intermediate', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
        return { label: 'Standard', color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' };
    }, [selectedPatterns.size, selectedContextIds.size]);

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 max-w-7xl mx-auto py-2 animate-fade-up">
            
            <aside className="lg:col-span-3 flex flex-col gap-8 overflow-y-auto custom-scrollbar pr-4">
                <div className="p-8 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] border border-indigo-400/30 shadow-2xl">
                    <div className="space-y-6">
                        <label className="text-[11px] font-black text-white uppercase tracking-widest">Target AI Core</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(Object.keys(MODEL_TOOLTIPS) as Array<keyof typeof MODEL_TOOLTIPS>).map(m => (
                                <button key={m} onClick={() => setLlmModel(m as any)} title={MODEL_TOOLTIPS[m]} className={`py-3 px-1 rounded-2xl text-[10px] font-black uppercase border-2 transition-all ${llmModel === m ? 'bg-white text-indigo-700 border-white shadow-[0_0_15px_rgba(255,255,255,0.5)] scale-105' : 'bg-indigo-900/40 text-indigo-100/60 border-transparent hover:border-white/20'}`}>{m}</button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-10 p-4">
                    <div>
                        <label className="text-[12px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-5">Neural Skills</label>
                        <div className="grid grid-cols-2 gap-4">
                            {PATTERNS.map(p => {
                                const isActive = selectedPatterns.has(p.id);
                                return (
                                    <button key={p.id} onClick={() => togglePattern(p.id)} title={`${p.desc}\nImpact: ${p.impact}`} className={`flex flex-col items-center justify-center p-5 rounded-[2.5rem] border-2 transition-all duration-300 transform ${isActive ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)] scale-105' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-indigo-400 hover:scale-102'}`}>
                                        <div className={`mb-3 transition-colors ${isActive ? 'text-white' : 'text-slate-300 dark:text-slate-700'}`}>{p.icon()}</div>
                                        <span className="text-[10px] font-black uppercase text-center leading-none tracking-tight">{p.label}</span>
                                        {isActive && <div className="mt-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]"></div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-5">
                            <label className="text-[12px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Active Context</label>
                            <button onClick={onSaveNewContext} title="Add a new custom knowledge base or brand voice context." className="p-1.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition-colors"><Icons.Add /></button>
                        </div>
                        <div className="space-y-3">
                            {userContexts.length === 0 ? (
                                <p className="text-[10px] font-bold text-slate-400 italic text-center py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">No Knowledge Bases Saved.</p>
                            ) : (
                                userContexts.map(ctx => {
                                    const isActive = selectedContextIds.has(ctx.id);
                                    return (
                                        <button key={ctx.id} onClick={() => toggleContext(ctx.id)} title={`Inject "${ctx.title}" into the synthesis process for personalized results.`} className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${isActive ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}><Icons.Book /></div>
                                                <span className="text-[10px] font-black uppercase tracking-tight truncate max-w-[100px]">{ctx.title}</span>
                                            </div>
                                            {isActive && <Icons.Check />}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
                        <div className="flex justify-between items-center">
                            <label className="text-[12px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Neural Tuning</label>
                            <button 
                                onClick={() => setShowAdvancedTuning(!showAdvancedTuning)}
                                className={`p-2 rounded-lg transition-all ${showAdvancedTuning ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                                title="Access advanced synthesis parameters"
                            >
                                <Icons.Settings />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                                    <span>Creativity (Temp)</span>
                                    <span className="text-indigo-600 dark:text-indigo-400">{temp.toFixed(1)}</span>
                                </div>
                                <input type="range" min="0" max="1" step="0.1" value={temp} onChange={e => setTemp(parseFloat(e.target.value))} title="Lower for factual accuracy, higher for creative flair." className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer" />
                            </div>

                            {showAdvancedTuning && (
                                <div className="space-y-5 animate-fade-down">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                                            <span>Diversity (Top-P)</span>
                                            <span className="text-emerald-500">{topP.toFixed(2)}</span>
                                        </div>
                                        <input type="range" min="0" max="1" step="0.05" value={topP} onChange={e => setTopP(parseFloat(e.target.value))} title="Controls how much of the probability mass to consider. High = more variety." className="w-full accent-emerald-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer" />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-400">Inference Depth</label>
                                        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                            {['Draft', 'Standard', 'Deep'].map(d => (
                                                <button key={d} onClick={() => setInferenceDepth(d as any)} className={`py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${inferenceDepth === d ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm border border-indigo-500/20' : 'text-slate-400 hover:text-slate-600'}`}>{d}</button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-400">Response Limit</label>
                                        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                            {['Short', 'Medium', 'Long'].map(l => (
                                                <button key={l} onClick={() => setLengthLimit(l as any)} className={`py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${lengthLimit === l ? 'bg-white dark:bg-slate-800 text-amber-600 shadow-sm border border-amber-500/20' : 'text-slate-400 hover:text-slate-600'}`}>{l}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            <main className="lg:col-span-9 flex flex-col gap-10">
                <section className="bg-white dark:bg-slate-900 border-2 border-indigo-500/10 rounded-[3.5rem] p-12 shadow-premium relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] pointer-events-none"></div>
                    <div className="relative z-10 space-y-10">
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-4xl font-black text-indigo-700 dark:text-indigo-400 tracking-tighter uppercase leading-none">Your AI Idea</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4">Phase 01 // Objective Entry</p>
                            </div>
                        </div>

                        <div className="relative">
                            <textarea value={basePrompt} onChange={(e) => setBasePrompt(e.target.value.slice(0, MAX_LENGTH))} placeholder={dynamicPlaceholder} className="w-full h-44 bg-transparent text-slate-900 dark:text-white text-3xl font-extrabold placeholder-slate-100 dark:placeholder-slate-800 outline-none resize-none leading-snug tracking-tight selection:bg-indigo-100" />
                            <div className="absolute bottom-4 right-4 flex items-center gap-4 z-20">
                                <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border-2 backdrop-blur-xl transition-all duration-500 ${counterStatus.bg} ${counterStatus.border} ${counterStatus.glow} ${counterStatus.pulse ? 'animate-pulse scale-105' : ''}`} title="Current character usage versus system limit (2500).">
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-sm font-black tracking-tighter ${counterStatus.color}`}>{basePrompt.length}</span>
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase">/ {MAX_LENGTH}</span>
                                        </div>
                                        <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                                            <div className={`h-full transition-all duration-300 ${counterStatus.color.replace('text', 'bg')}`} style={{ width: `${(basePrompt.length / MAX_LENGTH) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                                {basePrompt.length > 0 && (
                                    <button onClick={() => setBasePrompt("")} className="p-3.5 bg-slate-100 dark:bg-slate-800/80 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-2xl transition-all shadow-premium hover:scale-110 active:scale-95 group/clear" title="Clear all input and reset objective.">
                                        <div className="group-hover/clear:rotate-90 transition-transform duration-500"><Icons.Clear /></div>
                                    </button>
                                )}
                            </div>
                        </div>

                        {optimizationError && (
                            <div className="p-6 bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-200 dark:border-rose-900 rounded-3xl animate-fade-in flex items-center gap-4">
                                <div className="p-3 bg-rose-500 text-white rounded-2xl">
                                    <Icons.Safety />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-rose-700 dark:text-rose-300 uppercase tracking-widest">Synthesis Blocked</p>
                                    <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-1">{optimizationError}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-10 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">Optimizing Engine</span>
                                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase">{llmModel} Core Integration</span>
                            </div>
                            <button onClick={() => handleOptimize()} disabled={isOptimizing || !basePrompt.trim()} title="Synthesize your objective into a professional meta-prompt using active neural skills." className="px-14 py-6 bg-indigo-700 hover:bg-indigo-600 disabled:opacity-40 text-white rounded-[2rem] font-black text-sm tracking-[0.2em] uppercase transition-all shadow-[0_15px_40px_rgba(67,56,202,0.4)] active:scale-95 transform hover:-translate-y-1">
                                {isOptimizing ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Synthesizing...</span>
                                    </div>
                                ) : "Build Professional Prompt"}
                            </button>
                        </div>
                    </div>
                </section>

                <div className="flex flex-col xl:flex-row gap-10">
                    <div className={`flex flex-col bg-slate-950 border-2 border-indigo-500/30 rounded-[3.5rem] overflow-hidden shadow-2xl transition-all duration-700 ${showInsights ? 'xl:w-2/3' : 'w-full'}`}>
                        <div className="px-12 py-8 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <div className={`w-2.5 h-2.5 rounded-full ${isOptimizing || isAuditing ? 'bg-indigo-500 animate-ping' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`}></div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.5em]">Final Professional Output</span>
                                    <div className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${neuralComplexityRating.color}`} title="Indicates the structural depth and logical density of the generated meta-prompt.">
                                        Complexity: {neuralComplexityRating.label}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowInsights(!showInsights)} className={`p-4 rounded-2xl border transition-all ${showInsights ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`} title={showInsights ? "Hide Quality Diagnostic" : "Show Quality Diagnostic"}>
                                    <Icons.Scan />
                                </button>
                                {activeDraft && (
                                    <button onClick={() => { navigator.clipboard.writeText(activeDraft.prompt); setCopySuccess(true); setTimeout(()=>setCopySuccess(false), 2000); }} title="Copy the synthesized meta-prompt to clipboard." className="p-4 bg-white/5 text-indigo-400 hover:text-white rounded-2xl border border-white/10 transition-all">
                                        {copySuccess ? <Icons.Check /> : <Icons.Copy />}
                                    </button>
                                )}
                                <button onClick={() => onSavePrompt(activeDraft?.prompt || '')} className="p-4 bg-white/5 text-indigo-400 hover:text-white rounded-2xl border border-white/10 transition-all" title="Save this engineered prompt to your library for future use.">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 p-12 overflow-y-auto custom-scrollbar font-mono text-base leading-relaxed text-indigo-100/90 selection:bg-indigo-600 font-medium">
                            {activeDraft ? (
                                <pre className="whitespace-pre-wrap animate-fade-in">{activeDraft.prompt}</pre>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-10 text-center space-y-6 py-20">
                                    <div className="text-8xl">⚡</div>
                                    <p className="text-sm font-black uppercase tracking-[0.8em] text-indigo-400">System Standby</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={`flex flex-col bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3.5rem] overflow-hidden shadow-premium transition-all duration-700 ${showInsights ? 'xl:w-1/3' : 'hidden'}`}>
                        <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Audit // Reports</span>
                            {activeDraft && !isAuditing && (
                                <button onClick={triggerReAudit} className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl transition-all" title="Rerun diagnostic scans.">
                                    <Icons.Scan />
                                </button>
                            )}
                        </div>
                        <div className="flex-1 p-10 space-y-12 overflow-y-auto custom-scrollbar">
                            {isAuditing ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-8 py-20">
                                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    <div className="text-center">
                                        <p className="text-sm font-black uppercase tracking-widest text-indigo-600 animate-pulse">Running Neural Scans</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-2">Checking logical density & clarity...</p>
                                    </div>
                                </div>
                            ) : activeDraft ? (
                                <div className="space-y-10 animate-fade-up">
                                    <div className="space-y-8">
                                        <MetricBar label="Easy to Read" value={activeDraft.audit.clarity} color="text-indigo-600" />
                                        <MetricBar label="Detailed Logic" value={activeDraft.audit.specificity} color="text-amber-500" />
                                        <MetricBar label="AI Smartness" value={activeDraft.audit.reasoning} color="text-emerald-500" />
                                    </div>
                                    <div className="space-y-6 pt-10 border-t border-slate-50 dark:border-slate-800">
                                        <p className="text-[11px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">Suggested Improvements</p>
                                        <div className="space-y-4">
                                            {critiques.length > 0 ? critiques.map((c, i) => (
                                                <div key={i} className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border-2 border-transparent hover:border-indigo-500/20 transition-all cursor-default group">
                                                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300 italic mb-4">"{c.weakness}"</p>
                                                    <button onClick={() => handleOptimize(c.fix_suggestion)} title="Automatically integrate this fix into a new synthesis cycle." className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-all">
                                                        <span>Apply Patch</span>
                                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                                    </button>
                                                </div>
                                            )) : <p className="text-[10px] font-bold text-slate-400 text-center py-8">Optimization score optimal. No patches found.</p>}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-10 py-20 grayscale">
                                    <div className="text-7xl mb-8">📊</div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.8em]">Awaiting Analysis</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
