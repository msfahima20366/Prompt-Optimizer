
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

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onShowHistory, onShowCollection, currentUser }) => {
  return (
    <header className="flex items-center justify-between">
      <div className="group flex items-center gap-4 cursor-pointer">
        <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 transform transition-all group-hover:scale-105">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7L12 12L22 7L12 2Z"/><path d="M2 17L12 22L22 17"/><path d="M2 12L12 17L22 12"/></svg>
        </div>
        <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase leading-none">Matrix <span className="text-indigo-500 font-black">AI</span></h1>
            <p className="text-[9px] font-bold tracking-[0.2em] text-slate-400 uppercase mt-1">Professional Interface</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onShowHistory} 
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:border-indigo-500 transition-all shadow-sm"
        >
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="hidden md:inline">Logs</span>
        </button>

        <button 
          onClick={onShowCollection} 
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:border-indigo-500 transition-all shadow-sm"
        >
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <span className="hidden md:inline">My Vault</span>
        </button>

        <button 
          onClick={toggleTheme} 
          className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-indigo-500 hover:border-indigo-500 transition-all"
        >
            {theme === 'light' ? 
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> : 
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            }
        </button>

        {currentUser && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[11px] font-bold uppercase tracking-tight">{currentUser.name}</span>
                    <span className="text-[9px] font-bold uppercase text-indigo-500">Premium</span>
                </div>
                <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    {currentUser.name.charAt(0)}
                </div>
            </div>
        )}
      </div>
    </header>
  );
};
