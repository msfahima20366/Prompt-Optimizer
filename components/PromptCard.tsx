
import React, { useState } from 'react';
import { Prompt, LibraryPrompt } from '../prompts/collection';

interface PromptCardProps {
    prompt: Prompt | LibraryPrompt;
    onView?: () => void;
    searchQuery?: string;
}

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, onView, searchQuery = "" }) => {
    const [copied, setCopied] = useState(false);
    
    const handleQuickCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(prompt.prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Highlight logic
    const getHighlightedText = (text: string, highlight: string) => {
        if (!highlight.trim()) return text;
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) => 
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <span key={i} className="bg-yellow-200 dark:bg-indigo-500/40 text-indigo-900 dark:text-indigo-100 rounded px-0.5 font-bold">
                            {part}
                        </span>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    return (
        <div 
            onClick={onView}
            className="modern-card p-6 group cursor-pointer hover:border-indigo-500 transition-all duration-300 flex flex-col justify-between h-full hover:shadow-xl hover:shadow-indigo-500/5 bg-white dark:bg-slate-900 border-gray-100 dark:border-gray-800"
        >
            <div>
                <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                        {'category' in prompt ? (prompt.category || 'General') : 'My Prompt'}
                    </span>
                    {copied && <span className="text-[9px] font-bold text-emerald-500 uppercase animate-pulse">Copied!</span>}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-3 text-lg leading-snug">
                    {getHighlightedText(prompt.title, searchQuery)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed mb-6 italic">
                    "{getHighlightedText(prompt.prompt, searchQuery)}"
                </p>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-gray-800">
                <button className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 uppercase tracking-wider transition-colors">
                    View Blueprint
                </button>
                <button 
                    onClick={handleQuickCopy}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${copied ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-gray-50 dark:bg-gray-800 hover:bg-indigo-600 hover:text-white shadow-sm'}`}
                    title="Quick Copy to Clipboard"
                >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{copied ? 'Copied' : 'Copy'}</span>
                </button>
            </div>
        </div>
    );
};
