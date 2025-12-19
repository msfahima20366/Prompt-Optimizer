
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { generateImage } from './services/geminiService';
import { Tabs } from './components/Tabs';
import { CollectionView } from './components/CollectionView';
import { Prompt, PromptType, UserContext, LibraryPrompt, HistoryItem, Project, Workflow, User, CommunityPrompt, PromptTechnique, Team } from './prompts/collection';
import { SavePromptModal } from './components/SavePromptModal';
import { PromptDetailModal } from './components/PromptDetailModal';
import { PromptBuilderView } from './components/StudioView';
import { HistoryModal } from './components/HistoryModal';
import { CommunityView } from './components/CommunityView';
import { OptimizerView } from './components/OptimizerView';
import { SaveContextModal } from './components/SaveContextModal';
import { WorkspaceView } from './components/WorkspaceView';
import { AnalyticsDashboardView } from './components/AnalyticsDashboardView';
import { MatrixView } from './components/MatrixView';
import { AIGalaxyView } from './components/AIGalaxyView';

type View = 'builder' | 'collection' | 'community' | 'projects' | 'workflows' | 'optimizer' | 'workspace' | 'analytics' | 'matrix' | 'galaxy';
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
  const [allUsers, setAllUsers] = useState<User[]>([]); 
  const [communityPrompts, setCommunityPrompts] = useState<CommunityPrompt[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

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
      case 'workspace': return <WorkspaceView teams={teams} allUsers={allUsers} userCollection={userCollection} currentUser={currentUser} />;
      case 'community': return <CommunityView communityPrompts={communityPrompts} currentUser={currentUser} onLike={() => {}} onFork={() => {}} />;
      case 'analytics': return <AnalyticsDashboardView communityPrompts={communityPrompts} currentUser={currentUser} />;
      default: return <CollectionView userCollection={userCollection} onViewPrompt={setViewingPrompt} onToggleFavorite={handleToggleFavorite} onForkPrompt={() => {}} collectionFilter={collectionFilter} selectedIds={selectedPromptIds} onToggleSelect={(id) => setSelectedPromptIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; })} onClearSelection={() => setSelectedPromptIds(new Set())} onBulkDelete={() => {}} onBulkToggleFavorite={() => {}} onBulkAddToProject={() => {}} />;
    }
  };

  return (
    <div className="min-h-screen text-brand-navy dark:text-slate-100 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-10 py-8 space-y-12">
        <Header theme={theme} toggleTheme={toggleTheme} onShowHistory={() => setIsHistoryModalOpen(true)} onShowCollection={() => {setActiveView('collection'); setCollectionFilter('all');}} onShowFavorites={() => { setActiveView('collection'); setCollectionFilter('favorites'); }} currentUser={currentUser} onShowAnalytics={() => setActiveView('analytics')} />
        
        <div className="flex justify-center sticky top-8 z-50">
          <Tabs activeView={activeView} setActiveView={setActiveView} />
        </div>

        <main className="glass-card rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(180,83,9,0.15)] p-10 md:p-16 min-h-[750px] animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-amber/10 blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/5 blur-[100px] pointer-events-none"></div>
          <div className="relative z-10">{renderView()}</div>
        </main>

        <footer className="flex flex-col items-center gap-4 opacity-40 pb-16">
          <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-brand-amber to-transparent"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-brand-navy dark:text-slate-400">Engineered for Creative Precision</p>
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
