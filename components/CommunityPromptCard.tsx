
import React from 'react';
import { CommunityPrompt, User } from '../prompts/collection';

// --- ICONS ---
const ForkIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 21V11m0 0V3a2 2 0 10-4 0v8m4 0a2 2 0 11-4 0m4 0h3m-3 7a2 2 0 104 0v-5a2 2 0 10-4 0v5z" />
    </svg>
);
const HeartIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${filled ? 'text-red-500' : ''}`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
);
// --- END ICONS ---

interface CommunityPromptCardProps {
    prompt: CommunityPrompt;
    currentUser: User | null;
    onLike: (promptId: string) => void;
    onFork: (prompt: CommunityPrompt) => void;
}

const Stat: React.FC<{ icon: React.ReactNode; value: number }> = ({ icon, value }) => (
    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-semibold">
        {icon}
        <span>{value}</span>
    </div>
);

export const CommunityPromptCard: React.FC<CommunityPromptCardProps> = ({ prompt, currentUser, onLike, onFork }) => {
    
    const hasLiked = currentUser?.likedPromptIds.includes(prompt.id) ?? false;
    
    const handleActionClick = (e: React.MouseEvent, action?: () => void) => {
        e.stopPropagation();
        action?.();
    };

    return (
      <div
          className="relative group w-full min-h-[220px] flex flex-col justify-between p-5 bg-white/50 dark:bg-gray-900/50 rounded-2xl border-2 border-gray-200 dark:border-gray-700/60 shadow-lg hover:shadow-indigo-500/20 hover:border-indigo-500/50 transition-all duration-300 ease-in-out transform hover:-translate-y-1.5"
      >
        <div className="flex-1 space-y-3">
          <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400">By {prompt.authorName}</p>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{prompt.title}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium text-left line-clamp-3">
              {prompt.prompt}
          </p>
        </div>
        
        <div className="mt-4 flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center gap-4">
                <Stat icon={<HeartIcon filled={true} />} value={prompt.likes} />
                <Stat icon={<ForkIcon />} value={prompt.forks} />
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={(e) => handleActionClick(e, () => onLike(prompt.id))} 
                    className={`p-2 rounded-full transition-colors ${hasLiked ? 'bg-red-100 text-red-500 dark:bg-red-500/20' : 'bg-gray-200 dark:bg-gray-700/80 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                    title={hasLiked ? "Remove your like" : "Like this creation"}
                >
                    <HeartIcon filled={hasLiked} />
                </button>
                 <button 
                    onClick={(e) => handleActionClick(e, () => onFork(prompt))} 
                    className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
                    title="Fork this prompt to your own collection to edit and use"
                >
                    <ForkIcon />
                    Fork
                </button>
            </div>
        </div>
      </div>
    );
};
