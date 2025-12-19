
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

// --- Icons ---
const Icons = {
    Persona: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Format: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Logic: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    Audience: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    Structure: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    Constraint: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    Safety: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Reflect: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    Tone: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
    Magic: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    Copy: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    Check: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
    Settings: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Analytics: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    Templates: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
    Brain: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    Trash: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
};

type StrategyId = 'persona' | 'cot' | 'negative' | 'delimiters' | 'fact_check' | 'format' | 'audience' | 'reflexion' | 'tone';

interface Strategy {
    id: StrategyId;
    title: string;
    icon: () => React.ReactNode;
    desc: string;
    category: 'Core Operations' | 'Output Modifiers' | 'Critical Control';
}

const STRATEGIES: Strategy[] = [
    { id: 'persona', title: 'Persona', icon: Icons.Persona, desc: 'Define a specific AI role (e.g., Senior Developer, Poet)', category: 'Core Operations' },
    { id: 'audience', title: 'Audience', icon: Icons.Audience, desc: 'Specify who the output is intended for (e.g., Beginners, Executives)', category: 'Core Operations' },
    { id: 'cot', title: 'Logic', icon: Icons.Logic, desc: 'Enforce Chain-of-Thought step-by-step reasoning', category: 'Core Operations' },
    
    { id: 'format', title: 'Format', icon: Icons.Format, desc: 'Request specific layouts like Markdown tables or JSON code blocks', category: 'Output Modifiers' },
    { id: 'tone', title: 'Tone', icon: Icons.Tone, desc: 'Adjust the stylistic vibe (e.g., Professional, Humorous)', category: 'Output Modifiers' },
    { id: 'delimiters', title: 'Structure', icon: Icons.Structure, desc: 'Inject structural segments for better parsing', category: 'Output Modifiers' },
    
    { id: 'negative', title: 'Constraint', icon: Icons.Constraint, desc: 'Apply Negative Constraints (things to avoid)', category: 'Critical Control' },
    { id: 'fact_check', title: 'Safety', icon: Icons.Safety, desc: 'Add verification steps to minimize hallucinations', category: 'Critical Control' },
    { id: 'reflexion', title: 'Reflect', icon: Icons.Reflect, desc: 'Force a self-correction loop on the output', category: 'Critical Control' },
];

const OPTIMIZER_TEMPLATES = [
    { title: 'Code Architect', content: 'Review this {{language}} code for performance bottlenecks and security vulnerabilities: {{code_snippet}}', strategies: ['persona', 'cot', 'delimiters'] as StrategyId[] },
    { title: 'Marketing Wizard', content: 'Create a persuasive ad campaign for {{product}} targeting {{demographic}}. Focus on {{unique_selling_point}}.', strategies: ['persona', 'audience', 'tone'] as StrategyId[] },
    { title: 'Data Scientist', content: 'Explain the statistical significance of this dataset: {{dataset_description}}. Breakdown the {{methodology}} used.', strategies: ['persona', 'cot', 'fact_check'] as StrategyId[] },
];

