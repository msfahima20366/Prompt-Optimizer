
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Tabs } from './components/Tabs';
import { CollectionView } from './components/CollectionView';
import { Prompt, PromptType, UserContext, LibraryPrompt, HistoryItem, User, PromptTechnique } from './prompts/collection';
import { SavePromptModal } from './components/SavePromptModal';
import { PromptDetailModal } from './components/PromptDetailModal';
import { HistoryModal } from './components/HistoryModal';
import { OptimizerView } from './components/OptimizerView';
import { SaveContextModal } from './components/SaveContextModal';

type View = 'collection' | 'optimizer';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('optimizer');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [savingPrompt, setSavingPrompt] = useState<{prompt: string, title?: string} | null>(null);
  const [viewingPrompt, setViewingPrompt] = useState<Prompt | LibraryPrompt | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isSaveContextModalOpen, setIsSaveContextModalOpen] = useState<boolean>(false);

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

  const handleSaveNewPrompt = (title: string, category: string, type: PromptType, technique: PromptTechnique, imageUrl?: string) => {
    if (!savingPrompt) return;
    const newPrompt: Prompt = { id: `p-${Date.now()}`, versionGroupId: `vg-${Date.now()}`, createdAt: Date.now(), title, prompt: savingPrompt.prompt, isFavorite: false, category, type, technique, imageUrl, isShared: false };
    setUserCollection(prev => [newPrompt, ...prev]);
    if (category && !userCategories.includes(category)) setUserCategories(p => [...p, category]);
    setSavingPrompt(null);
  };

  const renderView = () => {
    switch(activeView) {
      case 'optimizer': 
        return <OptimizerView 
          userContexts={userContexts} 
          onSaveNewContext={() => setIsSaveContextModalOpen(true)} 
          onDeleteContext={(id) => setUserContexts(p => p.filter(c => c.id !== id))} 
          onSavePrompt={(p) => setSavingPrompt({prompt: p})} 
          addToHistory={addToHistory} 
        />;
      default: 
        return <CollectionView 
          userCollection={userCollection} 
          onViewPrompt={setViewingPrompt} 
          onToggleFavorite={(id) => setUserCollection(prev => prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))} 
          onForkPrompt={() => {}} 
          collectionFilter='all'
          selectedIds={new Set()}
          onToggleSelect={() => {}}
          onClearSelection={() => {}}
          onBulkDelete={() => {}}
          onBulkToggleFavorite={() => {}}
          onBulkAddToProject={() => {}}
        />;
    }
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-500 overflow-x-hidden bg-[#F8FAFC] dark:bg-[#020617]">
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-10 relative z-10">
        <Header 
          theme={theme} 
          toggleTheme={toggleTheme} 
          onShowHistory={() => setIsHistoryModalOpen(true)} 
          onShowCollection={() => setActiveView('collection')} 
          onShowFavorites={() => setActiveView('collection')} 
          currentUser={currentUser} 
          onShowAnalytics={() => {}} 
        />
        
        <div className="flex justify-center sticky top-8 z-50">
          <Tabs activeView={activeView} setActiveView={setActiveView} />
        </div>

        <main className="modern-card rounded-[2.5rem] p-8 md:p-12 min-h-[750px] animate-fade-in shadow-2xl border-white/10">
          {renderView()}
        </main>

        <footer className="flex flex-col items-center gap-4 opacity-40 pb-12">
          <div className="h-px w-24 bg-slate-300 dark:bg-slate-700"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">Proprietary Neural Lab Architecture v6.0</p>
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
