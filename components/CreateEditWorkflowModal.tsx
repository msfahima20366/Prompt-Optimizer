import React, { useState, useEffect } from 'react';
import { Workflow } from '../prompts/collection';

interface CreateEditWorkflowModalProps {
  isOpen: boolean;
  workflow?: Workflow;
  onSave: (title: string, description: string) => void;
  onCancel: () => void;
}

export const CreateEditWorkflowModal: React.FC<CreateEditWorkflowModalProps> = ({ isOpen, workflow, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (workflow) {
      setTitle(workflow.title);
      setDescription(workflow.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [workflow]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim(), description.trim());
    }
  };

  const isEditing = !!workflow;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-fuchsia-500/30 rounded-2xl shadow-2xl p-6 w-full max-w-lg space-y-4 animate-fade-in">
        <h2 className="text-2xl font-bold gradient-text">{isEditing ? 'Edit Workflow' : 'Create New Workflow'}</h2>
        
        <div>
          <label htmlFor="workflow-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Workflow Title
          </label>
          <input
            id="workflow-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Blog Post Generation"
            className="w-full bg-gray-50 dark:bg-gray-800/80 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="workflow-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description (Optional)
          </label>
          <textarea
            id="workflow-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief description of what this workflow does."
            className="w-full bg-gray-50 dark:bg-gray-800/80 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="flex justify-end space-x-4 pt-2">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-base font-bold rounded-md text-gray-800 bg-gray-200 hover:bg-gray-300 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-6 py-2 text-base font-bold rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? 'Save Changes' : 'Create Workflow'}
          </button>
        </div>
      </div>
    </div>
  );
};