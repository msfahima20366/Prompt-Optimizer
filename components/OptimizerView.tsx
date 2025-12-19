
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
    keywords: string[];
    colorClass: string;
}

const PATTERNS: Pattern[] = [
    { id: 'persona', label: 'Expert Role', icon: Icons.Persona, desc: 'Tells the AI to act like a specific professional.', impact: 'Authority focus.', category: 'Essential', keywords: ['act as', 'expert', 'professional', 'role', 'persona', 'specialist', 'authority', 'expert role'], colorClass: 'text-violet-500 font-black' },
    { id: 'audience', label: 'Target Users', icon: Icons.Audience, desc: 'Defines who will read or use the answer.', impact: 'Readability calibration.', category: 'Essential', keywords: ['audience', 'beginner', 'user', 'reader', 'student', 'professional', 'target audience', 'users'], colorClass: 'text-emerald-500 font-black' },
    { id: 'logic', label: 'Thinking Steps', icon: Icons.Logic, desc: 'Makes the AI think step-by-step.', impact: 'Chain-of-Thought reasoning.', category: 'Essential', keywords: ['step by step', 'logic', 'reasoning', 'think', 'thought', 'process', 'chain of thought', 'thinking steps'], colorClass: 'text-amber-500 font-black' },
    { id: 'few_shot', label: 'Show Examples', icon: Icons.Format, desc: 'Includes example answers.', impact: 'Predictable formatting.', category: 'Essential', keywords: ['example', 'sample', 'instance', 'show', 'case', 'few shot', 'examples'], colorClass: 'text-blue-500 font-black' },
    { id: 'xml_tags', label: 'Organized Info', icon: Icons.Logic, desc: 'Uses structured tags.', impact: 'Parsability.', category: 'Styling', keywords: ['tag', 'xml', 'structured', 'label', 'bracket', 'organized info'], colorClass: 'text-cyan-500 font-black' },
    { id: 'format', label: 'Clear Layout', icon: Icons.Format, desc: 'Specifies output structure.', impact: 'Easy integration.', category: 'Styling', keywords: ['table', 'list', 'json', 'markdown', 'format', 'layout', 'clear layout'], colorClass: 'text-sky-500 font-black' },
    { id: 'tone', label: 'Writing Vibe', icon: Icons.Tone, desc: 'Sets the mood.', impact: 'Brand matching.', category: 'Styling', keywords: ['friendly', 'professional', 'casual', 'humorous', 'tone', 'vibe', 'mood', 'writing vibe'], colorClass: 'text-rose-500 font-black' },
    { id: 'negative_constraints', label: 'Do Not List', icon: Icons.Safety, desc: 'Lists things to avoid.', impact: 'Explicit restrictions.', category: 'Advanced', keywords: ['do not', 'avoid', 'never', 'restrict', 'forbidden', 'negative constraints'], colorClass: 'text-red-500 font-black' },
    { id: 'safety', label: 'Safe Guard', icon: Icons.Safety, desc: 'Prevents fake info.', impact: 'Truthfulness.', category: 'Advanced', keywords: ['safety', 'verified', 'truth', 'fact', 'check', 'source', 'safe guard'], colorClass: 'text-orange-500 font-black' },
];

