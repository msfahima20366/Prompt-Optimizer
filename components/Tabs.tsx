
import React from 'react';

type View = 'builder' | 'collection' | 'community' | 'projects' | 'workflows' | 'optimizer';

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
        { key: 'builder', label: 'Builder' },
        { key: 'optimizer', label: 'Optimizer' },
        { key: 'collection', label: 'Collection' },
        { key: 'community', label: 'Community' },
        { key: 'projects', label: 'Projects' },
        { key: 'workflows', label: 'Workflows' },
    ];
  
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
    </div>
  );
};
