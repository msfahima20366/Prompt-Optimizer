


import React, { useState, useRef, useEffect } from 'react';

type View = 'builder' | 'collection' | 'community' | 'projects' | 'workflows' | 'optimizer' | 'workspace' | 'analytics' | 'matrix' | 'galaxy';

interface TabsProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => {
  const baseClasses = "flex-shrink-0 text-center px-4 py-2.5 text-sm sm:text-base font-bold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900";
  const activeClasses = "bg-gradient-to-r from-amber-500 to-yellow-400 text-white shadow-lg";
  const inactiveClasses = "bg-transparent text-gray-500 hover:bg-gray-300/50 dark:bg-transparent dark:text-gray-400 dark:hover:bg-gray-800/60";

  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {label}
    </button>
  );
};

export const Tabs: React.FC<TabsProps> = ({ activeView, setActiveView }) => {
    const mainViews: { key: View, label: string }[] = [
        { key: 'collection', label: 'Collection' },
        { key: 'galaxy', label: 'AI Galaxy' }, // Added here for visibility
        { key: 'optimizer', label: 'Optimizer' },
        { key: 'workspace', label: 'Workspace' },
    ];

    const dropdownViews: { key: View, label: string, isComingSoon?: boolean }[] = [
        { key: 'community', label: 'Community' },
        { key: 'projects', label: 'Projects' },
        { key: 'workflows', label: 'Workflows' },
        { key: 'matrix', label: 'Matrix' },
        { key: 'builder', label: 'Builder', isComingSoon: true },
    ];
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const activeDropdownView = dropdownViews.find(v => v.key === activeView);
    const dropdownButtonLabel = activeDropdownView ? activeDropdownView.label : 'More';
    const isDropdownActive = !!activeDropdownView;

    const handleDropdownItemClick = (view: View) => {
        setActiveView(view);
        setIsDropdownOpen(false);
    };

    const DropdownButton: React.FC = () => {
        const baseClasses = "flex items-center gap-2 flex-shrink-0 text-center px-4 py-2.5 text-sm sm:text-base font-bold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900";
        const activeClasses = "bg-gradient-to-r from-amber-500 to-yellow-400 text-white shadow-lg";
        const inactiveClasses = "bg-transparent text-gray-500 hover:bg-gray-300/50 dark:bg-transparent dark:text-gray-400 dark:hover:bg-gray-800/60";
        
        return (
            <button onClick={() => setIsDropdownOpen(prev => !prev)} className={`${baseClasses} ${isDropdownActive ? activeClasses : inactiveClasses}`}>
                {dropdownButtonLabel}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
        );
    };

    return (
        <div className="flex items-center bg-gray-200/60 dark:bg-gray-900/50 p-1 rounded-xl border border-gray-300 dark:border-gray-700/80 space-x-1 sm:space-x-2 overflow-x-auto">
            {mainViews.map(({ key, label }) => (
                <TabButton
                    key={key}
                    label={label}
                    isActive={activeView === key}
                    onClick={() => setActiveView(key)}
                />
            ))}
            <div className="relative" ref={dropdownRef}>
                <DropdownButton />
                {isDropdownOpen && (
                    <div className="absolute right-0 sm:left-0 mt-2 w-48 bg-white/80 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl animate-fade-in z-20">
                        <div className="p-2 space-y-1">
                            {dropdownViews.map(({ key, label, isComingSoon }) => (
                                <button
                                    key={key}
                                    onClick={() => !isComingSoon && handleDropdownItemClick(key)}
                                    disabled={isComingSoon}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {label} {isComingSoon && <em className="text-xs opacity-60">(Soon)</em>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};