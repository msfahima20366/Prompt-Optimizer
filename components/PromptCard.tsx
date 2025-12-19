
import React, { useState, useMemo } from 'react';
import { Prompt, LibraryPrompt } from '../prompts/collection';

interface PromptCardProps {
    prompt: Prompt | LibraryPrompt;
    onView?: () => void;
    searchQuery?: string;
    index?: number; // Kept for interface compatibility but not rendered
}

const CATEGORY_COLORS: Record<string, string> = {
    'Business Strategy': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'Marketing & Sales': 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border-pink-200 dark:border-pink-800',
    'Product Development': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    'Local Bangladesh': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    'Digital & Remote': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    'Content & Social': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    'Customer Analysis': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    'Pricing Strategy': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    'AI & Engineering': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    'Creative Writing': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800'
};

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
    
    const isTrending = useMemo(() => {
        if ('views' in prompt) return prompt.views > 4000;
        return false;
    }, [prompt]);

    const isNew = useMemo(() => {
        if ('createdAt' in prompt && prompt.createdAt) {
            const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            return prompt.createdAt > sevenDaysAgo;
        }
        return false;
    }, [prompt]);

    const handleQuickCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(prompt.prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const category = 'category' in prompt ? (prompt.category || 'General') : 'My Prompt';
    const colorClasses = CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';

    const highlightedTitle = useMemo(() => {
        if (!searchQuery.trim()) return prompt.title;
        const regex = new RegExp(`(${searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
        const parts = prompt.title.split(regex);
        return parts.map((part, i) => 
            regex.test(part) ? (
                <mark key={i} className="bg-amber-300 dark:bg-amber-500/60 text-gray-900 dark:text-white rounded-sm px-0.5">
                    {part}
                </mark>
            ) : part
        );
    }, [prompt.title, searchQuery]);

    const highlightedPrompt = useMemo(() => {
        if (!searchQuery.trim()) return prompt.prompt;
        const regex = new RegExp(`(${searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
        const parts = prompt.prompt.split(regex);
        return parts.map((part, i) => 
            regex.test(part) ? (
                <mark key={i} className="bg-indigo-200 dark:bg-indigo-500/40 text-gray-900 dark:text-white rounded-sm px-0.5 border-b border-indigo-400">
                    {part}
                </mark>
            ) : part
        );
    }, [prompt.prompt, searchQuery]);

    return (
        <div 
            onClick={onView}
            className="modern-card p-6 group cursor-pointer hover:border-indigo-500 transition-all duration-300 flex flex-col justify-between h-full hover:shadow-xl hover:shadow-indigo-500/5 bg-white dark:bg-slate-900 border-gray-100 dark:border-gray-800 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-2 flex gap-1 z-10">
                {isTrending && (
                    <div className="px-2 py-0.5 bg-orange-500 text-white text-[8px] font-black uppercase tracking-tighter rounded-full shadow-lg shadow-orange-500/20">
                        🔥 Trending
                    </div>
                )}
                {isNew && (
                    <div className="px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-tighter rounded-full shadow-lg shadow-emerald-500/20">
                        ✨ Newest
                    </div>
                )}
            </div>
            
            <div>
                <div className="flex justify-between items-start mb-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border shadow-sm ${colorClasses}`}>
                        {category}
                    </span>
                    {copied && <span className="text-[9px] font-bold text-emerald-500 uppercase animate-pulse">Copied!</span>}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-3 text-lg leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {highlightedTitle}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed mb-6 italic opacity-80">
                    "{highlightedPrompt}"
                </p>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-gray-800">
                <button className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 uppercase tracking-widest transition-colors flex items-center gap-1">
                    View Full Prompt
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
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
