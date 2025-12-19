
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

// Colorful Icons
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const TrendingIcon = ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${active ? 'text-white' : 'text-orange-500'}`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 012.345-2.509c.138.008.273.01.407.008l.013-.001c.214 0 .432-.014.656-.04.912-.103 1.954-.367 2.846-.867.433-.242.825-.572 1.127-.97.299-.395.467-.864.467-1.357 0-.312-.052-.613-.146-.893a.996.996 0 00-.503-.586l-.001-.001zM11.077 15c0 .324-.034.64-.099.945a5.5 5.5 0 01-10.37-2.31c0-1.008.27-1.945.742-2.748.24-.407.514-.78.812-1.114a1 1 0 011.666 1.1c-.135.203-.25.424-.34.654a3.501 3.501 0 006.66 2.03c.621.144 1.054.49 1.258.918.067.14.116.3.146.467l.001.001c.018.114.026.23.026.348z" clipRule="evenodd" />
    </svg>
);

const NewestIcon = ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${active ? 'text-white' : 'text-emerald-500'}`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
    </svg>
);

const AZIcon = ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${active ? 'text-white' : 'text-sky-500'}`} viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
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

    const items = [...prompts];
    if (librarySort === 'az') {
        items.sort((a, b) => a.title.localeCompare(b.title));
    } else if (librarySort === 'newest') {
        items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } else if (librarySort === 'trending') {
        items.sort((a, b) => {
            const scoreA = (a.views || 0) + (a.shares || 0) * 10;
            const scoreB = (b.views || 0) + (b.shares || 0) * 10;
            return scoreB - scoreA;
        });
    }
    return items;
  }, [searchQuery, llmFilter, techniqueFilter, categoryFilter, libraryTypeFilter, librarySort]);

  const filteredUserCollection = useMemo(() => {
    let prompts = (collectionFilter === 'all' ? latestUserPrompts : userCollection.filter(p => p.isFavorite));
    prompts = prompts.filter(p => {
        if (userCollectionTypeFilter !== 'all' && p.type !== userCollectionTypeFilter) return false;
        if (!checkSearchMatch(p, searchQuery)) return false;
        return true;
    });

    const items = [...prompts];
    if (userSort === 'az') {
        items.sort((a, b) => a.title.localeCompare(b.title));
    } else {
        items.sort((a, b) => b.createdAt - a.createdAt);
    }
    return items;
  }, [latestUserPrompts, userCollection, searchQuery, collectionFilter, userCollectionTypeFilter, userSort]);

  const SortButton: React.FC<{ label: string; value: SortOption; active: SortOption; onClick: (v: SortOption) => void; icon: React.ReactNode }> = ({ label, value, active, onClick, icon }) => (
    <button
      onClick={() => onClick(value)}
      className={`flex items-center gap-2 px-4 py-2 text-[11px] font-bold rounded-full transition-all duration-300 border-2 ${active === value ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105' : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700 hover:border-indigo-400 hover:text-indigo-600'}`}
    >
      {icon}
      <span>{label}</span>
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
                  placeholder="Search prompts by title or keywords..."
                  className="w-full bg-white dark:bg-gray-950 border-2 border-gray-100 dark:border-gray-800 rounded-2xl pl-10 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm font-medium"
              />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <FilterDropdown label="Type Filter" options={PROMPT_TYPE_OPTIONS} selectedValue={libraryTypeFilter} onValueChange={setLibraryTypeFilter} />
              <MultiSelectDropdown label="AI Architecture" options={availableLlmModels} selectedValues={llmFilter} onValueChange={setLlmFilter as (v: string[]) => void} />
              <MultiSelectDropdown label="Techniques" options={PROMPT_TECHNIQUES} selectedValues={techniqueFilter} onValueChange={setTechniqueFilter as (v: string[]) => void} />
              <MultiSelectDropdown label="Industry Categories" options={LIBRARY_CATEGORIES} selectedValues={categoryFilter} onValueChange={setCategoryFilter} />
          </div>
        </div>
      )}
      
      <div className="space-y-12">
        {collectionFilter === 'all' && (
          <section className="space-y-6">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Prompt Library</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Global Community Templates</p>
                </div>
                <div className="flex items-center gap-2 p-1.5 bg-gray-50 dark:bg-gray-900 rounded-full border border-gray-100 dark:border-gray-800">
                    <SortButton label="Trending" value="trending" active={librarySort} onClick={setLibrarySort} icon={<TrendingIcon active={librarySort === 'trending'} />} />
                    <SortButton label="Newest" value="newest" active={librarySort} onClick={setLibrarySort} icon={<NewestIcon active={librarySort === 'newest'} />} />
                    <SortButton label="A-Z" value="az" active={librarySort} onClick={setLibrarySort} icon={<AZIcon active={librarySort === 'az'} />} />
                </div>
            </div>
            
            {filteredLibraryPrompts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredLibraryPrompts.map(prompt => (
                        <PromptCard 
                          key={prompt.id} 
                          prompt={prompt} 
                          onView={() => onViewPrompt(prompt)}
                          searchQuery={searchQuery}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-gray-50 dark:bg-gray-900/30 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No templates matched your query</p>
                </div>
            )}
          </section>
        )}

        <section className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
                        {collectionFilter === 'favorites' ? 'Favorite Library' : 'My Personal Vault'}
                    </h2>
                    <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-1">Secure Private Collection</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setSelectMode(!selectMode)} className={`px-4 py-2 text-[11px] font-bold rounded-full border-2 transition-all ${selectMode ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700 hover:border-indigo-400'}`}>
                        {selectMode ? 'Exit Selection' : 'Batch Manage'}
                    </button>
                    <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
                    <SortButton label="Recent" value="newest" active={userSort} onClick={setUserSort} icon={<NewestIcon active={userSort === 'newest'} />} />
                    <SortButton label="A-Z" value="az" active={userSort} onClick={setUserSort} icon={<AZIcon active={userSort === 'az'} />} />
                </div>
            </div>
            
            {filteredUserCollection.length === 0 ? (
                <div className="text-center py-24 bg-gray-50 dark:bg-gray-900/30 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Your vault is empty</p>
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
                                        className="w-5 h-5 rounded-lg border-2 border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                                    />
                                </div>
                            )}
                            <PromptCard 
                                prompt={prompt} 
                                onView={() => onViewPrompt(prompt)} 
                                searchQuery={searchQuery}
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
