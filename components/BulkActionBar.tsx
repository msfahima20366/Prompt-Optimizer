import React from 'react';

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onAddToProject: () => void;
}

const ActionButton: React.FC<{ onClick: () => void, children: React.ReactNode, className?: string }> = ({ onClick, children, className = '' }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${className}`}
    >
        {children}
    </button>
);

export const BulkActionBar: React.FC<BulkActionBarProps> = ({ selectedCount, onClear, onDelete, onToggleFavorite, onAddToProject }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md z-40 animate-fade-in">
      <div className="flex items-center justify-between gap-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-3">
        <div className="flex-shrink-0">
            <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{selectedCount}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400"> selected</span>
        </div>
        <div className="flex items-center gap-2">
            <ActionButton onClick={onToggleFavorite} className="bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                Favorite
            </ActionButton>
            <ActionButton onClick={onAddToProject} className="bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                Add to Project
            </ActionButton>
            <ActionButton onClick={onDelete} className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">
                Delete
            </ActionButton>
        </div>
        <button
            onClick={onClear}
            className="text-2xl text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
            title="Clear selection"
        >
            &times;
        </button>
      </div>
    </div>
  );
};
