import React, { useState } from 'react';
import { Prompt, PromptType } from '../prompts/collection';

interface EditPromptModalProps {
  prompt: Prompt;
  categories: string[];
  onSave: (updatedPrompt: Prompt) => void;
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

export const EditPromptModal: React.FC<EditPromptModalProps> = ({ prompt, categories, onSave, onCancel }) => {
  const [title, setTitle] = useState(prompt.title);
  const [promptText, setPromptText] = useState(prompt.prompt);
  const [selectedCategory, setSelectedCategory] = useState<string>(prompt.category || '');
  const [newCategory, setNewCategory] = useState<string>('');
  const [promptType, setPromptType] = useState<PromptType>(prompt.type || 'image');
  const [imageUrl, setImageUrl] = useState<string | undefined>(prompt.imageUrl);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setImageUrl(base64);
    }
  };

  const handleSave = () => {
    const finalCategory = newCategory.trim() || selectedCategory;
    onSave({
      ...prompt,
      title,
      prompt: promptText,
      category: finalCategory,
      type: promptType,
      imageUrl: imageUrl,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-fuchsia-500/30 rounded-2xl shadow-2xl p-6 w-full max-w-lg space-y-4 animate-fade-in max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold gradient-text">Edit Prompt</h2>
        
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
            {imageUrl && <img src={imageUrl} alt="Prompt preview" className="w-full h-full object-cover rounded-lg" />}
          </div>
          <div className="flex-1">
            <label htmlFor="edit-image-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prompt Image
            </label>
            <input
              id="edit-image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 dark:file:bg-indigo-600 dark:file:text-white hover:file:bg-indigo-200 dark:hover:file:bg-indigo-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title
          </label>
          <input
            id="edit-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800/80 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>

        <div>
            <label htmlFor="prompt-type-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prompt Type</label>
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
          <label htmlFor="category-select-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            id="category-select-edit"
            value={selectedCategory === 'new' ? 'new' : (categories.includes(selectedCategory) ? selectedCategory : '')}
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
          <label htmlFor="edit-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Prompt
          </label>
          <textarea
            id="edit-prompt"
            rows={6}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
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
            className="px-6 py-2 text-base font-bold rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-indigo-500"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};