import React, { useState, useMemo } from 'react';
import { Prompt } from '../prompts/collection';

interface AddPromptsToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCollection: Prompt[];
  projectPromptIds: string[];
  onAddPrompts: (promptIds: string[]) => void;
}

export const AddPromptsToProjectModal: React.FC<AddPromptsToProjectModalProps> = ({ isOpen, onClose, userCollection, projectPromptIds, onAddPrompts }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const availablePrompts = useMemo(() => {
    return userCollection
      .filter(p => !projectPromptIds.includes(p.id))
      .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [userCollection, projectPromptIds, searchQuery]);

  const handleToggle = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleAdd = () => {
    onAddPrompts(Array.from(selectedIds));
    setSelectedIds(new Set());
    setSearchQuery('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-fuchsia-500/30 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700/50">
          <h2 className="text-xl font-bold gradient-text">Add Prompts to Project</h2>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your collection..."
            className="mt-2 w-full bg-gray-50 dark:bg-gray-800/80 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </header>

        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {availablePrompts.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
                <p>No other prompts available in your collection.</p>
            </div>
          ) : (
            availablePrompts.map(prompt => (
              <div key={prompt.id} className="flex items-center p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                <input
                  type="checkbox"
                  id={`prompt-select-${prompt.id}`}
                  checked={selectedIds.has(prompt.id)}
                  onChange={() => handleToggle(prompt.id)}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-700"
                />
                <label htmlFor={`prompt-select-${prompt.id}`} className="ml-3 text-sm text-gray-800 dark:text-gray-300 truncate cursor-pointer">
                  {prompt.title}
                </label>
              </div>
            ))
          )}
        </div>
        
        <footer className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700/50 flex justify-end items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">{selectedIds.size} selected</span>
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold rounded-md text-gray-800 bg-gray-200 hover:bg-gray-300 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={selectedIds.size === 0}
            className="px-4 py-2 text-sm font-bold rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-500 hover:opacity-90 disabled:opacity-50"
          >
            Add to Project
          </button>
        </footer>
      </div>
    </div>
  );
};