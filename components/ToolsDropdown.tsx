import React from 'react';

// This type is also defined in App.tsx. It's duplicated here for component modularity.
type View = 'studio' | 'collection' | 'community' | 'projects' | 'matrix' | 'workflows' | 'imageStudio';

interface ToolsDropdownProps {
  setActiveView: (view: View) => void;
  onClose: () => void;
}

export const ToolsDropdown: React.FC<ToolsDropdownProps> = ({ setActiveView, onClose }) => {
    const toolViews: { key: View, label: string }[] = [
        { key: 'projects', label: 'Projects' },
        { key: 'workflows', label: 'Workflows' },
        { key: 'matrix', label: 'Matrix' },
        { key: 'imageStudio', label: 'Image Studio' },
    ];

    const handleSelect = (view: View) => {
        setActiveView(view);
        onClose();
    };

    const itemClasses = "block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors rounded-md";

    return (
        <div className="absolute left-0 mt-2 w-48 bg-white/80 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl animate-fade-in z-50">
            <div className="p-2 space-y-1">
                {toolViews.map(({ key, label }) => (
                     <button key={key} onClick={() => handleSelect(key)} className={itemClasses}>
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
}