const MODEL_TOOLTIPS = {
    Gemini: "Optimizes for Google's multimodal reasoning.",
    ChatGPT: "Calibrates syntax for OpenAI's GPT models.",
    Claude: "Tailors instructions for Anthropic's long-form precision.",
    DeepSeek: "Specialized syntax for coding and math.",
    Llama: "Generic open-source optimization.",
    Grok: "Injects personality-aware instructions for xAI.",
    Qwen: "Optimizes for Alibaba's Qwen models.",
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

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);

    /**
     * Accurate Token Counter Heuristic for LLMs:
     * Gemini tokens typically average around 3.5-4 characters per token.
     * This logic splits by words, symbols, and whitespace clusters to better mirror BPE.
     */
    const tokenCount = useMemo(() => {
        if (!basePrompt) return 0;
        // 1. Split by whitespace or punctuation to find "chunks"
        const tokens = basePrompt.match(/\w+|[^\w\s]|\s+/g);
        if (!tokens) return 0;
        
        let count = 0;
        tokens.forEach(t => {
            // Long words (8+ chars) usually split into multiple tokens
            if (t.length > 8) {
                count += Math.ceil(t.length / 4);
            } else if (t.trim().length === 0 && t.length > 1) {
                // Large whitespace blocks can also be multiple tokens
                count += Math.ceil(t.length / 4);
            } else {
                count += 1;
            }
        });
        return count;
    }, [basePrompt]);

    const dynamicPlaceholder = useMemo(() => {
        const activeNames = Array.from(selectedPatterns).map(id => PATTERNS.find(p => p.id === id)?.label).filter(Boolean);
        let baseMsg = `Define your high-level goal for ${llmModel}...`;
        if (activeNames.includes('Expert Role')) baseMsg = `Describe the project your ${llmModel} expert should tackle...`;
        else if (activeNames.includes('Target Users')) baseMsg = `What should ${llmModel} create for your specific audience?`;
        else if (activeNames.includes('Writing Vibe')) baseMsg = `What content should ${llmModel} write in your selected style?`;
        return baseMsg;
    }, [llmModel, selectedPatterns]);

    const syncScroll = () => {
        if (textareaRef.current && highlightRef.current) {
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
            highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

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

    // Advanced Highlighting Logic
    const highlightedContent = useMemo(() => {
        if (!basePrompt) return "";
        
        // Escape HTML to prevent injection and rendering issues
        let escaped = basePrompt
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        // Convert newlines to breaks for rendering
        escaped = escaped.replace(/\n/g, "<br/>") + " ";
        
        // Find active patterns and their keywords
        const activePatterns = PATTERNS.filter(p => selectedPatterns.has(p.id));

        // Sorting keywords by length (longest first) to ensure "Target Audience" matches before "Audience"
        const allKeywords = activePatterns.flatMap(p => 
            p.keywords.map(k => ({ word: k, color: p.colorClass }))
        ).sort((a, b) => b.word.length - a.word.length);

        allKeywords.forEach(k => {
            // Regex for case-insensitive match on word boundaries
            const regex = new RegExp(`(\\b${k.word}\\b)`, 'gi');
            escaped = escaped.replace(regex, `<span class="${k.color}">${k.word}</span>`);
        });

        return escaped;
    }, [basePrompt, selectedPatterns]);

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
- Inference Depth: ${inferenceDepth}
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
            const errorStr = e.toString();
            const errorMsg = e.message || errorStr;
            
            if (errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
                setOptimizationError("Neural Quota Exhausted. You have exceeded your current Gemini API rate limits. Please wait a few minutes or check your billing plan.");
            } else if (errorMsg.includes("blocked") || errorMsg.includes("Failed to fetch")) {
                setOptimizationError("Connection blocked by browser or network. Please disable VPN or Ad-blockers and try again.");
            } else {
                setOptimizationError("Neural Core Timeout. Please check your network and try again.");
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
        const length = basePrompt.length;
        if (length > 2000) return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
        if (length > 500) return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
        return { color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' };
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
                                <button key={m} onClick={() => setLlmModel(m as any)} title={MODEL_TOOLTIPS[m]} className={`py-3 px-1 rounded-2xl text-[10px] font-black uppercase border-2 transition-all ${llmModel === m ? 'bg-white text-indigo-700 border-white shadow-lg scale-105' : 'bg-indigo-900/40 text-indigo-100/60 border-transparent hover:border-white/20'}`}>{m}</button>
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
                                    <button key={p.id} onClick={() => togglePattern(p.id)} title={p.desc} className={`flex flex-col items-center justify-center p-5 rounded-[2.5rem] border-2 transition-all duration-300 transform ${isActive ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl scale-105' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-indigo-400'}`}>
                                        <div className={`mb-3 ${isActive ? 'text-white' : 'text-slate-300 dark:text-slate-700'}`}>{p.icon()}</div>
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
                            <button onClick={onSaveNewContext} className="p-1.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100"><Icons.Add /></button>
                        </div>
                        <div className="space-y-3">
                            {userContexts.map(ctx => {
                                const isActive = selectedContextIds.has(ctx.id);
                                return (
                                    <button key={ctx.id} onClick={() => toggleContext(ctx.id)} className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${isActive ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}><Icons.Book /></div>
                                            <span className="text-[10px] font-black uppercase tracking-tight truncate max-w-[100px]">{ctx.title}</span>
                                        </div>
                                        {isActive && <Icons.Check />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
                        <div className="flex justify-between items-center">
                            <label className="text-[12px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Neural Tuning</label>
                            <button onClick={() => setShowAdvancedTuning(!showAdvancedTuning)} className={`p-2 rounded-lg transition-all ${showAdvancedTuning ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}><Icons.Settings /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                                    <span>Creativity (Temp)</span>
                                    <span className="text-indigo-600 dark:text-indigo-400">{temp.toFixed(1)}</span>
                                </div>
                                <input type="range" min="0" max="1" step="0.1" value={temp} onChange={e => setTemp(parseFloat(e.target.value))} className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer" />
                            </div>
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
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4">Phase 01 // Real-time Neural Engine</p>
                            </div>
                        </div>

                        <div className="relative w-full h-44">
                            <div 
                                ref={highlightRef}
                                className="absolute inset-0 w-full h-full p-0 pointer-events-none whitespace-pre-wrap break-words text-3xl font-extrabold leading-snug tracking-tight overflow-hidden"
                                aria-hidden="true"
                                dangerouslySetInnerHTML={{ __html: highlightedContent }}
                                style={{ color: 'transparent' }}
                            />
                            <textarea 
                                ref={textareaRef}
                                value={basePrompt} 
                                onChange={(e) => setBasePrompt(e.target.value)} 
                                onScroll={syncScroll}
                                placeholder={dynamicPlaceholder} 
                                className="absolute inset-0 w-full h-full bg-transparent text-slate-900 dark:text-white text-3xl font-extrabold placeholder-slate-100 dark:placeholder-slate-800 outline-none resize-none leading-snug tracking-tight selection:bg-indigo-500/20" 
                            />
                            
                            <div className="absolute -bottom-12 right-0 flex items-center gap-4 z-20">
                                <div className={`flex items-center gap-6 px-6 py-3 rounded-3xl border-2 backdrop-blur-2xl transition-all duration-500 ${counterStatus.bg} ${counterStatus.border}`} title="Neural complexity metrics.">
                                    <div className="flex flex-col items-center border-r border-black/5 dark:border-white/5 pr-6">
                                        <span className={`text-lg font-black tracking-tighter ${counterStatus.color}`}>{basePrompt.length.toLocaleString()}</span>
                                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em]">Chars</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className={`text-lg font-black tracking-tighter text-cyan-500`}>{tokenCount.toLocaleString()}</span>
                                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em]">Tokens</span>
                                    </div>
                                </div>
                                {basePrompt.length > 0 && (
                                    <button onClick={() => setBasePrompt("")} className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-2xl transition-all shadow-premium hover:scale-110 group/clear">
                                        <div className="group-hover/clear:rotate-90 transition-transform duration-500"><Icons.Clear /></div>
                                    </button>
                                )}
                            </div>
                        </div>

                        {optimizationError && (
                            <div className="p-6 bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-200 dark:border-rose-900 rounded-3xl flex items-center gap-4 animate-fade-in">
                                <div className="p-3 bg-rose-500 text-white rounded-2xl flex-shrink-0 self-start mt-1"><Icons.Safety /></div>
                                <div>
                                    <p className="text-sm font-black text-rose-700 dark:text-rose-300 uppercase tracking-widest">Synthesis Blocked</p>
                                    <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-1 leading-relaxed">{optimizationError}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-16 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">Optimizing Engine</span>
                                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase">{llmModel} Core Integration</span>
                            </div>
                            <button onClick={() => handleOptimize()} disabled={isOptimizing || !basePrompt.trim()} className="px-14 py-6 bg-indigo-700 hover:bg-indigo-600 disabled:opacity-40 text-white rounded-[2rem] font-black text-sm tracking-[0.2em] uppercase transition-all shadow-2xl active:scale-95 transform hover:-translate-y-1">
                                {isOptimizing ? "Synthesizing..." : "Build Professional Prompt"}
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
                                    <div className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${neuralComplexityRating.color}`}>
                                        Complexity: {neuralComplexityRating.label}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowInsights(!showInsights)} className={`p-4 rounded-2xl border transition-all ${showInsights ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`} title="Toggle Quality Diagnostic"><Icons.Scan /></button>
                                {activeDraft && (
                                    <button onClick={() => { navigator.clipboard.writeText(activeDraft.prompt); setCopySuccess(true); setTimeout(()=>setCopySuccess(false), 2000); }} className="p-4 bg-white/5 text-indigo-400 hover:text-white rounded-2xl border border-white/10 transition-all">
                                        {copySuccess ? <Icons.Check /> : <Icons.Copy />}
                                    </button>
                                )}
                                <button onClick={() => onSavePrompt(activeDraft?.prompt || '')} className="p-4 bg-white/5 text-indigo-400 hover:text-white rounded-2xl border border-white/10 transition-all"><SaveIcon /></button>
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
                                <button onClick={triggerReAudit} className="p-2 text-indigo-600 hover:text-indigo-800 rounded-xl"><Icons.Scan /></button>
                            )}
                        </div>
                        <div className="flex-1 p-10 space-y-12 overflow-y-auto custom-scrollbar">
                            {isAuditing ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-8 py-20">
                                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm font-black uppercase tracking-widest text-indigo-600 animate-pulse text-center">Running Neural Scans</p>
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
                                                    <button onClick={() => handleOptimize(c.fix_suggestion)} className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 hover:text-indigo-800">
                                                        <span>Apply Patch</span>
                                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                                    </button>
                                                </div>
                                            )) : <p className="text-[10px] font-bold text-slate-400 text-center py-8">Optimization score optimal.</p>}
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

const SaveIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
);
