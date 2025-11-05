
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
const ChatGPTIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 41 41" fill="#74AA9C" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
        <path d="M35.2166 17.6918C35.2166 16.6349 35.1018 15.6015 34.8722 14.6022C34.5278 13.1491 33.7419 11.8317 32.6508 10.7406C31.5597 9.64952 30.2423 8.86367 28.7892 8.51927C27.7899 8.28971 26.7565 8.17493 25.6996 8.17493C23.9786 8.17493 22.3428 8.63103 20.9419 9.47233L20.4999 9.73145L20.058 9.47233C18.6571 8.63103 17.0213 8.17493 15.3003 8.17493C12.1931 8.17493 9.40113 9.64952 7.71223 12.0673C6.02334 14.4851 5.76422 17.6918 7.02758 20.4391C8.29094 23.1865 10.9918 24.9075 14.099 24.9075C15.2234 24.9075 16.3243 24.6484 17.3236 24.1627L18.1095 23.7793L17.9665 24.6484V24.6719C17.9665 25.9658 18.2256 27.2361 18.7113 28.4005L19.0322 29.1334L18.3523 29.5398C17.8962 29.8224 17.5 30.1581 17.1556 30.5415C16.2917 31.481 15.6823 32.5379 15.4232 33.6857L15.3003 34.2245H25.6996L25.4405 33.6857C25.1814 32.5379 24.572 31.481 23.7081 30.5415C23.3637 30.1581 22.9698 29.8224 22.5137 29.5398L21.8338 29.1334L22.1547 28.4005C22.6404 27.2361 22.8995 25.9658 22.8995 24.6719V24.6484L22.7565 23.7793L23.5424 24.1627C24.5417 24.6484 25.6426 24.9075 26.767 24.9075C29.8742 24.9075 32.5751 23.1865 33.8385 20.4391C35.1018 17.6918 34.8427 14.4851 33.1538 12.0673C32.178 10.6377 30.7771 9.53673 29.1413 8.88711C30.9398 10.2945 32.0546 12.3162 32.2501 14.6022C32.4992 15.6015 32.3844 16.6349 32.3844 17.6918C32.3844 19.0092 32.1253 20.2795 31.6396 21.4439C31.1539 22.6083 30.2899 23.5714 29.1413 24.1627C27.9926 24.754 26.6152 24.9545 25.3213 24.6719C23.9339 24.3658 22.7565 23.633 21.9706 22.5867C21.1847 21.5404 20.8402 20.2465 20.9832 18.9526L21.0536 18.2197L20.4999 17.9371L19.9463 18.2197C19.7967 18.9526 19.693 19.6855 19.693 20.4391C19.693 21.5635 19.9226 22.6644 20.3646 23.6531C20.8065 24.6418 21.5495 25.4277 22.489 25.9134C23.4285 26.3991 24.5294 26.5673 25.6094 26.3767C26.6893 26.1861 27.6886 25.6473 28.4511 24.8848C29.2136 24.1223 29.7289 23.1465 29.8971 22.0901C30.0653 21.0337 29.8747 19.9572 29.349 18.9941C28.8232 18.031 28.0069 17.2451 27.0211 16.7594C26.0353 16.2737 24.9343 16.1055 23.8544 16.2961L20.4999 16.8584L17.1455 16.2961C14.8595 15.9017 12.8378 16.8117 11.5204 18.5327C10.203 20.2536 9.71729 22.4558 10.2431 24.558C10.7688 26.6601 12.2434 28.4005 14.099 29.1334C14.099 28.009 13.8398 26.9081 13.3541 25.9134C12.8684 24.9187 12.1254 24.1328 11.1859 23.6471C10.2464 23.1614 9.14545 22.9932 8.06552 23.1838C7.0192 23.3744 6.04336 23.8991 5.2809 24.6616C4.51843 25.4241 4.00311 26.4234 3.83494 27.4798C3.66678 28.5362 3.85739 29.6361 4.38317 30.5992C4.90895 31.5623 5.72522 32.3482 6.71101 32.8339C7.6968 33.3196 8.79776 33.4878 9.87769 33.2972L12.7226 32.8016L12.2665 30.1581L11.5235 25.4277L11.8444 24.8848C12.4538 23.8486 13.2163 23.016 14.099 22.4558C14.099 21.3314 13.8398 20.2305 13.3541 19.2361C12.8684 18.2417 12.1254 17.4558 11.1859 16.9701C10.2464 16.4844 9.14545 16.3162 8.06552 16.5068C6.98559 16.6974 5.98628 17.2468 5.22382 18.0093C4.46135 18.7718 3.94603 19.7711 3.77787 20.8275C3.60971 21.8839 3.80032 22.9838 4.32609 23.9469C4.85187 24.91 5.66815 25.6959 6.65394 26.1816C7.63973 26.6673 8.74069 26.8355 9.82062 26.6449L12.8378 26.0826L13.5042 29.5398L10.4076 30.0786C8.55203 30.3847 6.78165 29.9521 5.2809 28.8405C3.78014 27.729 2.6557 26.008 2.12993 24.0805C1.60416 22.153 1.70788 20.1207 2.4042 18.2887C3.10051 16.4568 4.35416 14.9397 5.98993 13.951C7.62571 12.9623 9.5532 12.5679 11.4572 12.8339C13.3612 13.0999 15.1316 14.01 16.519 15.421C17.9064 16.8319 18.8402 18.6738 19.1611 20.6248L19.255 21.1636L20.4999 20.5723L21.7449 21.1636L21.8388 20.6248C22.1597 18.6738 23.0935 16.8319 24.4809 15.421C25.8683 14.01 27.6387 13.0999 29.5427 12.8339C31.4467 12.5679 33.3742 12.9623 35.01 13.951C35.1039 14.0041 35.1861 14.068 35.2565 14.1425V14.2364C35.2166 14.2895 35.2166 14.3541 35.2166 14.4287V17.6918Z" />
    </svg>
);
const ClaudeIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
        <path d="M72.5 25C72.5 18.0964 66.9036 12.5 60 12.5C53.0964 12.5 47.5 18.0964 47.5 25V75C47.5 81.9036 53.0964 87.5 60 87.5C66.9036 87.5 72.5 81.9036 72.5 75" stroke="#D97A53" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
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
        } else {
            navigator.clipboard.writeText(promptText).then(() => {
                setCopyNotification(`Prompt copied! Opening ${model}...`);
                setTimeout(() => setCopyNotification(null), 3000);
                
                let url = '';
                if (model === 'ChatGPT') {
                    url = 'https://chat.openai.com/';
                } else if (model === 'Claude') {
                    url = 'https://claude.ai/chats';
                }
                window.open(url, '_blank', 'noopener,noreferrer');
            });
        }
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
                                            Icon={ChatGPTIcon}
                                            label="ChatGPT"
                                            tooltip="Great all-rounder for a variety of tasks. (Copies prompt)"
                                            onClick={() => handleLaunch('ChatGPT')}
                                        />
                                    )}
                                    {compatibleModels.includes('Claude') && (
                                        <LLMButton
                                            Icon={ClaudeIcon}
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
