
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { generateImage } from './services/geminiService';
import { Tabs } from './components/Tabs';
import { CollectionView } from './components/CollectionView';
import { Prompt, PromptType, UserContext, LibraryPrompt, HistoryItem, User, PromptTechnique, CommunityPrompt } from './prompts/collection';
import { SavePromptModal } from './components/SavePromptModal';
import { PromptDetailModal } from './components/PromptDetailModal';
import { PromptBuilderView } from './components/StudioView';
import { HistoryModal } from './components/HistoryModal';
import { CommunityView } from './components/CommunityView';
import { OptimizerView } from './components/OptimizerView';
import { SaveContextModal } from './components/SaveContextModal';
import { AnalyticsDashboardView } from './components/AnalyticsDashboardView';
import { MatrixView } from './components/MatrixView';
import { AIGalaxyView } from './components/AIGalaxyView';

type View = 'builder' | 'collection' | 'community' | 'projects' | 'workflows' | 'optimizer' | 'analytics' | 'matrix' | 'galaxy';
type CollectionFilter = 'all' | 'favorites';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>('collection');
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>('all');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [communityPrompts, setCommunityPrompts] = useState<CommunityPrompt[]>([]);

  const [savingPrompt, setSavingPrompt] = useState<{prompt: string, title?: string} | null>(null);
  const [viewingPrompt, setViewingPrompt] = useState<Prompt | LibraryPrompt | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isSaveContextModalOpen, setIsSaveContextModalOpen] = useState<boolean>(false);
  const [selectedPromptIds, setSelectedPromptIds] = useState<Set<string>>(new Set());

  const [userCollection, setUserCollection] = useState<Prompt[]>(() => {
    try { const saved = localStorage.getItem('userCollection'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });

  const [userCategories, setUserCategories] = useState<string[]>(() => {
    try { const saved = localStorage.getItem('userCategories'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });

  const [promptHistory, setPromptHistory] = useState<HistoryItem[]>(() => {
    try { const saved = localStorage.getItem('promptHistory'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });

  const [userContexts, setUserContexts] = useState<UserContext[]>(() => {
    try { const saved = localStorage.getItem('userContexts'); return saved ? JSON.parse(saved) : []; } catch(e) { return []; }
  });

  useEffect(() => {
    const mockUser: User = { id: 'user-rakib', name: 'Rakib', subscriptionTier: 'premium', points: 999, likedPromptIds: [] };
    setCurrentUser(mockUser);
    localStorage.setItem('userCollection', JSON.stringify(userCollection));
    localStorage.setItem('userCategories', JSON.stringify(userCategories));
    localStorage.setItem('promptHistory', JSON.stringify(promptHistory));
    localStorage.setItem('userContexts', JSON.stringify(userContexts));
  }, [userCollection, userCategories, promptHistory, userContexts]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(p => p === 'light' ? 'dark' : 'light'), []);

  const addToHistory = useCallback((prompt: string) => {
    if (!prompt) return;
    setPromptHistory(prev => [{ id: `hist-${Date.now()}`, prompt, timestamp: Date.now() }, ...prev.filter(p => p.prompt !== prompt)].slice(0, 50));
  }, []);

  const handleGenerateImage = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;
    setIsGeneratingImage(true);
    setImageError(null);
    try {
      const imageUrl = await generateImage(prompt);
      setGeneratedImage(imageUrl);
      addToHistory(prompt);
    } catch (e) {
      setImageError('Neural Engine Busy. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  }, [addToHistory]);

  const handleSaveNewPrompt = (title: string, category: string, type: PromptType, technique: PromptTechnique, imageUrl?: string) => {
    if (!savingPrompt) return;
    const newPrompt: Prompt = { id: `p-${Date.now()}`, versionGroupId: `vg-${Date.now()}`, createdAt: Date.now(), title, prompt: savingPrompt.prompt, isFavorite: false, category, type, technique, imageUrl, isShared: false };
    setUserCollection(prev => [newPrompt, ...prev]);
    if (category && !userCategories.includes(category)) setUserCategories(p => [...p, category]);
    setSavingPrompt(null);
  };

  const handleToggleFavorite = (id: string) => setUserCollection(prev => prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));

  const renderView = () => {
    switch(activeView) {
      case 'optimizer': return <OptimizerView userContexts={userContexts} onSaveNewContext={() => setIsSaveContextModalOpen(true)} onDeleteContext={(id) => setUserContexts(p => p.filter(c => c.id !== id))} onSavePrompt={(p) => setSavingPrompt({prompt: p})} addToHistory={addToHistory} />;
      case 'builder': return <PromptBuilderView onGenerateImage={handleGenerateImage} isGenerating={isGeneratingImage} generatedImage={generatedImage} error={imageError} onSavePrompt={(p) => setSavingPrompt({prompt: p})} />;
      case 'matrix': return <MatrixView />;
      case 'galaxy': return <AIGalaxyView />;
      case 'community': return <CommunityView communityPrompts={communityPrompts} currentUser={currentUser} onLike={() => {}} onFork={() => {}} />;
      case 'analytics': return <AnalyticsDashboardView communityPrompts={communityPrompts} currentUser={currentUser} />;
      default: return <CollectionView userCollection={userCollection} onViewPrompt={setViewingPrompt} onToggleFavorite={handleToggleFavorite} onForkPrompt={() => {}} collectionFilter={collectionFilter} selectedIds={selectedPromptIds} onToggleSelect={(id) => setSelectedPromptIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; })} onClearSelection={() => setSelectedPromptIds(new Set())} onBulkDelete={() => {}} onBulkToggleFavorite={() => {}} onBulkAddToProject={() => {}} />;
    }
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-500 overflow-x-hidden">
      {/* Decorative Blobs */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-10 relative z-10">
        <Header theme={theme} toggleTheme={toggleTheme} onShowHistory={() => setIsHistoryModalOpen(true)} onShowCollection={() => {setActiveView('collection'); setCollectionFilter('all');}} onShowFavorites={() => { setActiveView('collection'); setCollectionFilter('favorites'); }} currentUser={currentUser} onShowAnalytics={() => setActiveView('analytics')} />
        
        <div className="flex justify-center sticky top-8 z-50">
          <Tabs activeView={activeView} setActiveView={setActiveView} />
        </div>

        <main className="glass-card rounded-[2.5rem] shadow-premium p-8 md:p-12 min-h-[750px] animate-fade-in">
          {renderView()}
        </main>

        <footer className="flex flex-col items-center gap-4 opacity-40 pb-12">
          <div className="h-px w-24 bg-slate-300 dark:bg-slate-700"></div>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Proprietary Matrix Architecture v5.0</p>
        </footer>
      </div>

      {savingPrompt && <SavePromptModal promptText={savingPrompt.prompt} categories={userCategories} onSave={handleSaveNewPrompt} onCancel={() => setSavingPrompt(null)} />}
      {isHistoryModalOpen && <HistoryModal isOpen={true} history={promptHistory} onClose={() => setIsHistoryModalOpen(false)} onUse={(p) => { addToHistory(p); setIsHistoryModalOpen(false); }} onDelete={() => {}} onClearAll={() => setPromptHistory([])} />}
      {viewingPrompt && <PromptDetailModal prompt={viewingPrompt} userCollection={userCollection} onClose={() => setViewingPrompt(null)} onSave={(p) => setSavingPrompt(p)} onUse={() => {}} currentUser={currentUser} />}
      {isSaveContextModalOpen && <SaveContextModal onSave={(t, c) => { setUserContexts(p => [...p, {id: Date.now().toString(), title: t, content: c}]); setIsSaveContextModalOpen(false); }} onCancel={() => setIsSaveContextModalOpen(false)} />}
    </div>
  );
};

export default App;
