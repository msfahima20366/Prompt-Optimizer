
import React, { useState } from 'react';
import { Prompt, LibraryPrompt } from '../prompts/collection';

interface PromptCardProps {
    prompt: Prompt | LibraryPrompt;
    onView?: () => void;
    onToggleFavorite?: () => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, onView, onToggleFavorite }) => {
    const isLib = 'goal' in prompt;
    const [copied, setCopied] = useState(false);

    const copy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(prompt.prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isFav = !isLib && (prompt as Prompt).isFavorite;

    return (
        <div 
            onClick={onView}
            className="group relative flex flex-col justify-between p-8 bg-white dark:bg-stone-900/50 border border-amber-100 dark:border-stone-800 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent blur-2xl group-hover:from-amber-500/20"></div>
            
            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-orange-600 opacity-70">{isLib ? 'Library Trace' : 'User Entry'}</span>
                        <h3 className="text-xl font-black tracking-tighter text-brand-navy dark:text-white line-clamp-1 uppercase ">{prompt.title}</h3>
                    </div>
                    {!isLib && onToggleFavorite && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} 
                            title={isFav ? "Remove from favorites" : "Add to your personal favorites"}
                            className={`p-2 rounded-full transition-colors ${ isFav ? 'text-orange-500' : 'text-stone-300 dark:text-stone-700 hover:text-orange-400'}`}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        </button>
                    )}
                </div>
                <p className="text-sm font-medium text-stone-500 dark:text-slate-400 leading-relaxed line-clamp-4">
                    "{prompt.prompt}"
                </p>
            </div>

            <div className="mt-8 pt-6 flex justify-between items-center border-t border-amber-50 dark:border-stone-800">
                <button 
                  onClick={copy} 
                  title="Copy the prompt content to clipboard"
                  className={`flex items-center gap-2 px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-amber-50 dark:bg-stone-800 text-orange-700 dark:text-amber-400 hover:bg-amber-500 hover:text-white shadow-sm'}`}
                >
                    {copied ? 'Copied' : 'Copy Trace'}
                </button>
                <span className="text-[10px] font-black text-stone-400 dark:text-stone-600 uppercase tracking-widest">
                    {isLib ? (prompt as LibraryPrompt).technique : (prompt as Prompt).category || 'Unset'}
                </span>
            </div>
        </div>
    );
};
