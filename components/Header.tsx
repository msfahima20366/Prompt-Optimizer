import React, { useState, useRef, useEffect } from 'react';
import { ProfileDropdown } from './ProfileDropdown';
import { User } from '../prompts/collection';

const AppIcon: React.FC = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="iconGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--gradient-from)" />
                <stop offset="100%" stopColor="var(--gradient-to)" />
            </linearGradient>
        </defs>
        <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="url(#iconGradient)" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M2 7L12 12M12 22V12M22 7L12 12M17 4.5L7 9.5" stroke="url(#iconGradient)" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
);

const HistoryIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ProfileIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const StarPointsIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);


interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    onShowHistory: () => void;
    onShowCollection: () => void;
    onShowFavorites: () => void;
    currentUser: User | null;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onShowHistory, onShowCollection, onShowFavorites, currentUser }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buttonClasses = "p-2 bg-gray-100/50 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300 rounded-full transition-colors duration-300 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <header className="relative flex items-center justify-between py-2">
      <div className="flex items-center space-x-4">
        <AppIcon />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-wider gradient-text">
          Banana Prompts
        </h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <button 
            onClick={onShowHistory}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100/50 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300 font-bold rounded-lg transition-colors duration-300 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="View Prompt History"
        >
            <HistoryIcon />
            <span className="hidden md:inline">History</span>
        </button>

        <button
            onClick={toggleTheme}
            className={buttonClasses}
            title="Toggle Theme"
        >
            <SunIcon className={`h-6 w-6 ${theme === 'light' ? 'hidden' : 'block'}`} />
            <MoonIcon className={`h-6 w-6 ${theme === 'dark' ? 'hidden' : 'block'}`} />
        </button>

        <div className="relative" ref={profileRef}>
            <button
                onClick={() => setIsProfileOpen(prev => !prev)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100/50 dark:bg-gray-800/60 rounded-full transition-colors duration-300 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                title="Profile Menu"
            >
                <ProfileIcon />
                {currentUser && (
                    <div className="hidden sm:flex items-center gap-2">
                        <span className="font-bold text-sm">{currentUser.name}</span>
                        <div className="flex items-center gap-1 bg-yellow-400/20 dark:bg-yellow-400/10 px-2 py-0.5 rounded-full">
                            <StarPointsIcon />
                            <span className="font-bold text-xs text-yellow-600 dark:text-yellow-300">{currentUser.points}</span>
                        </div>
                    </div>
                )}
            </button>
            {isProfileOpen && (
                <ProfileDropdown 
                    onShowCollection={() => { onShowCollection(); setIsProfileOpen(false); }}
                    onShowFavorites={() => { onShowFavorites(); setIsProfileOpen(false); }}
                    onShowHistory={() => { onShowHistory(); setIsProfileOpen(false); }}
                    onClose={() => setIsProfileOpen(false)}
                />
            )}
        </div>
      </div>
    </header>
  );
};