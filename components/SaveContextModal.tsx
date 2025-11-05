import React, { useState } from 'react';

interface SaveContextModalProps {
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
}

export const SaveContextModal: React.FC<SaveContextModalProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSave = () => {
    if (title.trim() && content.trim()) {
      onSave(title.trim(), content.trim());
    }
  };

  const isSaveDisabled = !title.trim() || !content.trim();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-fuchsia-500/30 rounded-2xl shadow-2xl p-6 w-full max-w-lg space-y-4 animate-fade-in max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold gradient-text">Save New Context</h2>
        
        <div>
          <label htmlFor="context-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Context Title
          </label>
          <input
            id="context-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., My Company's Brand Voice"
            className="w-full bg-gray-50 dark:bg-gray-800/80 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="context-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Context Content
          </label>
          <textarea
            id="context-content"
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste or write the background information, data, or specific instructions for the AI here..."
            className="w-full bg-gray-50 dark:bg-gray-800/80 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex justify-end space-x-4 pt-2">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-base font-bold rounded-md text-gray-800 bg-gray-200 hover:bg-gray-300 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="px-6 py-2 text-base font-bold rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Context
          </button>
        </div>
      </div>
    </div>
  );
};