import React, { useState, useMemo, useEffect } from 'react';
import { Prompt, LibraryPrompt, LLMModel, PromptTechnique, PromptType, TEXT_MODELS, IMAGE_MODELS, VIDEO_MODELS, ALL_LLM_MODELS } from '../prompts/collection';
import { LIBRARY_PROMPTS, LIBRARY_CATEGORIES, PROMPT_TECHNIQUES } from '../prompts/library';
import { PromptCard } from './PromptCard';
import { FilterDropdown } from './FilterDropdown';
import { MultiSelectDropdown } from './MultiSelectDropdown';

interface CollectionViewProps {
  userCollection: Prompt[];
  onViewPrompt: (prompt: Prompt | LibraryPrompt) => void;
  onToggleFavorite: (promptId: string) => void;
  onForkPrompt: (prompt: LibraryPrompt) => void;
  collectionFilter: 'all' | 'favorites';
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
    const inTags = ('tags' in prompt && prompt.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) || false;
    return inTitle || inPrompt || inTags;
};

const PROMPT_TYPE_OPTIONS = ['All', 'Text-based Prompt', 'Image Generate Prompt', 'Video Generate Prompt'];


const TypeFilterButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => {
  const baseClasses = "flex-shrink-0 text-center px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const activeClasses = "bg-indigo-600 text-white shadow";
  const inactiveClasses = "bg-transparent text-gray-500 hover:bg-gray-300/50 dark:bg-transparent dark:text-gray-400 dark:hover:bg-gray-800/60";
  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {label}
    </button>
  );
};

type SortOption = 'trending' | 'newest' | 'az';

