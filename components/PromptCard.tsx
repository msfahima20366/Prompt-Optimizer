
import React from 'react';
import { Prompt, LibraryPrompt } from '../prompts/collection';

interface PromptCardProps {
    prompt: Prompt | LibraryPrompt;
    onView?: () => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, onView }) => {
    return (
        <div 
            onClick={onView}
            className="modern-card p-5 group cursor-pointer hover:border-indigo-500 transition-all flex flex-col justify-between"
        >
            <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 mb-2 block">
                    {'category' in prompt ? (prompt.category || 'General') : 'My Prompt'}
                </span>
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 mb-3">{prompt.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed mb-4">
                    "{prompt.prompt}"
                </p>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-gray-700">
                <button className="text-[10px] font-bold text-indigo-600 hover:underline">View Full</button>
                <button 
                    onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(prompt.prompt); }}
                    className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-indigo-600 hover:text-white transition-all"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
            </div>
        </div>
    );
};
