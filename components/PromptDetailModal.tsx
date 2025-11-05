
import React, { useState, useEffect, useRef } from 'react';
import { Prompt, LibraryPrompt, User } from '../prompts/collection';

// Icons
const CopyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5z" /></svg>
);
const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
);
const EditIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
);
const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);
const StarIcon: React.FC<{isFavorite: boolean}> = ({ isFavorite }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${isFavorite ? 'text-yellow-400' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
);
const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);
const SaveIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
);
const ShareIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
);
const GeminiIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
      <defs>
        <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#4285F4'}} />
          <stop offset="100%" style={{stopColor: '#9B72F9'}} />
        </linearGradient>
      </defs>
      <path d="M12 2.5L13.849 9.151L20.5 11L13.849 12.849L12 19.5L10.151 12.849L3.5 11L10.151 9.151L12 2.5Z" stroke="url(#gemini-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


interface PromptDetailModalProps {
    prompt: Prompt | LibraryPrompt;
    onClose: () => void;
    onEdit?: (prompt: Prompt) => void;
    onDelete?: (promptId: string) => void;
    onUse: (prompt: Prompt | LibraryPrompt) => void;
    onToggleFavorite?: (promptId: string) => void;
    onSave: (prompt: {title: string, prompt: string}) => void;
    currentUser: User | null;
    onShare?: (prompt: Prompt) => void;
}

const MetaDataItem: React.FC<{label: string, value: React.ReactNode}> = ({label, value}) => (
    <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-gray-800 dark:text-gray-200 font-medium">{value}</p>
    </div>
);

const LLMButton: React.FC<{
    Icon: React.FC;
    label: string;
    tooltip: string;
    onClick: () => void;
}> = ({ Icon, label, tooltip, onClick }) => (
    <button
        title={tooltip}
        onClick={onClick}
        className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
        <Icon />
        <span>{label}</span>
    </button>
);


