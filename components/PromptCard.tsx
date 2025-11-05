import React from 'react';
import { Prompt, LibraryPrompt } from '../prompts/collection';

// --- ICONS ---
const ForkIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 21V11m0 0V3a2 2 0 10-4 0v8m4 0a2 2 0 11-4 0m4 0h3m-3 7a2 2 0 104 0v-5a2 2 0 10-4 0v5z" />
    </svg>
);


const StarIcon: React.FC<{ isFavorite: boolean }> = ({ isFavorite }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" 
        className={isFavorite ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}/>
    </svg>
);

const RemoveIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
// --- END ICONS ---

const LLMIcon: React.FC<{ model: string }> = ({ model }) => {
    const baseClass = "w-4 h-4 rounded-full";
    switch (model) {
        case 'Gemini': return <div className={`${baseClass} bg-gradient-to-br from-blue-400 to-purple-500`} title="Gemini"></div>;
        case 'ChatGPT': return <div className={`${baseClass} bg-gradient-to-br from-green-400 to-teal-500`} title="ChatGPT"></div>;
        case 'Claude': return <div className={`${baseClass} bg-gradient-to-br from-orange-400 to-yellow-500`} title="Claude"></div>;
        default: return null;
    }
};

interface PromptCardProps {
    prompt: Prompt | LibraryPrompt;
    onView?: () => void;
    onToggleFavorite?: () => void;
    onForkPrompt?: () => void;
    onRemoveFromProject?: () => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, onView, onToggleFavorite, onForkPrompt, onRemoveFromProject }) => {
    const isLibraryPrompt = 'goal' in prompt;
    const userPrompt = isLibraryPrompt ? null : prompt;

    const handleActionClick = (e: React.MouseEvent, action?: () => void) => {
        e.stopPropagation();
        action?.();
    };

    return (
      <div
          onClick={onView}
          className="relative group w-full flex flex-col bg-white/50 dark:bg-gray-900/50 rounded-2xl border-2 border-gray-200 dark:border-gray-700/60 shadow-lg hover:shadow-yellow-500/20 hover:border-amber-500/50 transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 cursor-pointer overflow-hidden"
      >
        {userPrompt?.type === 'image' && userPrompt.imageUrl && (
          <div className="aspect-video bg-gray-200 dark:bg-gray-800">
            <img src={userPrompt.imageUrl} alt={userPrompt.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            {onRemoveFromProject ? (
                <button onClick={(e) => handleActionClick(e, onRemoveFromProject)} className="p-1.5 bg-gray-100 text-red-500 dark:bg-gray-800/80 dark:text-red-400 rounded-full hover:bg-red-500/20 dark:hover:bg-red-500/30 transition-colors" title="Remove from Project">
                    <RemoveIcon />
                </button>
            ) : isLibraryPrompt ? (
                <button onClick={(e) => handleActionClick(e, onForkPrompt)} className="p-1.5 bg-gray-100 dark:bg-gray-800/80 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Fork to Collection">
                    <ForkIcon />
                </button>
            ) : (
                <button onClick={(e) => handleActionClick(e, onToggleFavorite)} className="p-1.5 bg-gray-100 dark:bg-gray-800/80 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Toggle Favorite">
                    <StarIcon isFavorite={!!userPrompt?.isFavorite} />
                </button>
            )}
        </div>
        
        <div className="flex-1 flex flex-col justify-between p-5">
            <div className="flex-1 space-y-3">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg pr-12">{prompt.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium text-left line-clamp-4">
                    {prompt.prompt}
                </p>
            </div>
            
            <div className="mt-4 flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700/50">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                    {isLibraryPrompt && prompt.llmModels.map(model => <LLMIcon key={model} model={model} />)}
                    {!isLibraryPrompt && <span className="text-amber-600 dark:text-amber-400">In Your Collection</span>}
                </div>
                 <button onClick={(e) => handleActionClick(e, onView)} className="text-xs font-bold px-3 py-1.5 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    View
                </button>
            </div>
        </div>
      </div>
    );
};