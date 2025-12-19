
import React, { useState, useMemo, useEffect } from 'react';
import { Prompt, LibraryPrompt, LLMModel, PromptTechnique, PromptType, TEXT_MODELS, IMAGE_MODELS, VIDEO_MODELS, ALL_LLM_MODELS } from '../prompts/collection';
import { LIBRARY_PROMPTS, LIBRARY_CATEGORIES, PROMPT_TECHNIQUES } from '../prompts/library';
import { PromptCard } from './PromptCard';
import { FilterDropdown } from './FilterDropdown';
import { MultiSelectDropdown } from './MultiSelectDropdown';
import { BulkActionBar } from './BulkActionBar';

interface CollectionViewProps {
  userCollection: Prompt[];
  onViewPrompt: (prompt: Prompt | LibraryPrompt) => void;
  onToggleFavorite: (promptId: string) => void;
  onForkPrompt: (prompt: LibraryPrompt) => void;
  collectionFilter: 'all' | 'favorites';
  selectedIds: Set<string>;
  onToggleSelect: (promptId: string) => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkToggleFavorite: () => void;
  onBulkAddToProject: () => void;
}

const SearchIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const checkSearchMatch = (prompt: Prompt | LibraryPrompt, query: string): boolean => {
    if (!query) return true;
    const lowerQuery = query.toLowerCase();
    const inTitle = prompt.title.toLowerCase().includes(lowerQuery);
    const inPrompt = prompt.prompt.toLowerCase().includes(lowerQuery);
    return inTitle || inPrompt;
};

const PROMPT_TYPE_OPTIONS = ['All', 'Text-based Prompt', 'Image Generate Prompt', 'Video Generate Prompt'];

type SortOption = 'trending' | 'newest' | 'az';

