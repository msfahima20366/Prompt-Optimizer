import React, { useState, useEffect } from 'react';
import { HistoryItem } from '../prompts/collection';

// --- ICONS ---
const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);
const CopyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5z" /></svg>
);
const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
);
const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);
const UseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v1.995l1.523-.29a1 1 0 011.122.822l.464 2.318a1 1 0 01-.54 1.118l-1.983 1.044a1 1 0 01-.989-1.748l1.432-.753-.35-1.748-.98.196a1 1 0 01-1.122-.822V2a1 1 0 01.3-.754zM8.7 1.046A1 1 0 008 2v1.995l-1.523-.29a1 1 0 00-1.122.822l-.464 2.318a1 1 0 00.54 1.118l1.983 1.044a1 1 0 00.989-1.748l-1.432-.753.35-1.748.98.196a1 1 0 001.122-.822V2a1 1 0 00-.7-.954zM10 12a1 1 0 011 1v2.252a1 1 0 01-.193.57l-1.433 2.15a1 1 0 01-1.63.131L6.13 16.5a1 1 0 011.233-1.543l.87.58 1.02-1.53a1 1 0 01.193-.57V13a1 1 0 011-1z" clipRule="evenodd" /></svg>
);
// --- END ICONS ---

// --- TIME FORMATTING HELPER ---
const timeAgoFormatter = new Intl.RelativeTimeFormat('en', { style: 'short' });
const formatTimeAgo = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return timeAgoFormatter.format(-minutes, 'minute');
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return timeAgoFormatter.format(-hours, 'hour');
  const days = Math.floor(hours / 24);
  return timeAgoFormatter.format(-days, 'day');
};
// --- END TIME FORMATTING ---

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onUse: (prompt: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const HistoryItemRow: React.FC<{ item: HistoryItem; onUse: () => void; onDelete: () => void; }> = ({ item, onUse, onDelete }) => {
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (isCopied) {
            const timer = setTimeout(() => setIsCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isCopied]);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(item.prompt);
        setIsCopied(true);
    };
    
    const buttonClasses = "p-2 text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700/80 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white transition-colors";

    return (
        <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors">
            <div className="flex-1 min-w-0">
                <p className="text-gray-800 dark:text-gray-300 text-sm line-clamp-2">{item.prompt}</p>
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">{formatTimeAgo(item.timestamp)}</p>
            </div>
            <div className="flex items-center justify-end gap-2 flex-shrink-0">
                <button onClick={onUse} className={buttonClasses} title="Use in Generator"><UseIcon /></button>
                <button onClick={handleCopy} className={buttonClasses} title="Copy">{isCopied ? <CheckIcon /> : <CopyIcon />}</button>
                <button onClick={onDelete} className={`${buttonClasses} hover:bg-red-100 dark:hover:bg-red-500/50 hover:text-red-600 dark:hover:text-red-300`} title="Delete"><TrashIcon /></button>
            </div>
        </div>
    );
};

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onUse, onDelete, onClearAll }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-fuchsia-500/30 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700/50 flex-shrink-0">
          <h2 className="text-xl font-bold gradient-text">Prompt History</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <CloseIcon />
          </button>
        </header>

        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              <p>No history yet.</p>
              <p className="text-sm">Prompts you generate will appear here.</p>
            </div>
          ) : (
            history.map(item => (
              <HistoryItemRow 
                key={item.id}
                item={item}
                onUse={() => onUse(item.prompt)}
                onDelete={() => onDelete(item.id)}
              />
            ))
          )}
        </div>
        
        {history.length > 0 && (
            <footer className="p-4 border-t border-gray-200 dark:border-gray-700/50 flex-shrink-0">
                <button
                    onClick={onClearAll}
                    className="w-full px-4 py-2 text-sm font-bold text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-800/40 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/60 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                >
                    Clear All History
                </button>
            </footer>
        )}
      </div>
    </div>
  );
};