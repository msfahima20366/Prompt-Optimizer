
import React from 'react';
import { User } from '../prompts/collection';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    onShowHistory: () => void;
    onShowCollection: () => void;
    onShowFavorites: () => void;
    onShowAnalytics: () => void;
    currentUser: User | null;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onShowHistory, currentUser }) => {
  return (
    <header className="flex items-center justify-between">
      <div className="group flex items-center gap-6 cursor-pointer">
        <div className="relative w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-xl shadow-amber-500/20 transition-all group-hover:rotate-6 group-hover:scale-105 border-b-4 border-orange-800">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/></svg>
        </div>
        <div className="flex flex-col">
            <h1 className="text-3xl font-black tracking-tighter uppercase text-brand-navy dark:text-white leading-none">Matrix</h1>
            <p className="text-[9px] font-black tracking-[0.6em] text-orange-600 uppercase mt-1">Intelligence v4.2</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onShowHistory} 
          title="View your recently generated prompts and usage history"
          className="flex items-center gap-3 px-6 py-3.5 bg-white dark:bg-stone-900 border border-amber-100 dark:border-stone-800 rounded-2xl text-xs font-black uppercase tracking-widest text-brand-navy dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-stone-800 transition-all shadow-sm"
        >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="hidden md:inline">Log</span>
        </button>

        <button 
          onClick={toggleTheme} 
          title={theme === 'light' ? "Switch to Dark Mode for eye comfort" : "Switch to Light Mode for high clarity"}
          className="p-3.5 bg-white dark:bg-stone-900 border border-amber-100 dark:border-stone-800 rounded-2xl text-brand-navy dark:text-slate-400 hover:border-amber-400 transition-all shadow-sm"
        >
            {theme === 'light' ? 
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> : 
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            }
        </button>

        {currentUser && (
            <div className="flex items-center gap-5 pl-5 border-l border-amber-200 dark:border-stone-800">
                <div className="hidden lg:flex flex-col items-end">
                    <span className="text-xs font-black text-brand-navy dark:text-white uppercase tracking-tighter">{currentUser.name}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-orange-600">Tier: Premium</span>
                </div>
                <div 
                  className="w-14 h-14 rounded-2xl bg-amber-500 text-white shadow-xl shadow-amber-500/20 border-b-4 border-orange-700 flex items-center justify-center font-black"
                  title={`Logged in as ${currentUser.name}`}
                >
                    {currentUser.name.charAt(0)}
                </div>
            </div>
        )}
      </div>
    </header>
  );
};