export const PromptDetailModal: React.FC<PromptDetailModalProps> = ({ prompt, onClose, onEdit, onDelete, onUse, onToggleFavorite, onSave, currentUser, onShare }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [selectedSnippet, setSelectedSnippet] = useState('');
    const [copyNotification, setCopyNotification] = useState<string | null>(null);
    const promptDisplayRef = useRef<HTMLDivElement>(null);

    const isLibraryPrompt = 'goal' in prompt;
    const userPrompt = isLibraryPrompt ? null : prompt as Prompt;
    const libraryPrompt = isLibraryPrompt ? prompt as LibraryPrompt : null;

    useEffect(() => {
        const handleSelectionChange = () => {
            const selection = window.getSelection();
            if (selection && promptDisplayRef.current?.contains(selection.anchorNode)) {
                 setSelectedSnippet(selection.toString().trim());
            } else {
                 setSelectedSnippet('');
            }
        };
        document.addEventListener('selectionchange', handleSelectionChange);
        return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, []);

    useEffect(() => {
        if (isCopied) {
            const timer = setTimeout(() => setIsCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isCopied]);

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt.prompt);
        setIsCopied(true);
    };

    const handleSaveSnippet = () => {
        if (!selectedSnippet) return;
        onSave({ title: `${prompt.title} (Snippet)`, prompt: selectedSnippet });
        onClose();
    };

    const handleLaunch = (model: 'Gemini' | 'ChatGPT' | 'Claude') => {
        const promptText = prompt.prompt;
    
        if (model === 'Gemini') {
            const url = `https://gemini.google.com/app?prompt=${encodeURIComponent(promptText)}`;
            window.open(url, '_blank', 'noopener,noreferrer');
            return;
        }

        const copyToClipboard = async (text: string): Promise<boolean> => {
            // Modern API first
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(text);
                    return true;
                } catch (err) {
                    console.error('Clipboard API failed, falling back.', err);
                }
            }

            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.width = "2em";
            textArea.style.height = "2em";
            textArea.style.padding = "0";
            textArea.style.border = "none";
            textArea.style.outline = "none";
            textArea.style.boxShadow = "none";
            textArea.style.background = "transparent";

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            let success = false;
            try {
                success = document.execCommand('copy');
                if (!success) {
                   console.error('Fallback: document.execCommand was unsuccessful');
                }
            } catch (err) {
                console.error('Fallback: an error occurred copying text', err);
            }

            document.body.removeChild(textArea);
            return success;
        };

        copyToClipboard(promptText).then(success => {
            if (success) {
                setCopyNotification(`প্রম্পট কপি হয়েছে! ${model} খুলছে...`);
            } else {
                setCopyNotification(`কপি করতে সমস্যা হয়েছে। অনুগ্রহ করে ম্যানুয়ালি কপি করুন।`);
            }
            setTimeout(() => setCopyNotification(null), 3000);

            let url = '';
            if (model === 'ChatGPT') {
                url = 'https://chat.openai.com/';
            } else if (model === 'Claude') {
                url = 'https://claude.ai/chats';
            }
            window.open(url, '_blank', 'noopener,noreferrer');
        });
    };
    
    const actionButtonClasses = "w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors";
    const compatibleModels = isLibraryPrompt ? libraryPrompt.llmModels : ['Gemini', 'ChatGPT', 'Claude'];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-fuchsia-500/30 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700/50 flex-shrink-0">
                    <h2 className="text-xl font-bold gradient-text truncate pr-8">{prompt.title}</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <CloseIcon />
                    </button>
                </header>
                
                <div className="flex flex-col md:flex-row flex-1 min-h-0">
                    <div className="w-full md:w-3/5 flex flex-col p-6 space-y-4 overflow-y-auto">
                        <div ref={promptDisplayRef} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg flex-1">
                           <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap selection:bg-indigo-500/50">{prompt.prompt}</p>
                        </div>
                        <div className="flex items-center gap-3 text-sm flex-wrap">
                            <button onClick={handleCopy} className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors">
                               {isCopied ? <CheckIcon /> : <CopyIcon />}
                               {isCopied ? 'Copied!' : 'Copy Full Prompt'}
                            </button>
                            {selectedSnippet && (
                                <button onClick={handleSaveSnippet} className="flex animate-fade-in items-center justify-center px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500 transition-colors">
                                   <SaveIcon/> Save Snippet
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="w-full md:w-2/5 bg-gray-50/50 dark:bg-gray-900/40 p-6 space-y-5 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700/50 overflow-y-auto">
                        <MetaDataItem label="Goal" value={isLibraryPrompt ? libraryPrompt.goal : 'A prompt from your personal collection.'} />
                        {isLibraryPrompt && <MetaDataItem label="Category" value={libraryPrompt.category} />}
                        {userPrompt?.category && <MetaDataItem label="Category" value={userPrompt.category} />}

                        {isLibraryPrompt && <MetaDataItem label="Technique" value={libraryPrompt.technique} />}
                        {isLibraryPrompt && <MetaDataItem label="Suggested Temp." value={libraryPrompt.temperature.toFixed(1)} />}
                        {isLibraryPrompt && <MetaDataItem label="Approx. Tokens" value={libraryPrompt.tokens} />}

                        {isLibraryPrompt && (
                           <div>
                               <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Models</p>
                               <div className="flex flex-wrap gap-2">
                                   {libraryPrompt.llmModels.map(model => (
                                       <span key={model} className="text-sm font-semibold bg-gray-200 text-gray-800 dark:bg-gray-700/80 dark:text-gray-200 px-3 py-1 rounded-full">{model}</span>
                                   ))}
                               </div>
                           </div>
                        )}
                         {isLibraryPrompt && (
                           <div>
                               <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Tags</p>
                               <div className="flex flex-wrap gap-2">
                                   {libraryPrompt.tags.map(tag => (
                                       <span key={tag} className="text-sm font-semibold bg-gray-200 text-gray-800 dark:bg-gray-700/80 dark:text-gray-200 px-3 py-1 rounded-full">{tag}</span>
                                   ))}
                               </div>
                           </div>
                        )}
                        
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700/50 space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-2">
                                    Launch In
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {compatibleModels.includes('Gemini') && (
                                        <LLMButton
                                            Icon={GeminiIcon}
                                            label="Gemini"
                                            tooltip="Best for creative tasks and complex reasoning. (Pre-fills prompt)"
                                            onClick={() => handleLaunch('Gemini')}
                                        />
                                    )}
                                    {compatibleModels.includes('ChatGPT') && (
                                        <LLMButton
                                            Icon={GeminiIcon}
                                            label="ChatGPT"
                                            tooltip="Great all-rounder for a variety of tasks. (Copies prompt)"
                                            onClick={() => handleLaunch('ChatGPT')}
                                        />
                                    )}
                                    {compatibleModels.includes('Claude') && (
                                        <LLMButton
                                            Icon={GeminiIcon}
                                            label="Claude"
                                            tooltip="Excellent for long-form content and detailed analysis. (Copies prompt)"
                                            onClick={() => handleLaunch('Claude')}
                                        />
                                    )}
                                </div>
                                {copyNotification && (
                                    <p className="text-center text-sm text-indigo-500 dark:text-indigo-400 mt-2 animate-fade-in">
                                        {copyNotification}
                                    </p>
                                )}
                            </div>

                             <button onClick={() => onSave({title: prompt.title, prompt: prompt.prompt})} className={actionButtonClasses}>
                                <SaveIcon />
                                Save a Copy
                            </button>

                            {!isLibraryPrompt && onEdit && onToggleFavorite && onDelete && userPrompt && (
                                <>
                                    {currentUser?.subscriptionTier === 'premium' && onShare && (
                                        <button 
                                            onClick={() => onShare(userPrompt)} 
                                            disabled={userPrompt.isShared}
                                            className={`${actionButtonClasses} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                            <ShareIcon />
                                            {userPrompt.isShared ? 'Already Shared' : 'Share to Community'}
                                        </button>
                                    )}
                                    <button onClick={() => onToggleFavorite(userPrompt.id)} className={actionButtonClasses}>
                                        <StarIcon isFavorite={!!userPrompt.isFavorite} />
                                        {userPrompt.isFavorite ? 'Unfavorite' : 'Favorite'}
                                    </button>
                                     <button onClick={() => onEdit(userPrompt)} className={actionButtonClasses}>
                                        <EditIcon />
                                        Edit
                                    </button>
                                    <button onClick={() => onDelete(userPrompt.id)} className="w-full flex items-center justify-center px-4 py-2 bg-red-100 text-red-700 dark:bg-red-800/50 dark:text-red-300 font-semibold rounded-lg hover:bg-red-200 dark:hover:bg-red-700/50 hover:text-red-800 dark:hover:text-white transition-colors">
                                        <TrashIcon />
                                        Delete Prompt
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
