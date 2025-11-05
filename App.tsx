

import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { generateImage } from './services/geminiService';
import { Tabs } from './components/Tabs';
import { CollectionView } from './components/CollectionView';
import { Prompt, PromptType, UserContext, LibraryPrompt, HistoryItem, Project, Workflow, User, CommunityPrompt, PromptTechnique, Team, WorkflowStep } from './prompts/collection';
import { EditPromptModal } from './components/EditPromptModal';
import { SavePromptModal } from './components/SavePromptModal';
import { PromptDetailModal } from './components/PromptDetailModal';
import { PromptBuilderView } from './components/StudioView';
import { HistoryModal } from './components/HistoryModal';
import { ProjectsView } from './components/ProjectsView';
import { CreateEditProjectModal } from './components/CreateEditProjectModal';
import { AddPromptsToProjectModal } from './components/AddPromptsToProjectModal';
import { PromptCard } from './components/PromptCard';
import { WorkflowsView } from './components/WorkflowsView';
import { CreateEditWorkflowModal } from './components/CreateEditWorkflowModal';
import { RunWorkflowModal } from './components/RunWorkflowModal';
import { CommunityView } from './components/CommunityView';
import { OptimizerView } from './components/OptimizerView';
import { SaveContextModal } from './components/SaveContextModal';
import { WorkspaceView } from './components/WorkspaceView';
import { AnalyticsDashboardView } from './components/AnalyticsDashboardView';

type View = 'builder' | 'collection' | 'community' | 'projects' | 'workflows' | 'optimizer' | 'workspace' | 'analytics';
type CollectionFilter = 'all' | 'favorites';
type Theme = 'light' | 'dark';

// --- Point constants for gamification ---
const POINTS_FOR_LIKE = 1;
const POINTS_FOR_FORK = 5;

// --- Mock Data for New Features ---
const MOCK_TEAMS: Team[] = [
    {
        id: 'team-1',
        name: 'Marketing Wizards',
        ownerId: 'user-123',
        members: [
            { userId: 'user-123', name: 'Alex', role: 'Admin' },
            { userId: 'user-456', name: 'Jordan', role: 'Editor' },
        ],
        sharedPromptIds: ['user-1672531200001'],
        sharedProjectIds: [],
        sharedWorkflowIds: [],
    }
];

