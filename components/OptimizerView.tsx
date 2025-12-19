
import React, { useState, useEffect } from 'react';
import { UserContext, ALL_LLM_MODELS } from '../prompts/collection';
import { generatePromptStream, auditPrompt, critiquePrompt, SYSTEM_INSTRUCTION_META_PROMPT } from '../services/geminiService';

interface OptimizerViewProps {
    userContexts: UserContext[];
    onSaveNewContext: () => void;
    onDeleteContext: (contextId: string) => void;
    onSavePrompt: (prompt: string) => void;
    addToHistory: (prompt: string) => void;
}

const SETTINGS = [
    { id: 'persona', label: 'Expert Persona', desc: 'Adds a "Pro" identity to the AI.' },
    { id: 'logic', label: 'Step by Step', desc: 'Makes AI think logically before answering.' },
    { id: 'audience', label: 'For Beginners', desc: 'Explains things in simple, easy words.' },
    { id: 'format', label: 'Well Structured', desc: 'Adds clear headings and lists.' },
    { id: 'safety', label: 'Facts Only', desc: 'Reduces mistakes and made-up info.' },
    { id: 'examples', label: 'With Examples', desc: 'Shows the AI how you want it done.' },
];

export const OptimizerView: React.FC<OptimizerViewProps> = ({ userContexts, onSaveNewContext, onDeleteContext }) => {
    const [input, setInput] = useState("");
    const [selectedSettings, setSelectedSettings] = useState<Set<string>>(new Set(['persona', 'logic']));
    const [selectedContexts, setSelectedContexts] = useState<Set<string>>(new Set());
    const [model, setModel] = useState("ChatGPT");
    const [result, setResult] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [audit, setAudit] = useState<any>(null);

    const toggleSetting = (id: string) => {
        const next = new Set(selectedSettings);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedSettings(next);
    };

    const handleImprove = async () => {
        if (!input.trim() || isProcessing) return;
        setIsProcessing(true);
        setResult("");
        
        const activeSettingsText = SETTINGS.filter(s => selectedSettings.has(s.id)).map(s => s.label).join(", ");
        const contextText = userContexts.filter(c => selectedContexts.has(c.id)).map(c => `${c.title}: ${c.content}`).join("\n");
        const fullRequest = `Model: ${model}\nSettings: ${activeSettingsText}\nContext:\n${contextText}\n\nDraft: ${input}`;

        try {
            const stream = await generatePromptStream(fullRequest, 0.7, 0.9, SYSTEM_INSTRUCTION_META_PROMPT);
            let fullText = "";
            for await (const chunk of stream) {
                fullText += chunk;
                setResult(fullText);
            }
            const auditData = await auditPrompt(fullText);
            setAudit(auditData);
        } catch (e) {
            setResult("Sorry, something went wrong. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
            
            {/* Secondary Controls (Settings) */}
            <aside className="lg:col-span-3 space-y-6">
                <div className="modern-card p-5 space-y-4">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200">1. AI Model</h3>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                        {ALL_LLM_MODELS.map(m => (
                            <button 
                                key={m}
                                onClick={() => setModel(m)}
                                className={`text-left px-3 py-2 rounded-md text-xs font-semibold transition-all border ${model === m ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-transparent hover:bg-gray-200'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="modern-card p-5 space-y-4">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200">2. How to Improve?</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {SETTINGS.map(s => (
                            <button 
                                key={s.id}
                                title={s.desc}
                                onClick={() => toggleSetting(s.id)}
                                className={`text-left p-3 rounded-lg border-2 transition-all ${selectedSettings.has(s.id) ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                            >
                                <span className={`block text-xs font-bold ${selectedSettings.has(s.id) ? 'text-indigo-600' : 'text-gray-700 dark:text-gray-300'}`}>{s.label}</span>
                                <span className="text-[10px] text-gray-500 opacity-70">{s.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="modern-card p-5 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-700 dark:text-gray-200">3. My Context</h3>
                        <button onClick={onSaveNewContext} className="text-indigo-600 font-bold text-[10px] uppercase">+ New</button>
                    </div>
                    <div className="space-y-2">
                        {userContexts.map(c => (
                            <button
                                key={c.id}
                                onClick={() => {
                                    const next = new Set(selectedContexts);
                                    next.has(c.id) ? next.delete(c.id) : next.add(c.id);
                                    setSelectedContexts(next);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-md text-xs border ${selectedContexts.has(c.id) ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
                            >
                                {c.title}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Primary Action Area (Input & Result) */}
            <main className="lg:col-span-9 space-y-6">
                <section className="modern-card p-6 space-y-4">
                    <h2 className="text-xl font-black text-gray-800 dark:text-white">Prompt Improver</h2>
                    <div className="relative">
                        <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Write your basic idea here..."
                            className="w-full h-40 p-4 text-lg bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium"
                        />
                        <div className="absolute bottom-3 right-4 text-[10px] font-bold text-gray-400">
                            Characters: {input.length}
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <p className="text-xs text-gray-500 font-medium">Tip: Use "Step by Step" for complex tasks.</p>
                        <button 
                            onClick={handleImprove}
                            disabled={isProcessing || !input.trim()}
                            className="btn-main px-8 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                        >
                            {isProcessing ? "Processing..." : "Improve Prompt Now"}
                        </button>
                    </div>
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
                    {/* Primary Output Section */}
                    <div className="xl:col-span-7 flex flex-col bg-emerald-600 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="px-6 py-4 bg-black/10 flex justify-between items-center text-white border-b border-white/10">
                            <span className="font-bold text-xs uppercase tracking-widest">Improved Prompt</span>
                            {result && (
                                <button 
                                    onClick={() => navigator.clipboard.writeText(result)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-xs font-bold border border-white/20"
                                >
                                    Copy Prompt
                                </button>
                            )}
                        </div>
                        <div className="p-8 text-white text-lg font-medium whitespace-pre-wrap leading-relaxed min-h-[300px]">
                            {result ? result : (
                                <div className="h-full flex flex-col items-center justify-center opacity-50 py-12">
                                    <span className="text-4xl mb-4">✨</span>
                                    <p className="text-sm font-bold italic">Your awesome prompt will appear here!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Secondary Audit Section */}
                    <div className="xl:col-span-3 modern-card p-6 space-y-6">
                        <h4 className="font-bold text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-2">Score Card</h4>
                        {audit ? (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                                        <span>Clarity</span>
                                        <span>{audit.clarity}%</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{width: `${audit.clarity}%`}}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                                        <span>Details</span>
                                        <span>{audit.specificity}%</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{width: `${audit.specificity}%`}}></div>
                                    </div>
                                </div>
                                <div className="pt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                                    <p className="text-[10px] font-black uppercase text-indigo-600 mb-2">AI Verdict</p>
                                    <p className="text-xs italic text-gray-700 dark:text-gray-300">"{audit.overall_verdict}"</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 text-center py-12 italic">Waiting for analysis...</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};
