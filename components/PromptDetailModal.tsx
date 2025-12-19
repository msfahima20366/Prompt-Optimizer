
import React, { useState } from 'react';
import { Prompt, LibraryPrompt, User } from '../prompts/collection';

// Icons
const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const CopyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);
const SaveIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
);
const SparklesIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.191 9.112a1 1 0 010 1.776l-3.045 1.912-1.212 4.456a1 1 0 01-1.922 0l-1.212-4.456-3.045-1.912a1 1 0 010-1.776l3.045-1.912 1.212-4.456A1 1 0 0112 2z" clipRule="evenodd" />
    </svg>
);

interface PromptDetailModalProps {
    prompt: Prompt | LibraryPrompt;
    userCollection: Prompt[];
    onClose: () => void;
    onEdit?: (prompt: Prompt) => void;
    onDelete?: (prompt: Prompt) => void;
    onUse: (prompt: Prompt | LibraryPrompt) => void;
    onToggleFavorite?: (promptId: string) => void;
    onSave: (prompt: {title: string, prompt: string}) => void;
    currentUser: User | null;
}

const MetaItem: React.FC<{ label: string; value: string | React.ReactNode }> = ({ label, value }) => (
    <div className="space-y-1">
        <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</h4>
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-relaxed">{value}</div>
    </div>
);

export const PromptDetailModal: React.FC<PromptDetailModalProps> = ({ prompt, onClose, onSave }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt.prompt);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleSaveCopy = () => {
        onSave({ title: prompt.title, prompt: prompt.prompt });
    };

    const handleLaunch = (target: 'ChatGPT' | 'Claude' | 'Gemini') => {
        // Auto save on launch as requested
        handleSaveCopy();
        
        const encodedPrompt = encodeURIComponent(prompt.prompt);
        let url = "";
        if (target === 'ChatGPT') url = `https://chatgpt.com/?q=${encodedPrompt}`;
        else if (target === 'Claude') url = `https://claude.ai/new?q=${encodedPrompt}`;
        else if (target === 'Gemini') url = `https://gemini.google.com/app?q=${encodedPrompt}`;
        
        window.open(url, '_blank');
    };

    // Extracting info for LibraryPrompt type
    const libPrompt = prompt as LibraryPrompt;
    const goal = libPrompt.goal || "Not specified";
    const category = libPrompt.category || "General";
    const models = libPrompt.llmModels ? libPrompt.llmModels.join(', ') : "Various";
    const keywords = libPrompt.tags ? libPrompt.tags.join(', ') : "#ai, #prompt";
    const technique = libPrompt.technique || "Zero-shot";
    const temp = libPrompt.temperature !== undefined ? libPrompt.temperature : 0.7;
    const tokens = libPrompt.tokens || "N/A";

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                
                {/* Header Title Bar */}
                <header className="flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{prompt.title}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-400">
                        <CloseIcon />
                    </button>
                </header>

                <div className="flex flex-col md:flex-row overflow-hidden flex-1">
                    
                    {/* Left Side: Prompt Content */}
                    <div className="flex-1 p-8 flex flex-col bg-white dark:bg-gray-900">
                        <div className="flex-1 bg-slate-50 dark:bg-gray-950/50 rounded-xl p-6 mb-6 overflow-y-auto border border-slate-100 dark:border-gray-800">
                            <p className="text-base text-slate-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {prompt.prompt}
                            </p>
                        </div>
                        <div className="flex justify-start">
                            <button 
                                onClick={handleCopy}
                                className={`flex items-center px-5 py-3 rounded-lg text-xs font-bold uppercase transition-all shadow-md ${isCopied ? 'bg-emerald-500 text-white' : 'bg-[#4F46E5] text-white hover:bg-indigo-700'}`}
                            >
                                <CopyIcon />
                                {isCopied ? 'Copied' : 'Copy Full Prompt'}
                            </button>
                        </div>
                    </div>

                    {/* Right Side: Metadata Sidebar */}
                    <div className="w-full md:w-80 border-l border-gray-100 dark:border-gray-800 p-8 space-y-7 bg-white dark:bg-gray-900 overflow-y-auto">
                        <MetaItem label="Goal" value={goal} />
                        <MetaItem label="Category" value={category} />
                        <MetaItem label="Compatible Models" value={models} />
                        <MetaItem label="Keywords" value={keywords} />
                        <MetaItem label="Technique" value={technique} />
                        <MetaItem label="Suggested Temp." value={temp.toString()} />
                        <MetaItem label="Approx. Tokens" value={tokens.toString()} />
                        
                        <hr className="border-gray-100 dark:border-gray-800" />

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Launch In</h4>
                            <div className="flex flex-wrap gap-2">
                                <button 
                                    onClick={() => handleLaunch('Gemini')}
                                    className="flex items-center px-4 py-2 bg-slate-50 dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-lg text-xs font-bold text-slate-700 dark:text-gray-200 hover:border-indigo-400 transition-all"
                                >
                                    <SparklesIcon /> Gemini
                                </button>
                                <button 
                                    onClick={() => handleLaunch('ChatGPT')}
                                    className="px-4 py-2 bg-slate-50 dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-lg text-xs font-bold text-slate-700 dark:text-gray-200 hover:border-indigo-400 transition-all"
                                >
                                    ChatGPT
                                </button>
                                <button 
                                    onClick={() => handleLaunch('Claude')}
                                    className="flex items-center px-4 py-2 bg-slate-50 dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-lg text-xs font-bold text-slate-700 dark:text-gray-200 hover:border-indigo-400 transition-all"
                                >
                                    <SparklesIcon /> Claude
                                </button>
                            </div>
                        </div>

                        <button 
                            onClick={handleSaveCopy}
                            className="w-full flex items-center justify-center px-4 py-3 bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-200 rounded-lg text-xs font-bold uppercase tracking-tight hover:bg-slate-200 dark:hover:bg-gray-700 transition-all border border-transparent"
                        >
                            <SaveIcon />
                            Save a Copy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