export const OptimizerView: React.FC<OptimizerViewProps> = ({ userContexts, onSaveNewContext, onDeleteContext, onSavePrompt, addToHistory }) => {
    const [basePrompt, setBasePrompt] = useState("");
    const [activeStrategies, setActiveStrategies] = useState<Set<StrategyId>>(new Set(['persona', 'cot', 'delimiters']));
    const [activeContextIds, setActiveContextIds] = useState<Set<string>>(new Set());
    const [targetModel, setTargetModel] = useState<'Gemini' | 'Claude' | 'ChatGPT' | 'DeepSeek'>('Gemini');
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizedPrompt, setOptimizedPrompt] = useState("");
    const [auditScores, setAuditScores] = useState({ clarity: 0, specificity: 0, reasoning: 0 });
    const [critiques, setCritiques] = useState<{ weakness: string; fix_suggestion: string }[]>([]);
    const [copySuccess, setCopySuccess] = useState(false);
    const [showInsights, setShowInsights] = useState(true);
    const [refinementFeedback, setRefinementFeedback] = useState("");
    const [variableValues, setVariableValues] = useState<{ [key: string]: string }>({});

    // Detect variables in base prompt
    const detectedVariables = useMemo(() => {
        const regex = /{{\s*(\w+)\s*}}/g;
        const matches = [...basePrompt.matchAll(regex)];
        return [...new Set(matches.map(m => m[1]))];
    }, [basePrompt]);

    const activeStrategyLabels = useMemo(() => 
        STRATEGIES.filter(s => activeStrategies.has(s.id)),
    [activeStrategies]);

    const toggleStrategy = (id: StrategyId) => {
        setActiveStrategies(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleContext = (id: string) => {
        setActiveContextIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const applyTemplate = (t: typeof OPTIMIZER_TEMPLATES[0]) => {
        setBasePrompt(t.content);
        setActiveStrategies(new Set(t.strategies));
    };

    const handleCopy = () => {
        if (!optimizedPrompt) return;
        navigator.clipboard.writeText(optimizedPrompt);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleOptimize = async (feedback?: string) => {
        if (!basePrompt.trim()) return;
        setIsOptimizing(true);
        if (!feedback) setOptimizedPrompt("");
        setCritiques([]);
        setAuditScores({ clarity: 0, specificity: 0, reasoning: 0 });

        const patternList = Array.from(activeStrategies).map(id => STRATEGIES.find(s => s.id === id)?.title).join(', ');
        const activeContextContents = Array.from(activeContextIds)
            .map(id => userContexts.find(c => c.id === id))
            .filter(Boolean)
            .map(c => `[CONTEXT: ${c!.title}]: ${c!.content}`)
            .join('\n\n');

        let input = `ENGINE: ${targetModel}\nPATTERNS: ${patternList}\n`;
        if (activeContextContents) {
            input += `USER CONTEXT CONSTRAINTS:\n${activeContextContents}\n\n`;
        }
        input += `PROMPT GOAL: ${basePrompt}`;

        if (feedback) {
            input += `\n\nREFINEMENT REQUEST: ${feedback}\nCURRENT DRAFT: ${optimizedPrompt}`;
        }

        try {
            const stream = await generatePromptStream(input, 0.7, 0.95, SYSTEM_INSTRUCTION_META_PROMPT);
            let fullText = "";
            if (feedback) setOptimizedPrompt(""); // Clear for refinement stream
            for await (const chunk of stream) {
                fullText += chunk;
                setOptimizedPrompt(prev => prev + chunk);
            }
            const audit = await auditPrompt(fullText);
            setAuditScores({ clarity: audit.clarity, specificity: audit.specificity, reasoning: audit.reasoning });
            const crit = await critiquePrompt(fullText);
            setCritiques(crit);
            if (feedback) setRefinementFeedback("");
        } catch (e) {
            console.error(e);
        } finally {
            setIsOptimizing(false);
        }
    };

    const MetricGauge = ({ label, score, color }: { label: string; score: number; color: string }) => (
        <div className="flex-1 group">
            <div className="flex justify-between items-end mb-2 px-1">
                <span className="text-[10px] font-black text-amber-900/60 dark:text-amber-500/60 uppercase tracking-widest">{label}</span>
                <span className={`text-xs font-black ${color}`}>{score}%</span>
            </div>
            <div className="h-1.5 bg-amber-100 dark:bg-amber-950 rounded-full overflow-hidden shadow-inner">
                <div className={`h-full ${color.replace('text', 'bg')} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(245,158,11,0.5)]`} style={{ width: `${score}%` }} />
            </div>
        </div>
    );

    const sidebarCategories = ['Core Operations', 'Output Modifiers', 'Critical Control'] as const;

    const engineTitles = {
        Gemini: "Optimize for Google's Gemini architecture and reasoning style",
        Claude: "Optimize for Anthropic's Claude context window and tone",
        ChatGPT: "Optimize for OpenAI's GPT models instructions compliance",
        DeepSeek: "Optimize for DeepSeek's technical and logic-heavy outputs"
    };

    return (
        <div className="h-full flex flex-col lg:grid lg:grid-cols-12 gap-10 text-slate-800 dark:text-slate-200">
            
            {/* --- LEFT SIDEBAR: CONFIGURATION --- */}
            <aside className="lg:col-span-3 flex flex-col gap-8 overflow-y-auto custom-scrollbar pr-4 pb-10">
                <div className="space-y-6 pb-6 border-b border-amber-200/50 dark:border-amber-800/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl shadow-xl shadow-amber-500/30 text-white transform hover:rotate-3 transition-transform">
                            <Icons.Settings />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tighter uppercase text-amber-950 dark:text-amber-50 leading-none">Settings</h2>
                            <p className="text-[9px] font-black tracking-widest text-amber-600 dark:text-amber-400 uppercase mt-1">v4.2 GOLDEN CORE</p>
                        </div>
                    </div>
                </div>

                {/* Applied Context Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <Icons.Brain />
                            <label className="text-[10px] font-black text-amber-900/50 dark:text-amber-500/50 uppercase tracking-[0.2em]">Active Contexts</label>
                        </div>
                        <button 
                            onClick={onSaveNewContext}
                            title="Add a new custom context like Brand Voice or Audience"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        </button>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        {userContexts.length > 0 ? (
                            userContexts.map(c => (
                                <div key={c.id} className="group relative flex items-center gap-2">
                                    <button
                                        onClick={() => toggleContext(c.id)}
                                        className={`flex-1 text-left px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all border ${activeContextIds.has(c.id) ? 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/20' : 'bg-amber-50/50 dark:bg-stone-900/20 text-amber-700/60 dark:text-amber-400/60 border-amber-100 dark:border-stone-800'}`}
                                    >
                                        {c.title}
                                    </button>
                                    <button 
                                        onClick={() => onDeleteContext(c.id)}
                                        className="p-2 opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                    >
                                        <Icons.Trash />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-[9px] font-bold text-amber-900/30 dark:text-amber-500/30 italic px-4">No custom contexts defined.</p>
                        )}
                    </div>
                </div>

                {/* Templates Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Icons.Templates />
                        <label className="text-[10px] font-black text-amber-900/50 dark:text-amber-500/50 uppercase tracking-[0.2em]">Quick Templates</label>
                    </div>
                    <div className="flex flex-col gap-2">
                        {OPTIMIZER_TEMPLATES.map(t => (
                            <button
                                key={t.title}
                                onClick={() => applyTemplate(t)}
                                className="w-full text-left p-3 text-[10px] font-black uppercase tracking-wider bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all"
                            >
                                {t.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Engine Selection */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-amber-900/50 dark:text-amber-500/50 uppercase tracking-[0.2em] px-1">Inference Engine</label>
                    <div className="grid grid-cols-2 gap-2 bg-amber-50/50 dark:bg-amber-950/20 p-1.5 rounded-3xl border border-amber-100 dark:border-amber-900/30">
                        {['Gemini', 'Claude', 'ChatGPT', 'DeepSeek'].map(m => (
                            <button
                                key={m}
                                onClick={() => setTargetModel(m as any)}
                                title={engineTitles[m as keyof typeof engineTitles]}
                                className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${targetModel === m ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-500/20 border border-amber-300 scale-105' : 'text-amber-700/50 hover:text-amber-900 dark:hover:text-amber-100'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Intelligence Matrix Grouped */}
                <div className="space-y-8">
                    {sidebarCategories.map(cat => (
                        <div key={cat} className="space-y-4">
                            <label className="text-[10px] font-black text-amber-900/50 dark:text-amber-500/50 uppercase tracking-[0.2em] px-1">{cat}</label>
                            <div className="grid grid-cols-3 gap-3">
                                {STRATEGIES.filter(s => s.category === cat).map(s => {
                                    const isActive = activeStrategies.has(s.id);
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => toggleStrategy(s.id)}
                                            className={`group relative flex flex-col items-center justify-center aspect-square rounded-[2rem] border-2 transition-all duration-500 ${isActive ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-400 text-white shadow-xl shadow-amber-500/40 scale-105' : 'bg-white dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30 text-amber-900/40 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/40'}`}
                                            title={`${s.title}: ${s.desc}`}
                                        >
                                            <div className={`mb-1 transition-transform group-hover:scale-110 ${isActive ? 'text-white drop-shadow-sm' : 'text-amber-200 dark:text-amber-900/80 group-hover:text-amber-500'}`}>
                                                {s.icon()}
                                            </div>
                                            <span className="text-[8px] font-black uppercase tracking-tighter">{s.title}</span>
                                            {isActive && (
                                                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white] animate-pulse"></div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA: WORKFLOW --- */}
            <main className="lg:col-span-9 flex flex-col gap-10 h-full overflow-hidden">
                
                {/* 1. NEURAL COMPOSITION INPUT (Dominant Card) */}
                <section className="bg-white/80 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-[3rem] p-10 shadow-[0_40px_100px_-30px_rgba(245,158,11,0.1)] relative overflow-hidden group backdrop-blur-xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 blur-[100px] pointer-events-none group-focus-within:bg-amber-400/20 transition-colors duration-1000"></div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
                        <div>
                            <h3 className="text-3xl font-black text-amber-950 dark:text-amber-50 tracking-tighter uppercase leading-none ">Neural Composition</h3>
                            <p className="text-[10px] font-black text-amber-600/60 dark:text-amber-400/60 mt-2 uppercase tracking-widest">PHASE 01 // OBJECTIVE_INPUT</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {activeStrategyLabels.map(s => (
                                <span key={s.id} className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase rounded-full border border-amber-200 dark:border-amber-800/50 animate-fade-in shadow-sm">
                                    {s.title}
                                </span>
                            ))}
                            {Array.from(activeContextIds).map(id => {
                                const c = userContexts.find(ctx => ctx.id === id);
                                if (!c) return null;
                                return (
                                    <span key={id} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-[10px] font-black uppercase rounded-full border border-orange-200 dark:border-orange-800/50 animate-fade-in shadow-sm">
                                        CTX: {c.title}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-col gap-6">
                        <textarea
                            value={basePrompt}
                            onChange={(e) => setBasePrompt(e.target.value)}
                            placeholder="WHAT IS THE DESIRED OUTCOME OF THE MODEL? USE {{var}} FOR VARIABLES."
                            className="w-full h-32 bg-transparent text-amber-950 dark:text-amber-50 text-3xl font-black placeholder-amber-100 dark:placeholder-amber-900 outline-none resize-none leading-relaxed tracking-tighter"
                        />
                        
                        {/* Detected Variables Row */}
                        {detectedVariables.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-amber-50/30 dark:bg-stone-900/20 rounded-[2rem] border border-amber-100 dark:border-amber-900/20 animate-fade-in">
                                {detectedVariables.map(v => (
                                    <div key={v} className="space-y-1.5">
                                        <label className="text-[8px] font-black uppercase tracking-widest text-amber-600/60">Variable: {v}</label>
                                        <input 
                                            value={variableValues[v] || ""} 
                                            onChange={e => setVariableValues(prev => ({...prev, [v]: e.target.value}))}
                                            placeholder={`Value for ${v}...`}
                                            className="w-full bg-white dark:bg-stone-900 border border-amber-100 dark:border-amber-800/50 rounded-xl px-4 py-2 text-xs font-bold focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-6 border-t border-amber-100 dark:border-amber-900/30">
                            <span className="text-[10px] font-black text-amber-900/30 dark:text-amber-500/30 uppercase tracking-[0.3em]">
                                {basePrompt.length} / MAX_TOKEN_LIMIT
                            </span>
                            <button
                                onClick={() => handleOptimize()}
                                disabled={isOptimizing || !basePrompt.trim()}
                                title="Run the optimization pipeline to synthesize a complex meta-prompt from your draft"
                                className={`group relative flex items-center gap-4 px-12 py-5 rounded-[1.8rem] font-black text-sm tracking-widest transition-all duration-700 ${isOptimizing || !basePrompt.trim() ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-200 dark:text-amber-900 cursor-not-allowed border border-amber-100 dark:border-amber-900' : 'bg-gradient-to-r from-amber-400 to-orange-600 text-white shadow-2xl shadow-amber-500/40 hover:scale-105 active:scale-95 border-b-4 border-orange-800'}`}
                            >
                                {isOptimizing ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span className="animate-pulse">SYNTHESIZING...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Icons.Magic />
                                        <span>OPTIMIZE_MATRIX</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </section>

                {/* 2. OUTPUT WORKFLOW BOXES (Contextual resturcture) */}
                <div className="flex flex-col xl:flex-row gap-10 flex-1 min-h-0 relative z-10 transition-all duration-500">
                    
                    {/* Synthesized Trace (Primary) */}
                    <div className={`flex flex-col bg-white/90 dark:bg-amber-950/5 border border-amber-100 dark:border-amber-900/30 rounded-[3rem] overflow-hidden shadow-2xl group transition-all duration-500 hover:shadow-amber-500/5 ${showInsights ? 'xl:w-2/3' : 'w-full'}`}>
                        <div className="px-10 py-8 border-b border-amber-50 dark:border-amber-900/30 flex justify-between items-center bg-amber-50/30 dark:bg-amber-900/20 backdrop-blur-3xl">
                            <div className="flex items-center gap-4">
                                <span className={`w-3 h-3 rounded-full ${isOptimizing ? 'bg-amber-400 animate-pulse' : 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]'}`}></span>
                                <span className="text-[11px] font-black text-amber-900/60 dark:text-amber-400/60 uppercase tracking-[0.3em]">Synthesized_Trace</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {optimizedPrompt && (
                                    <>
                                        <div className="mr-4 flex flex-col items-end opacity-40">
                                            <span className="text-[8px] font-black uppercase">Lifecycle_Est</span>
                                            <span className="text-[10px] font-bold">~{(optimizedPrompt.length / 4).toFixed(0)} Tokens</span>
                                        </div>
                                        <button 
                                            onClick={handleCopy} 
                                            title="Copy the synthesized meta-prompt to clipboard"
                                            className="p-3 bg-white dark:bg-amber-900 text-amber-400 hover:text-orange-600 rounded-2xl shadow-sm border border-amber-100 dark:border-amber-800 transition-all hover:scale-110"
                                        >
                                            {copySuccess ? <Icons.Check /> : <Icons.Copy />}
                                        </button>
                                        <button 
                                            onClick={() => onSavePrompt(optimizedPrompt)} 
                                            title="Store this version in your personal Matrix collection"
                                            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-amber-500/40 transition-all shadow-xl"
                                        >
                                            SAVE_CODE
                                        </button>
                                    </>
                                )}
                                <button 
                                    onClick={() => setShowInsights(!showInsights)}
                                    title={showInsights ? "Collapse insights to maximize space" : "Expand Auditor Insights panel"}
                                    className={`p-3 rounded-2xl border transition-all hover:scale-110 ${showInsights ? 'bg-amber-500 text-white border-amber-600 shadow-lg' : 'bg-white dark:bg-amber-900 text-amber-400 border-amber-100 dark:border-amber-800'}`}
                                >
                                    <Icons.Analytics />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex-1 p-10 overflow-y-auto custom-scrollbar font-mono text-base leading-relaxed tracking-tight selection:bg-amber-500/30">
                                {optimizedPrompt ? (
                                    <div className="space-y-6 animate-fade-in text-amber-950 dark:text-amber-50">
                                        <div className="p-6 bg-amber-50/50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-800/50 shadow-inner">
                                            <p className="text-[10px] text-orange-600 dark:text-orange-400 font-black uppercase mb-4 tracking-[0.4em] flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping"></span>
                                                META_PROMPT_V1.4
                                            </p>
                                            <pre className="whitespace-pre-wrap">{optimizedPrompt}</pre>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-10 py-24 text-center grayscale">
                                        <div className="text-7xl mb-8">🏗️</div>
                                        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-amber-950">Awaiting_Hardware_Pulse</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Refinement Interaction Layer */}
                            {optimizedPrompt && (
                                <div className="p-6 bg-amber-50/30 dark:bg-stone-900/30 border-t border-amber-100 dark:border-amber-900/20 backdrop-blur-md">
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 opacity-50 group-focus-within:opacity-100 transition-opacity">
                                            <Icons.Magic />
                                        </div>
                                        <input 
                                            value={refinementFeedback}
                                            onChange={e => setRefinementFeedback(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleOptimize(refinementFeedback)}
                                            placeholder="Provide refinement feedback (e.g., 'Make it more technical', 'Add more constraints')..."
                                            className="w-full bg-white dark:bg-stone-900 border-2 border-amber-100 dark:border-amber-900/50 rounded-2xl pl-12 pr-32 py-4 text-xs font-bold outline-none focus:border-amber-500 transition-all shadow-inner"
                                        />
                                        <button 
                                            onClick={() => handleOptimize(refinementFeedback)}
                                            disabled={isOptimizing || !refinementFeedback.trim()}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-30 text-white rounded-xl text-[10px] font-black uppercase transition-all"
                                        >
                                            Refine_Trace
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Auditor Insights (Secondary - Collapsible) */}
                    <div className={`flex flex-col bg-white/90 dark:bg-amber-950/5 border border-amber-100 dark:border-amber-900/30 rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-500 transform ${showInsights ? 'xl:w-1/3 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-10 pointer-events-none'}`}>
                        <div className="px-10 py-8 border-b border-amber-50 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-900/20 flex items-center justify-between">
                            <span className="text-[11px] font-black text-amber-900/60 dark:text-amber-400/60 uppercase tracking-[0.3em]">Auditor_Analytics</span>
                            <button onClick={() => setShowInsights(false)} className="text-amber-400 hover:text-orange-600 transition-colors xl:hidden">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="flex-1 p-10 space-y-10 overflow-y-auto custom-scrollbar">
                            {isOptimizing ? (
                                <div className="h-full flex flex-col items-center justify-center gap-10 opacity-40">
                                    <div className="w-20 h-20 border-[10px] border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-[11px] font-black uppercase tracking-[0.6em] text-amber-600 animate-pulse">Running_Diagnostic...</span>
                                </div>
                            ) : auditScores.clarity > 0 ? (
                                <div className="space-y-10 animate-fade-in">
                                    {/* Mini Gauges */}
                                    <div className="flex flex-col gap-8">
                                        <MetricGauge label="Clarity" score={auditScores.clarity} color="text-amber-600" />
                                        <MetricGauge label="Specifics" score={auditScores.specificity} color="text-orange-600" />
                                        <MetricGauge label="Reasoning" score={auditScores.reasoning} color="text-amber-500" />
                                    </div>

                                    {/* Secondary Metrics Card */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div 
                                          className="p-5 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-transparent rounded-3xl border border-amber-100 dark:border-amber-800 shadow-sm"
                                          title="Estimated time for the model to process this prompt"
                                        >
                                            <p className="text-[9px] font-black text-amber-900/40 dark:text-amber-500/40 uppercase tracking-[0.2em] mb-1">Latency_Est.</p>
                                            <p className="text-2xl font-black text-amber-900 dark:text-amber-50 ">~{Math.max(1.2, parseFloat((optimizedPrompt.length / 1000).toFixed(1)))}<span className="text-xs font-bold text-amber-400 ml-0.5">S</span></p>
                                        </div>
                                        <div 
                                          className="p-5 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-transparent rounded-3xl border border-amber-100 dark:border-amber-800 shadow-sm"
                                          title="Structural complexity rating based on logic pattern density"
                                        >
                                            <p className="text-[9px] font-black text-amber-900/40 dark:text-amber-500/40 uppercase tracking-[0.2em] mb-1">Complexity</p>
                                            <p className="text-2xl font-black text-amber-900 dark:text-amber-50 ">{(optimizedPrompt.split(' ').length / 200).toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {/* Recommendations */}
                                    <div className="space-y-6">
                                        <p className="text-[11px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-[0.4em] px-1">Diagnostic_Feed</p>
                                        <div className="space-y-4">
                                            {critiques.map((c, i) => (
                                                <div key={i} className="group p-6 bg-amber-50/50 dark:bg-amber-950/20 rounded-[2rem] border border-amber-100/50 dark:border-amber-900/50 transition-all duration-500 hover:border-amber-400">
                                                    <p className="text-xs font-black text-amber-950 dark:text-amber-50 mb-3 leading-snug">" {c.weakness} "</p>
                                                    <div 
                                                        className="flex items-start gap-3 text-[10px] font-black text-orange-700 dark:text-orange-400 bg-white/50 dark:bg-amber-900/30 p-3 rounded-xl border border-orange-100 dark:border-orange-900/30"
                                                        title="Implement this fix to improve prompt accuracy"
                                                    >
                                                        <div className="mt-0.5"><Icons.Check /></div>
                                                        <span className="tracking-tight uppercase">Fix: {c.fix_suggestion}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-24 grayscale">
                                    <div className="text-8xl mb-8">🔭</div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-amber-950">Observatory_Idle</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
