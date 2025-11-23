
import React, { useState, useMemo } from 'react';
import { UserContext } from '../prompts/collection';
import { generatePromptStream, SYSTEM_INSTRUCTION_META_PROMPT } from '../services/geminiService';
import { OutputDisplay } from './OutputDisplay';

interface OptimizerViewProps {
    userContexts: UserContext[];
    onSaveNewContext: () => void;
    onDeleteContext: (contextId: string) => void;
    onSavePrompt: (prompt: string) => void;
    addToHistory: (prompt: string) => void;
}

// --- Icons ---
const Icons = {
    Persona: () => <span className="text-xl">🎭</span>,
    CoT: () => <span className="text-xl">🧠</span>,
    FewShot: () => <span className="text-xl">📚</span>,
    Negative: () => <span className="text-xl">🚫</span>,
    Delimiters: () => <span className="text-xl">🧱</span>,
    FactCheck: () => <span className="text-xl">🛡️</span>,
    Format: () => <span className="text-xl">📝</span>,
    Audience: () => <span className="text-xl">👥</span>,
    Reflexion: () => <span className="text-xl">🤔</span>,
    Tone: () => <span className="text-xl">🎨</span>,
    Magic: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    Check: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
    Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Play: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

type StrategyId = 
    | 'persona' 
    | 'cot' 
    | 'few_shot' 
    | 'negative' 
    | 'delimiters' 
    | 'fact_check' 
    | 'format' 
    | 'audience' 
    | 'reflexion' 
    | 'tone';

interface StrategyDef {
    id: StrategyId;
    title: string;
    description: string;
    icon: () => React.ReactNode;
}

const STRATEGIES: StrategyDef[] = [
    { id: 'persona', title: 'Persona', description: 'Assign expertise', icon: Icons.Persona },
    { id: 'cot', title: 'Chain of Thought', description: 'Step-by-step logic', icon: Icons.CoT },
    { id: 'few_shot', title: 'Examples', description: 'Input-Output pairs', icon: Icons.FewShot },
    { id: 'negative', title: 'Constraints', description: 'What to avoid', icon: Icons.Negative },
    { id: 'delimiters', title: 'Delimiters', description: 'Prevent injection', icon: Icons.Delimiters },
    { id: 'fact_check', title: 'Fact Check', description: 'Reduce hallucinations', icon: Icons.FactCheck },
    { id: 'format', title: 'Format', description: 'Structure output', icon: Icons.Format },
    { id: 'audience', title: 'Audience', description: 'Target reader', icon: Icons.Audience },
    { id: 'reflexion', title: 'Self-Correction', description: 'Review answer', icon: Icons.Reflexion },
    { id: 'tone', title: 'Tone', description: 'Style & mood', icon: Icons.Tone },
];

export const OptimizerView: React.FC<OptimizerViewProps> = ({ userContexts, onSaveNewContext, onDeleteContext, onSavePrompt, addToHistory }) => {
    // --- State ---
    const [basePrompt, setBasePrompt] = useState("");
    const [activeStrategies, setActiveStrategies] = useState<Set<StrategyId>>(new Set(['delimiters']));
    
    // Strategy Config States
    const [persona, setPersona] = useState("Senior Data Scientist");
    const [negativeConstraints, setNegativeConstraints] = useState("Do not use passive voice.");
    const [outputFormat, setOutputFormat] = useState("Markdown");
    const [audience, setAudience] = useState("Beginner");
    const [tone, setTone] = useState("Professional");
    const [fewShotExamples, setFewShotExamples] = useState<{in: string, out: string}[]>([{in: '', out: ''}]);

    // Execution State
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizedPrompt, setOptimizedPrompt] = useState("");
    
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState("");
    const [error, setError] = useState<string | null>(null);

    // --- Logic ---

    const toggleStrategy = (id: StrategyId) => {
        setActiveStrategies(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const updateFewShot = (index: number, field: 'in' | 'out', value: string) => {
        const newExamples = [...fewShotExamples];
        newExamples[index][field] = value;
        setFewShotExamples(newExamples);
    };

    const addFewShot = () => setFewShotExamples([...fewShotExamples, {in: '', out: ''}]);
    const removeFewShot = (index: number) => setFewShotExamples(fewShotExamples.filter((_, i) => i !== index));

    // --- Prompt Compiler ---
    const compiledDraft = useMemo(() => {
        let parts: string[] = [];
        parts.push(`USER DRAFT PROMPT:\n${basePrompt}\n`);
        parts.push(`\nREQUESTED OPTIMIZATIONS:`);

        if (activeStrategies.has('persona')) parts.push(`- Adopt Persona: ${persona}`);
        if (activeStrategies.has('audience')) parts.push(`- Target Audience: ${audience}`);
        if (activeStrategies.has('tone')) parts.push(`- Tone: ${tone}`);
        if (activeStrategies.has('negative')) parts.push(`- Negative Constraints: ${negativeConstraints}`);
        if (activeStrategies.has('cot')) parts.push(`- Use Chain of Thought reasoning`);
        if (activeStrategies.has('fact_check')) parts.push(`- Add Hallucination Guardrails`);
        if (activeStrategies.has('delimiters')) parts.push(`- Use Smart Delimiters for inputs`);
        if (activeStrategies.has('reflexion')) parts.push(`- Add Self-Reflexion step`);
        if (activeStrategies.has('format')) parts.push(`- Output Format: ${outputFormat}`);

        if (activeStrategies.has('few_shot') && fewShotExamples.some(e => e.in && e.out)) {
            parts.push(`- Include these Examples:`);
            fewShotExamples.forEach((ex) => {
                if(ex.in && ex.out) parts.push(`  Input: ${ex.in} -> Output: ${ex.out}`);
            });
        }

        return parts.join('\n');
    }, [activeStrategies, basePrompt, persona, audience, tone, negativeConstraints, fewShotExamples, outputFormat]);


    const handleOptimize = async () => {
        if (!basePrompt.trim()) return;
        setIsOptimizing(true);
        setError(null);
        setOptimizedPrompt("");
        setTestResult(""); // Clear previous test

        try {
            // Pass the special Meta-Prompt instruction to rewrite the user's draft
            const stream = await generatePromptStream(compiledDraft, 0.7, 0.95, SYSTEM_INSTRUCTION_META_PROMPT);
            
            for await (const chunk of stream) {
                setOptimizedPrompt(prev => prev + chunk);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Error optimizing prompt");
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleTestRun = async () => {
        if (!optimizedPrompt.trim()) return;
        setIsTesting(true);
        setTestResult("");
        
        try {
            // Execute the OPTIMIZED prompt
            const stream = await generatePromptStream(optimizedPrompt, 0.7, 0.95);
            addToHistory(optimizedPrompt); // Save the optimized prompt to history
            
            for await (const chunk of stream) {
                setTestResult(prev => prev + chunk);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Error running test");
        } finally {
            setIsTesting(false);
        }
    }

    // --- Render Components ---

    const StrategyCard: React.FC<{ def: StrategyDef }> = ({ def }) => {
        const isActive = activeStrategies.has(def.id);
        return (
            <button 
                onClick={() => toggleStrategy(def.id)}
                className={`p-3 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2 text-center hover:scale-105
                    ${isActive 
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/30' 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-400'}`}
            >
                <span className="text-2xl">{def.icon()}</span>
                <span className="text-xs font-bold leading-tight">{def.title}</span>
            </button>
        );
    };

    const ConfigSection: React.FC<{ id: StrategyId, children: React.ReactNode }> = ({ id, children }) => {
        if (!activeStrategies.has(id)) return null;
        const def = STRATEGIES.find(s => s.id === id);
        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border-l-4 border-indigo-500 animate-fade-in shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{def?.title} Config</span>
                </div>
                {children}
            </div>
        );
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6">
            
            {/* Left Column: Configuration */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                
                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 text-xl">🧪</div>
                    <div>
                        <h2 className="text-2xl font-bold gradient-text">Prompt Lab</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Design your perfect prompt using AI strategies.</p>
                    </div>
                </div>

                {/* Base Input */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">1. Core Task</label>
                    <textarea
                        value={basePrompt}
                        onChange={e => setBasePrompt(e.target.value)}
                        placeholder="Describe what you want the AI to do (e.g., 'Write a blog post about coffee')"
                        className="w-full h-32 bg-white dark:bg-gray-800/80 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner text-sm"
                    />
                </div>

                {/* Strategy Grid */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">2. Optimization Strategies</label>
                    <div className="grid grid-cols-5 gap-2">
                        {STRATEGIES.map(s => <StrategyCard key={s.id} def={s} />)}
                    </div>
                </div>

                {/* Active Configurations */}
                {activeStrategies.size > 0 && (
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-700/50">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-2">3. Fine-Tune Strategies</label>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <ConfigSection id="persona">
                                <input type="text" value={persona} onChange={e => setPersona(e.target.value)} className="w-full text-sm p-2 rounded border dark:border-gray-600 dark:bg-gray-700" placeholder="e.g. Senior Data Scientist" />
                            </ConfigSection>
                            <ConfigSection id="audience">
                                <select value={audience} onChange={e => setAudience(e.target.value)} className="w-full text-sm p-2 rounded border dark:border-gray-600 dark:bg-gray-700">
                                    {['Beginner', 'Student', 'Expert', 'General Public'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </ConfigSection>
                            <ConfigSection id="tone">
                                <select value={tone} onChange={e => setTone(e.target.value)} className="w-full text-sm p-2 rounded border dark:border-gray-600 dark:bg-gray-700">
                                    {['Professional', 'Casual', 'Witty', 'Academic'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </ConfigSection>
                            <ConfigSection id="format">
                                <select value={outputFormat} onChange={e => setOutputFormat(e.target.value)} className="w-full text-sm p-2 rounded border dark:border-gray-600 dark:bg-gray-700">
                                    {['Markdown', 'JSON', 'HTML', 'Plain Text'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </ConfigSection>
                        </div>
                        
                        <ConfigSection id="negative">
                            <input value={negativeConstraints} onChange={e => setNegativeConstraints(e.target.value)} className="w-full text-sm p-2 rounded border dark:border-gray-600 dark:bg-gray-700" placeholder="What to avoid?" />
                        </ConfigSection>

                        <ConfigSection id="few_shot">
                            <div className="space-y-2">
                                {fewShotExamples.map((ex, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input placeholder="In" value={ex.in} onChange={e => updateFewShot(i, 'in', e.target.value)} className="w-1/2 text-xs p-1.5 rounded border dark:bg-gray-700 dark:border-gray-600"/>
                                        <input placeholder="Out" value={ex.out} onChange={e => updateFewShot(i, 'out', e.target.value)} className="w-1/2 text-xs p-1.5 rounded border dark:bg-gray-700 dark:border-gray-600"/>
                                        <button onClick={() => removeFewShot(i)} className="text-red-500 hover:text-red-700"><Icons.Trash /></button>
                                    </div>
                                ))}
                                <button onClick={addFewShot} className="text-xs text-indigo-600 font-bold hover:underline">+ Add Example</button>
                            </div>
                        </ConfigSection>
                    </div>
                )}
            </div>

            {/* Right Column: Output */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4">
                
                {/* Action Button */}
                <button 
                    onClick={handleOptimize}
                    disabled={isOptimizing || !basePrompt}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                >
                    {isOptimizing ? <span className="animate-spin">⏳</span> : <Icons.Magic />}
                    {isOptimizing ? "Optimizing..." : "Generate Optimized Meta-Prompt"}
                </button>

                {error && <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg text-sm text-center">{error}</div>}

                {/* Optimized Result Window */}
                <div className="flex-1 flex flex-col bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden min-h-[400px]">
                    <div className="h-12 bg-gray-800/50 flex items-center justify-between px-4 border-b border-gray-700">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Meta-Prompt Result
                        </span>
                        <div className="flex gap-2">
                            {optimizedPrompt && (
                                <button 
                                    onClick={() => onSavePrompt(optimizedPrompt)}
                                    className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors"
                                >
                                    Save
                                </button>
                            )}
                            <OutputDisplay prompt={optimizedPrompt} isLoading={false} onClear={() => setOptimizedPrompt("")} showActions={{save: false, clear: false}} /> 
                        </div>
                    </div>
                    
                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar relative">
                        {isOptimizing && !optimizedPrompt ? (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500 animate-pulse">
                                AI is rewriting your prompt...
                            </div>
                        ) : (
                            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300 leading-relaxed">
                                {optimizedPrompt || <span className="text-gray-600 italic">Your optimized prompt will appear here ready to copy...</span>}
                            </pre>
                        )}
                    </div>

                    {/* Test Playground */}
                    {optimizedPrompt && (
                        <div className="border-t border-gray-700 bg-black/30">
                            <div className="p-2 flex justify-between items-center bg-indigo-900/20 px-4">
                                <span className="text-xs font-bold text-indigo-400 uppercase">Test Playground</span>
                                <button 
                                    onClick={handleTestRun}
                                    disabled={isTesting}
                                    className="flex items-center gap-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                                >
                                    {isTesting ? 'Running...' : 'Run This Prompt'} <Icons.Play />
                                </button>
                            </div>
                            {testResult && (
                                <div className="p-4 max-h-48 overflow-y-auto border-t border-gray-800 bg-gray-900/80 custom-scrollbar">
                                    <h4 className="text-xs text-gray-500 mb-2">AI Output:</h4>
                                    <p className="text-sm text-gray-200 whitespace-pre-wrap">{testResult}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