const App: React.FC = () => {
  // --- Image Generation State ---
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  
  const [activeView, setActiveView] = useState<View>('collection');
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>('all');
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return 'light';
  });

  // --- User and Community State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]); 
  const [communityPrompts, setCommunityPrompts] = useState<CommunityPrompt[]>([]);
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);

  // Modals and detail views state
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [savingPrompt, setSavingPrompt] = useState<{prompt: string, title?: string} | null>(null);
  const [viewingPrompt, setViewingPrompt] = useState<Prompt | LibraryPrompt | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<Project | {} | null>(null);
  const [isAddPromptsModalOpen, setAddPromptsModalOpen] = useState<boolean>(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState<Workflow | {} | null>(null);
  const [runningWorkflow, setRunningWorkflow] = useState<Workflow | null>(null);
  const [isSaveContextModalOpen, setIsSaveContextModalOpen] = useState<boolean>(false);

  // Project/Workflow specific state
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [viewingWorkflow, setViewingWorkflow] = useState<Workflow | null>(null);

  const [userCollection, setUserCollection] = useState<Prompt[]>(() => {
    try { const saved = localStorage.getItem('userCollection'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });

  const [userCategories, setUserCategories] = useState<string[]>(() => {
    try { const saved = localStorage.getItem('userCategories'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });

  const [promptHistory, setPromptHistory] = useState<HistoryItem[]>(() => {
    try { const saved = localStorage.getItem('promptHistory'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });
  
  const [projects, setProjects] = useState<Project[]>(() => {
    try { const saved = localStorage.getItem('userProjects'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });

  const [workflows, setWorkflows] = useState<Workflow[]>(() => {
    try { const saved = localStorage.getItem('userWorkflows'); return saved ? JSON.parse(saved) : []; } catch(e) { return []; }
  });

  const [userContexts, setUserContexts] = useState<UserContext[]>(() => {
    try { const saved = localStorage.getItem('userContexts'); return saved ? JSON.parse(saved) : []; } catch(e) { return []; }
  });


  useEffect(() => {
    const mockCurrentUser: User = { id: 'user-123', name: 'Alex', subscriptionTier: 'premium', points: 150, likedPromptIds: ['comm-2'], teamIds: ['team-1'] };
    const mockOtherUser: User = { id: 'user-456', name: 'Jordan', subscriptionTier: 'free', points: 25, likedPromptIds: [], teamIds: ['team-1'] };
    const savedUsers = localStorage.getItem('allUsers');
    setAllUsers(savedUsers ? JSON.parse(savedUsers) : [mockCurrentUser, mockOtherUser]);
    setCurrentUser(mockCurrentUser);
    const savedCommunity = localStorage.getItem('communityPrompts');
    setCommunityPrompts(savedCommunity ? JSON.parse(savedCommunity) : []);
  }, []);

  useEffect(() => { localStorage.setItem('allUsers', JSON.stringify(allUsers)); }, [allUsers]);
  useEffect(() => { localStorage.setItem('communityPrompts', JSON.stringify(communityPrompts)); }, [communityPrompts]);
  useEffect(() => {
    if (currentUser) {
      setAllUsers(prev => prev.map(u => u.id === currentUser.id ? currentUser : u));
    }
  }, [currentUser]);

  useEffect(() => { localStorage.setItem('userCollection', JSON.stringify(userCollection)); }, [userCollection]);
  useEffect(() => { localStorage.setItem('userCategories', JSON.stringify(userCategories)); }, [userCategories]);
  useEffect(() => { localStorage.setItem('promptHistory', JSON.stringify(promptHistory)); }, [promptHistory]);
  useEffect(() => { localStorage.setItem('userProjects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('userWorkflows', JSON.stringify(workflows)); }, [workflows]);
  useEffect(() => { localStorage.setItem('userContexts', JSON.stringify(userContexts)); }, [userContexts]);


  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      body.style.backgroundColor = '#111827';
      body.style.backgroundImage = 'none';
    } else {
      root.classList.remove('dark');
      body.style.backgroundColor = '#f9fafb';
      body.style.backgroundImage = 'none';
    }
  }, [theme]);


  const addToHistory = useCallback((prompt: string) => {
    if (!prompt) return;
    setPromptHistory(prev => {
      const newHistoryItem: HistoryItem = { id: `hist-${Date.now()}`, prompt, timestamp: Date.now() };
      const filteredPrev = prev.filter(p => p.prompt !== prompt);
      const updatedHistory = [newHistoryItem, ...filteredPrev];
      return updatedHistory.slice(0, 100);
    });
  }, []);

  const handleGenerateImage = useCallback(async (prompt: string) => {
    if (!prompt.trim()) {
      setImageError('Please create a prompt before generating.');
      return;
    }
    setIsGeneratingImage(true);
    setImageError(null);
    setGeneratedImage(null);
    try {
      const imageUrl = await generateImage(prompt);
      setGeneratedImage(imageUrl);
      addToHistory(prompt);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message.toLowerCase() : '';
      if (errorMessage.includes('block') || errorMessage.includes('safety')) {
        setImageError('Image generation failed. Your prompt was likely blocked for safety reasons. Please try different wording.');
      } else {
        setImageError('Failed to generate image. The service may be temporarily unavailable or there was an issue with the request.');
      }
    } finally {
      setIsGeneratingImage(false);
    }
  }, [addToHistory]);

  const handleSaveNewPrompt = useCallback((title: string, category: string, type: PromptType, technique: PromptTechnique, promptText: string, imageUrl?: string) => {
    const newPrompt: Prompt = {
      id: `user-${Date.now()}`, title, prompt: promptText, isFavorite: false, category, type, technique, imageUrl, isShared: false,
    };
    setUserCollection(prev => [newPrompt, ...prev]);
    if (category && !userCategories.includes(category)) {
        setUserCategories(prev => [...prev, category]);
    }
    setSavingPrompt(null);
  }, [userCategories]);

  const handleSaveBuiltPrompt = useCallback((prompt: string) => {
    if (!prompt) return;
    setSavingPrompt({ prompt });
  }, []);

  const handleForkPrompt = useCallback((prompt: LibraryPrompt) => {
    const newPrompt: Prompt = {
      id: `user-${Date.now()}`, title: prompt.title, prompt: prompt.prompt, isFavorite: false, category: prompt.category, type: prompt.type, technique: prompt.technique, isShared: false,
    };
    setUserCollection(prev => [newPrompt, ...prev]);
  }, []);

  const handleStartEdit = (prompt: Prompt) => { setEditingPrompt(prompt); setViewingPrompt(null); };
  const handleCancelEdit = () => { setEditingPrompt(null); };
  
  const handleUpdatePrompt = (updatedPrompt: Prompt) => {
    setUserCollection(prev => prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
    if (updatedPrompt.category && !userCategories.includes(updatedPrompt.category)) {
        setUserCategories(prev => [...prev, updatedPrompt.category]);
    }
    setEditingPrompt(null);
    setViewingPrompt(updatedPrompt);
  };

  const handleDeletePrompt = (promptId: string) => {
    if (window.confirm("Are you sure you want to delete this prompt?")) {
      setUserCollection(prev => prev.filter(p => p.id !== promptId));
      setViewingProject(p => p ? {...p, promptIds: p.promptIds.filter(id => id !== promptId)} : null);
      setViewingWorkflow(w => {
        if (!w) return null;
        return {...w, steps: w.steps.filter(step => step.promptId !== promptId)};
      });
      setViewingPrompt(null);
    }
  };

  const handleToggleFavorite = useCallback((promptId: string) => {
    let updatedPrompt: Prompt | undefined;
    setUserCollection(prev => 
      prev.map(p => {
        if (p.id === promptId) {
            updatedPrompt = { ...p, isFavorite: !p.isFavorite };
            return updatedPrompt;
        }
        return p;
      })
    );
    if (viewingPrompt && 'id' in viewingPrompt && viewingPrompt.id === promptId && updatedPrompt) {
        setViewingPrompt(updatedPrompt);
    }
  }, [viewingPrompt]);

  const handleViewPrompt = (prompt: Prompt | LibraryPrompt) => setViewingPrompt(prompt);
  const handleUseHistoryPrompt = useCallback((prompt: string) => { setActiveView('builder'); setIsHistoryModalOpen(false); }, []);
  const handleDeleteHistoryItem = useCallback((id: string) => setPromptHistory(prev => prev.filter(item => item.id !== id)), []);
  const handleClearHistory = useCallback(() => { if (window.confirm("Are you sure?")) { setPromptHistory([]); } }, []);

  const handleShowCollection = () => { setActiveView('collection'); setCollectionFilter('all'); };
  const handleShowFavorites = () => { setActiveView('collection'); setCollectionFilter('favorites'); };
  const handleShowHistory = () => setIsHistoryModalOpen(true);
  const handleShowAnalytics = () => setActiveView('analytics');
  
  const handleSaveProject = (title: string, description: string) => {
    if (isProjectModalOpen && 'id' in isProjectModalOpen) {
      setProjects(prev => prev.map(p => p.id === (isProjectModalOpen as Project).id ? {...p, title, description} : p));
      setViewingProject(prev => prev && prev.id === (isProjectModalOpen as Project).id ? {...prev, title, description} : prev);
    } else {
      const newProject: Project = { id: `proj-${Date.now()}`, title, description, promptIds: [] };
      setProjects(prev => [newProject, ...prev]);
    }
    setIsProjectModalOpen(null);
  };
  
  const handleDeleteProject = (projectId: string) => {
    if (window.confirm("Delete this project? (Prompts inside will NOT be deleted)")) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setViewingProject(null);
    }
  };

  const handleAddPromptsToProject = (promptIds: string[]) => {
    if (!viewingProject) return;
    setProjects(prev => prev.map(p => {
      if (p.id === viewingProject.id) {
        const newPromptIds = [...new Set([...p.promptIds, ...promptIds])];
        const updatedProject = { ...p, promptIds: newPromptIds };
        setViewingProject(updatedProject);
        return updatedProject;
      }
      return p;
    }));
    setAddPromptsModalOpen(false);
  };

  const handleRemovePromptFromProject = (projectId: string, promptId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const newPromptIds = p.promptIds.filter(id => id !== promptId);
        const updatedProject = { ...p, promptIds: newPromptIds };
        if (viewingProject?.id === projectId) setViewingProject(updatedProject);
        return updatedProject;
      }
      return p;
    }));
  };
  
  const handleSaveWorkflow = (title: string, description: string) => {
    if (isWorkflowModalOpen && 'id' in isWorkflowModalOpen) {
      setWorkflows(prev => prev.map(w => w.id === (isWorkflowModalOpen as Workflow).id ? {...w, title, description} : w));
      setViewingWorkflow(prev => prev && prev.id === (isWorkflowModalOpen as Workflow).id ? {...prev, title, description} : prev);
    } else {
      const newWorkflow: Workflow = { id: `wf-${Date.now()}`, title, description, steps: [] };
      setWorkflows(prev => [newWorkflow, ...prev]);
    }
    setIsWorkflowModalOpen(null);
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    if (window.confirm("Delete this workflow? (Prompts inside will NOT be deleted)")) {
      setWorkflows(prev => prev.filter(w => w.id !== workflowId));
      setViewingWorkflow(null);
    }
  };

  const handleAddPromptToWorkflow = (workflowId: string, promptId: string) => {
    setWorkflows(prev => prev.map(w => {
        if (w.id === workflowId) {
            const newStep: WorkflowStep = { promptId };
            const updatedWorkflow = { ...w, steps: [...w.steps, newStep] };
            if(viewingWorkflow?.id === workflowId) setViewingWorkflow(updatedWorkflow);
            return updatedWorkflow;
        }
        return w;
    }));
  };

  const handleRemovePromptFromWorkflow = (workflowId: string, promptId: string, indexToRemove: number) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id === workflowId) {
        const newSteps = w.steps.filter((step, index) => index !== indexToRemove);
        const updatedWorkflow = { ...w, steps: newSteps };
        if (viewingWorkflow?.id === workflowId) setViewingWorkflow(updatedWorkflow);
        return updatedWorkflow;
      }
      return w;
    }));
  };
  
  const handleUpdateWorkflowStepCondition = (workflowId: string, stepIndex: number, condition: string) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id === workflowId) {
        const newSteps = [...w.steps];
        if (newSteps[stepIndex]) {
          newSteps[stepIndex] = { ...newSteps[stepIndex], condition };
          const updatedWorkflow = { ...w, steps: newSteps };
          if (viewingWorkflow?.id === workflowId) setViewingWorkflow(updatedWorkflow);
          return updatedWorkflow;
        }
      }
      return w;
    }));
  };


  const handleMovePromptInWorkflow = (workflowId: string, index: number, direction: 'up' | 'down') => {
    setWorkflows(prev => prev.map(w => {
        if (w.id === workflowId) {
            const newSteps = [...w.steps];
            if (direction === 'up' && index > 0) {
                [newSteps[index], newSteps[index - 1]] = [newSteps[index - 1], newSteps[index]];
            } else if (direction === 'down' && index < newSteps.length - 1) {
                [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
            }
            const updatedWorkflow = { ...w, steps: newSteps };
            if (viewingWorkflow?.id === workflowId) setViewingWorkflow(updatedWorkflow);
            return updatedWorkflow;
        }
        return w;
    }));
  };

  const handleSharePrompt = useCallback((promptToShare: Prompt) => {
    if (!currentUser || currentUser.subscriptionTier !== 'premium') return;
    
    const newCommunityPrompt: CommunityPrompt = {
        id: `comm-${Date.now()}`,
        originalPromptId: promptToShare.id,
        authorId: currentUser.id,
        authorName: currentUser.name,
        title: promptToShare.title,
        prompt: promptToShare.prompt,
        category: promptToShare.category,
        type: promptToShare.type,
        technique: promptToShare.technique,
        createdAt: Date.now(),
        likes: 0,
        forks: 0,
        views: 0,
    };

    setCommunityPrompts(prev => [newCommunityPrompt, ...prev]);
    setUserCollection(prev => prev.map(p => p.id === promptToShare.id ? { ...p, isShared: true } : p));
    setViewingPrompt(null);
  }, [currentUser]);

  const handleLikePrompt = useCallback((promptId: string) => {
    if (!currentUser) return;
    
    const alreadyLiked = currentUser.likedPromptIds.includes(promptId);
    let targetPrompt: CommunityPrompt | undefined;

    setCommunityPrompts(prev => prev.map(p => {
        if (p.id === promptId) {
            targetPrompt = { ...p, likes: alreadyLiked ? p.likes - 1 : p.likes + 1 };
            return targetPrompt;
        }
        return p;
    }));

    setCurrentUser(prevUser => {
        if (!prevUser) return null;
        return {
            ...prevUser,
            likedPromptIds: alreadyLiked
                ? prevUser.likedPromptIds.filter(id => id !== promptId)
                : [...prevUser.likedPromptIds, promptId]
        };
    });

    if (targetPrompt) {
        setAllUsers(prevUsers => prevUsers.map(user => {
            if (user.id === targetPrompt?.authorId) {
                return { ...user, points: alreadyLiked ? user.points - POINTS_FOR_LIKE : user.points + POINTS_FOR_LIKE };
            }
            return user;
        }));
    }
  }, [currentUser]);

  const handleForkCommunityPrompt = useCallback((promptToFork: CommunityPrompt) => {
    const newPrompt: Prompt = {
      id: `user-${Date.now()}`, title: promptToFork.title, prompt: promptToFork.prompt, isFavorite: false, category: promptToFork.category, type: promptToFork.type, technique: promptToFork.technique, isShared: false,
    };
    setUserCollection(prev => [newPrompt, ...prev]);
    setCommunityPrompts(prev => prev.map(p => p.id === promptToFork.id ? { ...p, forks: p.forks + 1 } : p));
    setAllUsers(prevUsers => prevUsers.map(user => {
        if (user.id === promptToFork.authorId) {
            return { ...user, points: user.points + POINTS_FOR_FORK };
        }
        return user;
    }));
  }, []);

  const handleSaveNewContext = useCallback((title: string, content: string) => {
    const newContext: UserContext = { id: `ctx-${Date.now()}`, title, content };
    setUserContexts(prev => [newContext, ...prev]);
    setIsSaveContextModalOpen(false);
  }, []);

  const handleDeleteContext = useCallback((contextId: string) => {
    if (window.confirm("Are you sure you want to delete this context block?")) {
      setUserContexts(prev => prev.filter(c => c.id !== contextId));
    }
  }, []);

  const renderActiveView = () => {
    switch(activeView) {
      case 'builder':
        return <PromptBuilderView 
                  onGenerateImage={handleGenerateImage}
                  isGenerating={isGeneratingImage}
                  generatedImage={generatedImage}
                  error={imageError}
                  onSavePrompt={handleSaveBuiltPrompt}
                />;
      case 'collection':
        return <CollectionView userCollection={userCollection} onViewPrompt={handleViewPrompt} onToggleFavorite={handleToggleFavorite} onForkPrompt={handleForkPrompt} collectionFilter={collectionFilter} />;
      case 'community':
        return <CommunityView communityPrompts={communityPrompts} currentUser={currentUser} onLike={handleLikePrompt} onFork={handleForkCommunityPrompt} />;
      case 'optimizer':
        return <OptimizerView 
                  userContexts={userContexts}
                  onSaveNewContext={() => setIsSaveContextModalOpen(true)}
                  onDeleteContext={handleDeleteContext}
                  onSavePrompt={handleSaveBuiltPrompt}
                  addToHistory={addToHistory}
               />;
      case 'workspace':
        return <WorkspaceView teams={teams} allUsers={allUsers} userCollection={userCollection} currentUser={currentUser} />;
      case 'analytics':
        return <AnalyticsDashboardView communityPrompts={communityPrompts} currentUser={currentUser} />;
      case 'projects':
        if (viewingProject) {
          const projectPrompts = userCollection.filter(p => viewingProject.promptIds.includes(p.id));
          return (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <button onClick={() => setViewingProject(null)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">&larr; Back to Projects</button>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-800/40 rounded-lg">
                <div className="flex justify-between items-start"><div><h2 className="text-2xl font-bold gradient-text">{viewingProject.title}</h2><p className="text-gray-600 dark:text-gray-400 mt-1">{viewingProject.description}</p></div><div className="flex gap-2"><button onClick={() => setIsProjectModalOpen(viewingProject)} className="text-xs px-3 py-1 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Edit</button><button onClick={() => handleDeleteProject(viewingProject.id)} className="text-xs px-3 py-1 bg-red-100 text-red-700 dark:bg-red-800/50 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-700/50">Delete</button></div></div>
              </div>
              <button onClick={() => setAddPromptsModalOpen(true)} className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-colors">+ Add Prompts to Project</button>
              {projectPrompts.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{projectPrompts.map(prompt => (<PromptCard key={prompt.id} prompt={prompt} onView={() => handleViewPrompt(prompt)} onToggleFavorite={() => handleToggleFavorite(prompt.id)} onRemoveFromProject={() => handleRemovePromptFromProject(viewingProject.id, prompt.id)} />))}</div>) : (<div className="text-center py-12 text-gray-500 dark:text-gray-500"><p>This project is empty.</p><p className="text-sm">Click "Add Prompts to Project" to get started.</p></div>)}
            </div>
          );
        }
        return <ProjectsView projects={projects} onViewProject={setViewingProject} onEditProject={(p) => setIsProjectModalOpen(p)} onDeleteProject={handleDeleteProject} onCreateProject={() => setIsProjectModalOpen({})} />;
      case 'workflows':
        if (viewingWorkflow) {
          const workflowPrompts = viewingWorkflow.steps.map(step => userCollection.find(p => p.id === step.promptId)).filter((p): p is Prompt => !!p);
          const availablePrompts = userCollection.filter(p => !viewingWorkflow.steps.map(s => s.promptId).includes(p.id));
          return (
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <button onClick={() => setViewingWorkflow(null)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">&larr; Back to Workflows</button>
                    <button onClick={() => setRunningWorkflow(viewingWorkflow)} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity">Run Workflow</button>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-800/40 rounded-lg">
                    <div className="flex justify-between items-start"><div><h2 className="text-2xl font-bold gradient-text">{viewingWorkflow.title}</h2><p className="text-gray-600 dark:text-gray-400 mt-1">{viewingWorkflow.description}</p></div><div className="flex gap-2"><button onClick={() => setIsWorkflowModalOpen(viewingWorkflow)} className="text-xs px-3 py-1 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Edit</button><button onClick={() => handleDeleteWorkflow(viewingWorkflow.id)} className="text-xs px-3 py-1 bg-red-100 text-red-700 dark:bg-red-800/50 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-700/50">Delete</button></div></div>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-bold text-lg mb-4">Add Prompt to Workflow</h3>
                    <select onChange={(e) => handleAddPromptToWorkflow(viewingWorkflow.id, e.target.value)} className="w-full bg-white dark:bg-gray-900/50 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" value="">
                        <option value="" disabled>-- Select a prompt to add --</option>
                        {availablePrompts.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                </div>
                {viewingWorkflow.steps.length > 0 ? (
                    <div className="space-y-4">
                        {viewingWorkflow.steps.map((step, index) => {
                            const prompt = userCollection.find(p => p.id === step.promptId);
                            if (!prompt) return null;
                            return (
                            <div key={`${prompt.id}-${index}`} className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <span className="text-indigo-500 font-bold">{index + 1}</span>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">{prompt.title}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{prompt.prompt}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button disabled={index === 0} onClick={() => handleMovePromptInWorkflow(viewingWorkflow!.id, index, 'up')} className="p-1.5 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700">&uarr;</button>
                                        <button disabled={index === viewingWorkflow!.steps.length - 1} onClick={() => handleMovePromptInWorkflow(viewingWorkflow!.id, index, 'down')} className="p-1.5 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700">&darr;</button>
                                        <button onClick={() => handleRemovePromptFromWorkflow(viewingWorkflow!.id, prompt.id, index)} className="p-1.5 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20">X</button>
                                    </div>
                                </div>
                                {index > 0 && (
                                    <div className="pl-8">
                                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Condition (Optional)</label>
                                        <input
                                            type="text"
                                            value={step.condition || ''}
                                            onChange={(e) => handleUpdateWorkflowStepCondition(viewingWorkflow!.id, index, e.target.value)}
                                            placeholder={`Run if output from Step ${index} contains...`}
                                            className="mt-1 w-full bg-white dark:bg-gray-900/50 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                )}
                            </div>
                        )})}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-500"><p>This workflow is empty.</p><p className="text-sm">Add prompts from your collection to build your workflow.</p></div>
                )}
            </div>
          );
        }
        return <WorkflowsView workflows={workflows} onViewWorkflow={setViewingWorkflow} onEditWorkflow={(w) => setIsWorkflowModalOpen(w)} onDeleteWorkflow={handleDeleteWorkflow} onCreateWorkflow={() => setIsWorkflowModalOpen({})} />;
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 font-sans text-gray-800 dark:text-gray-300">
        <div className="w-full max-w-6xl mx-auto space-y-8">
          <Header theme={theme} toggleTheme={toggleTheme} onShowHistory={handleShowHistory} onShowCollection={handleShowCollection} onShowFavorites={handleShowFavorites} currentUser={currentUser} onShowAnalytics={handleShowAnalytics} />
          <Tabs activeView={activeView} setActiveView={(v) => { setActiveView(v); setViewingProject(null); setViewingWorkflow(null); }} />
          <main className="bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl shadow-indigo-500/10 p-6 md:p-8">
            {renderActiveView()}
          </main>
          <footer className="text-center text-xs text-gray-500 dark:text-gray-500">
            <p>Create By @Rakib Founder of AI Learn Hub</p>
          </footer>
        </div>
      </div>
      
      {savingPrompt && <SavePromptModal promptText={savingPrompt.prompt} initialTitle={savingPrompt.title} categories={userCategories} onSave={(title, category, type, technique, imageUrl) => handleSaveNewPrompt(title, category, type, technique, savingPrompt.prompt, imageUrl)} onCancel={() => setSavingPrompt(null)} />}
      {editingPrompt && <EditPromptModal prompt={editingPrompt} categories={userCategories} onSave={handleUpdatePrompt} onCancel={handleCancelEdit} />}
      {viewingPrompt && <PromptDetailModal prompt={viewingPrompt} onClose={() => setViewingPrompt(null)} onEdit={('isFavorite' in viewingPrompt) ? handleStartEdit : undefined} onDelete={('isFavorite' in viewingPrompt) ? handleDeletePrompt : undefined} onUse={() => {}} onToggleFavorite={('isFavorite' in viewingPrompt) ? handleToggleFavorite : undefined} onSave={(promptToSave) => setSavingPrompt({prompt: promptToSave.prompt, title: promptToSave.title})} currentUser={currentUser} onShare={('isFavorite' in viewingPrompt) ? handleSharePrompt : undefined} />}
      {isHistoryModalOpen && <HistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} history={promptHistory} onUse={handleUseHistoryPrompt} onDelete={handleDeleteHistoryItem} onClearAll={handleClearHistory} />}
      {isProjectModalOpen && <CreateEditProjectModal isOpen={!!isProjectModalOpen} project={'id' in isProjectModalOpen ? isProjectModalOpen as Project : undefined} onSave={handleSaveProject} onCancel={() => setIsProjectModalOpen(null)} />}
      {isAddPromptsModalOpen && viewingProject && <AddPromptsToProjectModal isOpen={isAddPromptsModalOpen} onClose={() => setAddPromptsModalOpen(false)} userCollection={userCollection} projectPromptIds={viewingProject.promptIds} onAddPrompts={handleAddPromptsToProject} />}
      {isWorkflowModalOpen && <CreateEditWorkflowModal isOpen={!!isWorkflowModalOpen} workflow={'id' in isWorkflowModalOpen ? isWorkflowModalOpen as Workflow : undefined} onSave={handleSaveWorkflow} onCancel={() => setIsWorkflowModalOpen(null)} />}
      {runningWorkflow && <RunWorkflowModal workflow={runningWorkflow} userCollection={userCollection} onClose={() => setRunningWorkflow(null)} />}
      {isSaveContextModalOpen && <SaveContextModal onSave={handleSaveNewContext} onCancel={() => setIsSaveContextModalOpen(false)} />}
    </>
  );
};

export default App;