import React, { useState } from 'react';
import { PromptType, PromptTechnique } from '../prompts/collection';
import { PROMPT_TECHNIQUES } from '../prompts/library';

interface SavePromptModalProps {
  promptText: string;
  initialTitle?: string;
  categories: string[];
  onSave: (title: string, category: string, type: PromptType, technique: PromptTechnique, imageUrl?: string) => void;
  onCancel: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};


export const SavePromptModal: React.FC<SavePromptModalProps> = ({ promptText, initialTitle = '', categories, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialTitle || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('');
  const [promptType, setPromptType] = useState<PromptType>('text');
  const [technique, setTechnique] = useState<PromptTechnique>('Zero-shot');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setImageUrl(base64);
    }
  };

  const handleSave = () => {
    const finalCategory = newCategory.trim() || selectedCategory;
    if (title.trim()) {
      onSave(title.trim(), finalCategory, promptType, technique, imageUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-fuchsia-500/30 rounded-2xl shadow-2xl p-6 w-full max-w-lg space-y-4 animate-fade-in max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold gradient-text">Save to Collection</h2>
        
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
            {imageUrl && <img src={imageUrl} alt="Prompt preview" className="w-full h-full object-cover rounded-lg" />}
          </div>
          <div className="flex-1">
            <label htmlFor="save-image-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Image (Optional)
            </label>
            <input
              id="save-image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 dark:file:bg-indigo-600 dark:file:text-white hover:file:bg-indigo-200 dark:hover:file:bg-indigo-500"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="save-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Prompt Title
          </label>
          <input
            id="save-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., My Awesome Prompt"
            className="w-full bg-gray-50 dark:bg-gray-800/80 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            autoFocus
          />
        </div>

        <div>
            <label htmlFor="prompt-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prompt Type</label>
            <div className="flex space-x-2 rounded-lg bg-gray-100 dark:bg-gray-800/80 p-1 border-2 border-gray-300 dark:border-gray-700">
                {(['image', 'text', 'video'] as PromptType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => setPromptType(type)}
                        className={`w-full capitalize rounded-md px-3 py-1.5 text-sm font-bold transition-all ${promptType === type ? 'bg-gradient-to-r from-indigo-600 to-purple-500 text-white shadow' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </div>

        <div>
          <label htmlFor="technique-select-save" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Prompting Technique
          </label>
          <select
            id="technique-select-save"
            value={technique}
            onChange={(e) => setTechnique(e.target.value as PromptTechnique)}
            className="w-full bg-gray-50 dark:bg-gray-800/80 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
            {PROMPT_TECHNIQUES.map(tech => <option key={tech} value={tech}>{tech}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category (Optional)
          </label>
          <div className="flex gap-2">
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                if (e.target.value !== 'new') setNewCategory('');
              }}
              className="w-full bg-gray-50 dark:bg-gray-800/80 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="">Uncategorized</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              <option value="new">-- Create New Category --</option>
            </select>
          </div>
          {selectedCategory === 'new' && (
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
              className="mt-2 w-full bg-gray-50 dark:bg-gray-800/80 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          )}
        </div>

        <div>
          <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prompt</p>
          <div className="w-full max-h-40 overflow-y-auto bg-gray-100 dark:bg-gray-800/50 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
            {promptText}
          </div>
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
            disabled={!title.trim()}
            className="px-6 py-2 text-base font-bold rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Prompt
          </button>
        </div>
      </div>
    </div>
  );
};