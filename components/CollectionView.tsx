
import React, { useState, useMemo, useEffect } from 'react';
import { LibraryPrompt, LLMModel, PromptTechnique, ALL_LLM_MODELS, TEXT_MODELS, IMAGE_MODELS, VIDEO_MODELS } from '../prompts/collection';
import { LIBRARY_PROMPTS, LIBRARY_CATEGORIES, PROMPT_TECHNIQUES } from '../prompts/library';
import { PromptCard } from './PromptCard';
import { FilterDropdown } from './FilterDropdown';
import { MultiSelectDropdown } from './MultiSelectDropdown';

interface CollectionViewProps {
  onViewPrompt: (prompt: LibraryPrompt) => void;
}

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

type SortOption = 'trending' | 'newest' | 'alphabetical';

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

const checkSearchMatch = (prompt: LibraryPrompt, query: string): boolean => {
    if (!query) return true;
    const lowerQuery = query.toLowerCase();
    return prompt.title.toLowerCase().includes(lowerQuery) || prompt.prompt.toLowerCase().includes(lowerQuery);
};

const PROMPT_TYPE_OPTIONS = ['All', 'Text-based Prompt', 'Image Generate Prompt', 'Video Generate Prompt'];
const ITEMS_PER_PAGE = 20;

export const CollectionView: React.FC<CollectionViewProps> = ({ onViewPrompt }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [llmFilter, setLlmFilter] = useState<LLMModel[]>([]);
  const [techniqueFilter, setTechniqueFilter] = useState<PromptTechnique[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [libraryTypeFilter, setLibraryTypeFilter] = useState<string>('All');
  const [librarySort, setLibrarySort] = useState<SortOption>('trending');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, llmFilter, techniqueFilter, categoryFilter, libraryTypeFilter, librarySort]);

  const availableLlmModels = useMemo(() => {
    if (libraryTypeFilter === 'Text-based Prompt') return TEXT_MODELS;
    if (libraryTypeFilter === 'Image Generate Prompt') return IMAGE_MODELS;
    if (libraryTypeFilter === 'Video Generate Prompt') return VIDEO_MODELS;
    return ALL_LLM_MODELS;
  }, [libraryTypeFilter]);

  const filteredLibraryPrompts = useMemo(() => {
    let prompts = LIBRARY_PROMPTS.filter(p => {
        if (llmFilter.length > 0 && !p.llmModels.some(m => llmFilter.includes(m))) return false;
        if (techniqueFilter.length > 0 && !techniqueFilter.includes(p.technique)) return false;
        if (categoryFilter.length > 0 && !categoryFilter.includes(p.category)) return false;
        if (libraryTypeFilter !== 'All') {
            if (libraryTypeFilter === 'Text-based Prompt' && p.type !== 'text') return false;
            if (libraryTypeFilter === 'Image Generate Prompt' && p.type !== 'image') return false;
            if (libraryTypeFilter === 'Video Generate Prompt' && p.type !== 'video') return false;
        }
        return checkSearchMatch(p, searchQuery);
    });

    return [...prompts].sort((a, b) => {
        if (librarySort === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
        if (librarySort === 'alphabetical') return a.title.localeCompare(b.title);
        return (b.views + b.shares) - (a.views + a.shares);
    });
  }, [searchQuery, llmFilter, techniqueFilter, categoryFilter, libraryTypeFilter, librarySort]);

  const paginatedPrompts = useMemo(() => {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      return filteredLibraryPrompts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLibraryPrompts, currentPage]);

  const totalPages = Math.ceil(filteredLibraryPrompts.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
          <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
              <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 100+ blueprints with keywords (e.g., startup, daraz, niche)..."
                  className="w-full bg-white dark:bg-gray-950 border-2 border-gray-100 dark:border-gray-800 rounded-2xl pl-10 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm font-medium"
              />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <FilterDropdown label="Type Filter" options={PROMPT_TYPE_OPTIONS} selectedValue={libraryTypeFilter} onValueChange={setLibraryTypeFilter} />
              <MultiSelectDropdown label="Architecture" options={availableLlmModels} selectedValues={llmFilter} onValueChange={setLlmFilter as any} />
              <MultiSelectDropdown label="Techniques" options={PROMPT_TECHNIQUES} selectedValues={techniqueFilter} onValueChange={setTechniqueFilter as any} />
              <MultiSelectDropdown label="Categories" options={LIBRARY_CATEGORIES} selectedValues={categoryFilter} onValueChange={setCategoryFilter} />
          </div>
      </div>

      <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-100 dark:border-gray-800 pb-4 gap-4">
              <div>
                  <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Prompt Collection</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Page {currentPage} of {totalPages || 1} • {filteredLibraryPrompts.length} Blueprints</p>
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-900/50 p-1.5 rounded-xl border border-gray-200 dark:border-gray-800 gap-1">
                  <button 
                    onClick={() => setLibrarySort('trending')} 
                    title="Trending"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${librarySort === 'trending' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <TrendingIcon active={librarySort === 'trending'} />
                    <span>Trending</span>
                  </button>
                  <button 
                    onClick={() => setLibrarySort('newest')} 
                    title="Newest"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${librarySort === 'newest' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <NewestIcon active={librarySort === 'newest'} />
                    <span>Newest</span>
                  </button>
                  <button 
                    onClick={() => setLibrarySort('alphabetical')} 
                    title="Alphabetical A-Z"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${librarySort === 'alphabetical' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <span className="text-xs font-black">A-Z</span>
                    <span>Sort</span>
                  </button>
              </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedPrompts.map((prompt) => (
                  <PromptCard key={prompt.id} prompt={prompt} onView={() => onViewPrompt(prompt)} searchQuery={searchQuery} />
              ))}
          </div>

          {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 pt-8">
                  <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-6 py-3 bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-gray-800 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-xl hover:border-indigo-500 hover:text-indigo-500 disabled:opacity-30 disabled:hover:border-gray-100 transition-all"
                      >
                          ← Previous
                      </button>
                      <div className="flex items-center gap-2">
                          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                              // Simple logic for showing a few page numbers
                              const pageNum = totalPages <= 5 ? i + 1 : (currentPage <= 3 ? i + 1 : (currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i));
                              return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${currentPage === pageNum ? 'bg-indigo-600 text-white shadow-lg scale-110' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100'}`}
                                >
                                    {pageNum}
                                </button>
                              )
                          })}
                      </div>
                      <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-6 py-3 bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-gray-800 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-xl hover:border-indigo-500 hover:text-indigo-500 disabled:opacity-30 disabled:hover:border-gray-100 transition-all"
                      >
                          Next →
                      </button>
                  </div>
              </div>
          )}
      </section>
    </div>
  );
};
