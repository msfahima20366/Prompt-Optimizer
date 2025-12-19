
import React, { useState, useRef, useEffect } from 'react';

type View = 'builder' | 'collection' | 'community' | 'projects' | 'workflows' | 'optimizer' | 'workspace' | 'analytics' | 'matrix' | 'galaxy';

interface TabsProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeView, setActiveView }) => {
    const mainItems: { key: View, label: string, title: string }[] = [
        { key: 'collection', label: 'Prompt Collection', title: "Manage your saved prompts and favorites" },
        { key: 'optimizer', label: 'Optimizer', title: "Synthesize high-performance meta-prompts" },
        { key: 'workspace', label: 'Workspace', title: "Collaborative area for team projects" },
    ];

    const researchItems: { key: View, label: string, title: string, soon?: boolean }[] = [
        { key: 'matrix', label: 'Parameter Matrix', title: "A/B test prompt variables and model parameters" },
        { key: 'galaxy', label: 'Inference Trace', title: "Visualize the inner mechanics of LLM reasoning" },
        { key: 'community', label: 'Community Feed', title: "Discover and fork prompts from other creators" },
        { key: 'builder', label: 'Studio Pro', title: "Advanced image prompt synthesis tools", soon: true },
    ];
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const close = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsMenuOpen(false); };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const isResearchActive = researchItems.some(i => i.key === activeView);

    return (
        <nav className="flex items-center gap-1.5 p-2 bg-white/60 dark:bg-stone-950/60 backdrop-blur-2xl border border-amber-100 dark:border-stone-800 rounded-[2.5rem] shadow-2xl shadow-amber-500/5">
            {mainItems.map(item => (
                <button
                    key={item.key}
                    onClick={() => setActiveView(item.key)}
                    title={item.title}
                    className={`relative px-8 py-3.5 text-xs font-black uppercase tracking-widest transition-all duration-500 rounded-[2rem] ${activeView === item.key ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl shadow-amber-500/30 scale-105 border-b-2 border-orange-700' : 'text-stone-500 hover:bg-amber-50 dark:hover:bg-stone-900 hover:text-brand-navy dark:hover:text-white'}`}
                >
                    {item.label}
                    {activeView === item.key && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"></span>}
                </button>
            ))}

            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    title="Access advanced research and community features"
                    className={`flex items-center gap-3 px-8 py-3.5 text-xs font-black uppercase tracking-widest transition-all rounded-[2rem] ${isResearchActive ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl shadow-amber-500/30 border-b-2 border-orange-700' : 'text-stone-500 hover:bg-amber-50 dark:hover:bg-stone-900'}`}
                >
                    Research
                    <svg className={`w-4 h-4 transition-transform duration-500 ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {isMenuOpen && (
                    <div className="absolute right-0 mt-4 w-72 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border border-amber-100 dark:border-stone-800 rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(180,83,9,0.3)] p-3 animate-fade-in overflow-hidden z-[100]">
                        {researchItems.map(item => (
                            <button
                                key={item.key}
                                onClick={() => { if(!item.soon) { setActiveView(item.key); setIsMenuOpen(false); } }}
                                title={item.title}
                                className={`w-full flex justify-between items-center px-6 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all ${activeView === item.key ? 'bg-amber-50 dark:bg-amber-900/20 text-orange-600 dark:text-amber-400' : 'text-stone-600 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-stone-800/50 hover:text-orange-600'} ${item.soon ? 'opacity-30 cursor-not-allowed' : ''}`}
                            >
                                {item.label}
                                {item.soon && <span className="text-[8px] bg-amber-200 dark:bg-stone-700 px-2 py-0.5 rounded-full">Soon</span>}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
};