export const CollectionView: React.FC<CollectionViewProps> = ({ 
    userCollection, 
    onViewPrompt, 
    onToggleFavorite, 
    onForkPrompt, 
    collectionFilter,
    selectedIds,
    onToggleSelect,
    onClearSelection,
    onBulkDelete,
    onBulkToggleFavorite,
    onBulkAddToProject
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [llmFilter, setLlmFilter] = useState<LLMModel[]>([]);
  const [techniqueFilter, setTechniqueFilter] = useState<PromptTechnique[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [libraryTypeFilter, setLibraryTypeFilter] = useState<string>('All');
  const [userCollectionTypeFilter, setUserCollectionTypeFilter] = useState<'all' | PromptType>('all');
  const [librarySort, setLibrarySort] = useState<SortOption>('trending');
  const [userSort, setUserSort] = useState<SortOption>('newest');
  const [selectMode, setSelectMode] = useState(false);
  
  const latestUserPrompts = useMemo(() => {
    const grouped = userCollection.reduce((acc, p) => {
        const existing = acc.get(p.versionGroupId);
        if (!existing || p.createdAt > existing.createdAt) {
            acc.set(p.versionGroupId, p);
        }
        return acc;
    }, new Map<string, Prompt>());
    return Array.from(grouped.values());
  }, [userCollection]);

  useEffect(() => {
    if (!selectMode) onClearSelection();
  }, [selectMode, onClearSelection]);

  const availableLlmModels = useMemo(() => {
    switch (libraryTypeFilter) {
        case 'Text-based Prompt': return TEXT_MODELS;
        case 'Image Generate Prompt': return IMAGE_MODELS;
        case 'Video Generate Prompt': return VIDEO_MODELS;
        default: return ALL_LLM_MODELS;
    }
  }, [libraryTypeFilter]);

  // Logic for LIBRARY PROMPTS Sorting
  const filteredLibraryPrompts = useMemo(() => {
    let prompts = LIBRARY_PROMPTS.filter(p => {
        if (llmFilter.length > 0 && !p.llmModels.some(model => llmFilter.includes(model))) return false;
        if (techniqueFilter.length > 0 && !techniqueFilter.includes(p.technique)) return false;
        if (categoryFilter.length > 0 && !categoryFilter.includes(p.category)) return false;
        if (libraryTypeFilter !== 'All') {
            if (libraryTypeFilter === 'Text-based Prompt' && p.type !== 'text') return false;
            if (libraryTypeFilter === 'Image Generate Prompt' && p.type !== 'image') return false;
            if (libraryTypeFilter === 'Video Generate Prompt' && p.type !== 'video') return false;
        }
        if (!checkSearchMatch(p, searchQuery)) return false;
        return true;
    });

    // CRITICAL FIX: Use [...prompts] to create a new array before sorting to trigger React updates
    const sorted = [...prompts];
    switch (librarySort) {
        case 'newest':
            return sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        case 'az':
            return sorted.sort((a, b) => a.title.localeCompare(b.title));
        case 'trending':
        default:
            return sorted.sort((a, b) => {
                const scoreA = (a.views || 0) + (a.shares || 0) * 5;
                const scoreB = (b.views || 0) + (b.shares || 0) * 5;
                return scoreB - scoreA;
            });
    }
  }, [searchQuery, llmFilter, techniqueFilter, categoryFilter, libraryTypeFilter, librarySort]);

  // Logic for USER COLLECTION Sorting
  const filteredUserCollection = useMemo(() => {
    let prompts = (collectionFilter === 'all' ? latestUserPrompts : userCollection.filter(p => p.isFavorite));
    
    prompts = prompts.filter(p => {
        if (userCollectionTypeFilter !== 'all' && p.type !== userCollectionTypeFilter) return false;
        if (!checkSearchMatch(p, searchQuery)) return false;
        return true;
    });

    const sorted = [...prompts];
    switch (userSort) {
        case 'az': return sorted.sort((a, b) => a.title.localeCompare(b.title));
        case 'trending': return sorted.sort((a,b) => b.createdAt - a.createdAt); // Trending for user = recently active
        case 'newest':
        default: return sorted.sort((a,b) => b.createdAt - a.createdAt);
    }
  }, [latestUserPrompts, userCollection, searchQuery, collectionFilter, userCollectionTypeFilter, userSort]);

  const SortButton: React.FC<{ label: string; value: SortOption; active: SortOption; onClick: (v: SortOption) => void; }> = ({ label, value, active, onClick }) => (
    <button
      onClick={() => onClick(value)}
      className={`px-3 py-1.5 text-[10px] font-bold rounded-full transition-all border ${active === value ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-transparent hover:bg-gray-200'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-8">
      {collectionFilter === 'all' && (
        <div className="space-y-4">
          <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
              <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search prompts..."
                  className="w-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <FilterDropdown label="Type" options={PROMPT_TYPE_OPTIONS} selectedValue={libraryTypeFilter} onValueChange={setLibraryTypeFilter} />
              <MultiSelectDropdown label="Model" options={availableLlmModels} selectedValues={llmFilter} onValueChange={setLlmFilter as (v: string[]) => void} />
              <MultiSelectDropdown label="Technique" options={PROMPT_TECHNIQUES} selectedValues={techniqueFilter} onValueChange={setTechniqueFilter as (v: string[]) => void} />
              <MultiSelectDropdown label="Category" options={LIBRARY_CATEGORIES} selectedValues={categoryFilter} onValueChange={setCategoryFilter} />
          </div>
        </div>
      )}
      
      <div className="space-y-12">
        {collectionFilter === 'all' && filteredLibraryPrompts.length > 0 && (
          <section className="space-y-4">
             <div className="flex justify-between items-end border-b border-gray-100 dark:border-gray-800 pb-2">
                <div>
                    <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Prompt Library</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Public Templates</p>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <SortButton label="Trending" value="trending" active={librarySort} onClick={setLibrarySort} />
                    <SortButton label="Newest" value="newest" active={librarySort} onClick={setLibrarySort} />
                    <SortButton label="A-Z" value="az" active={librarySort} onClick={setLibrarySort} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredLibraryPrompts.map(prompt => (
                <PromptCard key={prompt.id} prompt={prompt} onView={() => onViewPrompt(prompt)} />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
            <div className="flex justify-between items-end border-b border-gray-100 dark:border-gray-800 pb-2">
                <div>
                    <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
                        {collectionFilter === 'favorites' ? 'My Favorites' : 'My Collection'}
                    </h2>
                    <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Your Private Vault</p>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <button onClick={() => setSelectMode(!selectMode)} className={`px-3 py-1.5 text-[10px] font-bold rounded-full border transition-all ${selectMode ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-transparent hover:bg-gray-200'}`}>
                        {selectMode ? 'Cancel Selection' : 'Select Multiple'}
                    </button>
                    <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
                    <SortButton label="Newest" value="newest" active={userSort} onClick={setUserSort} />
                    <SortButton label="A-Z" value="az" active={userSort} onClick={setUserSort} />
                </div>
            </div>
            
            {filteredUserCollection.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <p className="text-gray-400 font-medium">No saved prompts found here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredUserCollection.map(prompt => (
                        <div key={prompt.id} className="relative">
                            {selectMode && (
                                <div className="absolute top-4 left-4 z-20">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.has(prompt.id)} 
                                        onChange={() => onToggleSelect(prompt.id)}
                                        className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </div>
                            )}
                            <PromptCard 
                                prompt={prompt} 
                                onView={() => onViewPrompt(prompt)} 
                            />
                        </div>
                    ))}
                </div>
            )}
        </section>
      </div>
      
      <BulkActionBar 
        selectedCount={selectedIds.size}
        onClear={onClearSelection}
        onDelete={onBulkDelete}
        onToggleFavorite={onBulkToggleFavorite}
        onAddToProject={onBulkAddToProject}
      />
    </div>
  );
};