export const CollectionView: React.FC<CollectionViewProps> = ({ userCollection, onViewPrompt, onToggleFavorite, onForkPrompt, collectionFilter }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [llmFilter, setLlmFilter] = useState<LLMModel[]>([]);
  const [techniqueFilter, setTechniqueFilter] = useState<PromptTechnique[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [libraryTypeFilter, setLibraryTypeFilter] = useState<string>('All');
  const [userCollectionTypeFilter, setUserCollectionTypeFilter] = useState<'all' | PromptType>('all');
  const [sortOption, setSortOption] = useState<SortOption>('trending');

  const availableLlmModels = useMemo(() => {
    switch (libraryTypeFilter) {
        case 'Text-based Prompt':
            return TEXT_MODELS;
        case 'Image Generate Prompt':
            return IMAGE_MODELS;
        case 'Video Generate Prompt':
            return VIDEO_MODELS;
        case 'All':
        default:
            return ALL_LLM_MODELS;
    }
  }, [libraryTypeFilter]);

  useEffect(() => {
    // If an LLM filter is active but no longer in the available models, clear the filter
    if (llmFilter.length > 0 && !llmFilter.every(m => availableLlmModels.includes(m))) {
        setLlmFilter([]);
    }
  }, [llmFilter, availableLlmModels]);

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

    switch (sortOption) {
        case 'newest':
            return prompts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        case 'az':
            return prompts.sort((a, b) => a.title.localeCompare(b.title));
        case 'trending':
        default:
            return prompts.sort((a, b) => {
                const scoreA = (a.views || 0) + (a.shares || 0) * 5;
                const scoreB = (b.views || 0) + (b.shares || 0) * 5;
                return scoreB - scoreA;
            });
    }
  }, [searchQuery, llmFilter, techniqueFilter, categoryFilter, libraryTypeFilter, sortOption, collectionFilter]);

  const filteredUserCollection = useMemo(() => {
    let prompts = userCollection.filter(p => {
        if (collectionFilter === 'favorites' && !p.isFavorite) return false;
        if (userCollectionTypeFilter !== 'all' && p.type !== userCollectionTypeFilter) return false;
        if (techniqueFilter.length > 0 && p.technique && !techniqueFilter.includes(p.technique)) return false;
        if (!checkSearchMatch(p, searchQuery)) return false;
        return true;
    });

    // Simple A-Z sort for user collection
    return prompts.sort((a,b) => a.title.localeCompare(b.title));

  }, [userCollection, searchQuery, collectionFilter, userCollectionTypeFilter, techniqueFilter]);

  const resetFilters = () => {
      setSearchQuery('');
      setLlmFilter([]);
      setTechniqueFilter([]);
      setCategoryFilter([]);
      setLibraryTypeFilter('All');
  };

  const noPromptsFound = filteredLibraryPrompts.length === 0 && filteredUserCollection.length === 0;
  const showFilters = collectionFilter === 'all';
  const hasActiveFilters = searchQuery || llmFilter.length > 0 || techniqueFilter.length > 0 || categoryFilter.length > 0 || libraryTypeFilter !== 'All';

  const SortButton: React.FC<{ label: string; value: SortOption; icon: string; }> = ({ label, value, icon }) => (
    <button
      onClick={() => setSortOption(value)}
      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${sortOption === value ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="space-y-8">
      {showFilters && (
        <div className="space-y-4">
          <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon />
              </div>
              <input
                  type="text"
                  id="search-prompts"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search titles, prompts, and #tags..."
                  className="w-full bg-white dark:bg-gray-900/50 border-2 border-gray-300 dark:border-gray-700 rounded-lg shadow-inner pl-10 pr-4 py-3 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <FilterDropdown label="Type" options={PROMPT_TYPE_OPTIONS} selectedValue={libraryTypeFilter} onValueChange={setLibraryTypeFilter} />
              <MultiSelectDropdown label="LLM Model" options={availableLlmModels} selectedValues={llmFilter} onValueChange={setLlmFilter as (val: string[]) => void} />
              <MultiSelectDropdown label="Technique" options={PROMPT_TECHNIQUES} selectedValues={techniqueFilter} onValueChange={setTechniqueFilter as (val: string[]) => void} />
              <MultiSelectDropdown label="Category" options={LIBRARY_CATEGORIES} selectedValues={categoryFilter} onValueChange={setCategoryFilter} />
          </div>
           {hasActiveFilters && (
              <button onClick={resetFilters} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                Reset All Filters
              </button>
            )}
        </div>
      )}
      
      <div className="space-y-8">
        {noPromptsFound && (
            <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg">No prompts found.</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">Try adjusting your search or filters.</p>
            </div>
        )}
        
        {showFilters && filteredLibraryPrompts.length > 0 && (
          <section>
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold gradient-text pb-2 border-b-2 border-purple-600/20 dark:border-purple-500/20">Prompt Library</h2>
                <div className="flex items-center gap-2">
                    <SortButton label="Trending" value="trending" icon="🔥"/>
                    <SortButton label="Newest" value="newest" icon="✨"/>
                    <SortButton label="A-Z" value="az" icon="🔠"/>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredLibraryPrompts.map(prompt => (
                <PromptCard key={prompt.id} prompt={prompt} onView={() => onViewPrompt(prompt)} onForkPrompt={() => onForkPrompt(prompt)} searchQuery={searchQuery} />
              ))}
            </div>
          </section>
        )}

        {filteredUserCollection.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold gradient-text pb-2">
                    {collectionFilter === 'favorites' ? 'My Favorites' : 'My Collection'}
                </h2>
                <div className="flex items-center gap-1 p-1 bg-gray-200/60 dark:bg-gray-900/50 rounded-xl border border-gray-300 dark:border-gray-700/80">
                    {(['all', 'image', 'text', 'video'] as const).map(type => (
                        <TypeFilterButton 
                            key={type}
                            label={type.charAt(0).toUpperCase() + type.slice(1)}
                            isActive={userCollectionTypeFilter === type}
                            onClick={() => setUserCollectionTypeFilter(type)}
                        />
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredUserCollection.map(prompt => (
                <PromptCard key={prompt.id} prompt={prompt} onView={() => onViewPrompt(prompt)} onToggleFavorite={() => onToggleFavorite(prompt.id)} searchQuery={searchQuery} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
