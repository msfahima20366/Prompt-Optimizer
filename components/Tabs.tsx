
import React from 'react';

type View = 'collection' | 'optimizer' | 'community' | 'matrix' | 'galaxy';

interface TabsProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeView, setActiveView }) => {
    const tabs: { key: View, label: string }[] = [
        { key: 'collection', label: 'My Saved Prompts' },
        { key: 'optimizer', label: 'Improve Prompt' },
        { key: 'community', label: 'Discovery' },
        { key: 'matrix', label: 'Power Tools' },
    ];

    return (
        <nav className="flex gap-2 p-1 bg-gray-200 dark:bg-gray-800 rounded-xl max-w-fit mx-auto shadow-inner">
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    onClick={() => setActiveView(tab.key)}
                    className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeView === tab.key ? 'bg-white dark:bg-indigo-600 shadow-md' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    {tab.label}
                </button>
            ))}
        </nav>
    );
};
