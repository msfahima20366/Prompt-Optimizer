
import React from 'react';
import { Prompt } from '../prompts/collection';
import { PromptCard } from './PromptCard';

interface UserVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCollection: Prompt[];
  onViewPrompt: (prompt: Prompt) => void;
  onToggleFavorite: (id: string) => void;
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);

export const UserVaultModal: React.FC<UserVaultModalProps> = ({ isOpen, onClose, userCollection, onViewPrompt }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-indigo-500/30 rounded-[2.5rem] shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-gray-800">
          <div>
              <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">My Personal Vault</h2>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.4em] mt-1">Encrypted Secure Storage</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <CloseIcon />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {userCollection.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                <div className="text-6xl">📦</div>
                <p className="text-xl font-bold uppercase tracking-widest">Vault is currently empty</p>
                <p className="text-sm max-w-xs">Start optimizing and saving prompts to build your private intelligence library.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCollection.map(prompt => (
                    <PromptCard 
                        key={prompt.id} 
                        prompt={prompt} 
                        onView={() => { onViewPrompt(prompt); onClose(); }} 
                    />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
