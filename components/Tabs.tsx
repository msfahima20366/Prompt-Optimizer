
import React from 'react';

type View = 'collection' | 'optimizer';

interface TabsProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeView, setActiveView }) => {
    const tabs: { key: View, label: string }[] = [
        { key: 'collection', label: 'My Saved Prompts' },
        { key: 'optimizer', label: 'Improve Prompt (Neural Lab)' },
    ];

    return (
        <nav className="flex gap-2 p-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-2xl max-w-fit mx-auto shadow-inner backdrop-blur-md border border-white/10">
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    onClick={() => setActiveView(tab.key)}
                    className={`px-8 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${activeView === tab.key ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    {tab.label}
                </button>
            ))}
        </nav>
    );
};
