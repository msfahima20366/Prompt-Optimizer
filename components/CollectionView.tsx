import React, { useState, useMemo } from 'react';
import { Prompt, LibraryPrompt, LLMModel, PromptTechnique, PromptType } from '../prompts/collection';
import { LIBRARY_PROMPTS, LIBRARY_CATEGORIES, PROMPT_TECHNIQUES } from '../prompts/library';
import { PromptCard } from './PromptCard';
import { FilterDropdown } from './FilterDropdown';

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

const LLM_MODELS: LLMModel[] = ['Gemini', 'ChatGPT', 'Claude'];
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

export const CollectionView: React.FC<CollectionViewProps> = ({ userCollection, onViewPrompt, onToggleFavorite, onForkPrompt, collectionFilter }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [llmFilter, setLlmFilter] = useState<LLMModel | 'All'>('All');
  const [techniqueFilter, setTechniqueFilter] = useState<PromptTechnique | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [libraryTypeFilter, setLibraryTypeFilter] = useState<string>('All');
  const [userCollectionTypeFilter, setUserCollectionTypeFilter] = useState<'all' | PromptType>('all');

  const filteredLibraryPrompts = useMemo(() => {
    if (collectionFilter === 'favorites') return []; // Don't show library when viewing favorites
    return LIBRARY_PROMPTS.filter(p => {
        if (llmFilter !== 'All' && !p.llmModels.includes(llmFilter)) return false;
        if (techniqueFilter !== 'All' && p.technique !== techniqueFilter) return false;
        if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
        if (libraryTypeFilter !== 'All') {
            if (libraryTypeFilter === 'Text-based Prompt' && p.type !== 'text') return false;
            if (libraryTypeFilter === 'Image Generate Prompt' && p.type !== 'image') return false;
            if (libraryTypeFilter === 'Video Generate Prompt' && p.type !== 'video') return false;
        }
        if (!checkSearchMatch(p, searchQuery)) return false;
        return true;
    });
  }, [searchQuery, llmFilter, techniqueFilter, categoryFilter, libraryTypeFilter, collectionFilter]);

  const filteredUserCollection = useMemo(() => {
    return userCollection.filter(p => {
        if (collectionFilter === 'favorites' && !p.isFavorite) return false;
        if (userCollectionTypeFilter !== 'all' && p.type !== userCollectionTypeFilter) return false;
        if (!checkSearchMatch(p, searchQuery)) return false;
        return true;
    });
  }, [userCollection, searchQuery, collectionFilter, userCollectionTypeFilter]);


  const noPromptsFound = filteredLibraryPrompts.length === 0 && filteredUserCollection.length === 0;
  const showFilters = collectionFilter === 'all';

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
              <FilterDropdown label="LLM Model" options={['All', ...LLM_MODELS]} selectedValue={llmFilter} onValueChange={setLlmFilter as (val: string) => void} />
              <FilterDropdown label="Technique" options={['All', ...PROMPT_TECHNIQUES]} selectedValue={techniqueFilter} onValueChange={setTechniqueFilter as (val: string) => void} />
              <FilterDropdown label="Category" options={['All', ...LIBRARY_CATEGORIES]} selectedValue={categoryFilter} onValueChange={setCategoryFilter} />
              <FilterDropdown label="Type" options={PROMPT_TYPE_OPTIONS} selectedValue={libraryTypeFilter} onValueChange={setLibraryTypeFilter} />
          </div>
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
             <h2 className="text-2xl font-bold gradient-text mb-4 pb-2 border-b-2 border-purple-600/20 dark:border-purple-500/20">Prompt Library</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredLibraryPrompts.map(prompt => (
                <PromptCard key={prompt.id} prompt={prompt} onView={() => onViewPrompt(prompt)} onForkPrompt={() => onForkPrompt(prompt)} />
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
                <PromptCard key={prompt.id} prompt={prompt} onView={() => onViewPrompt(prompt)} onToggleFavorite={() => onToggleFavorite(prompt.id)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};