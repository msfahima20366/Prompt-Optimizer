
import React from 'react';

interface ComposerBlockProps {
    id: number;
    label: string;
    content: string;
    onContentChange: (id: number, content: string) => void;
    onRemove: (id: number) => void;
    onMove: (id: number, direction: 'up' | 'down') => void;
    isFirst: boolean;
    isLast: boolean;
    isContext?: boolean;
}

export const ComposerBlock: React.FC<ComposerBlockProps> = ({
    id,
    label,
    content,
    onContentChange,
    onRemove,
    onMove,
    isFirst,
    isLast,
    isContext = false,
}) => {
    return (
        <div className="relative group p-4 bg-gray-100 dark:bg-gray-800/60 rounded-lg border-l-4 border-indigo-500">
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onMove(id, 'up')}
                    disabled={isFirst}
                    className="p-1.5 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                    &uarr;
                </button>
                <button
                    onClick={() => onMove(id, 'down')}
                    disabled={isLast}
                    className="p-1.5 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                    &darr;
                </button>
                <button onClick={() => onRemove(id)} className="p-1.5 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20">
                    &#x2715;
                </button>
            </div>
            <label className={`block text-sm font-bold mb-2 ${isContext ? 'text-purple-500 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`}>
                {label}
            </label>
            <textarea
                value={content}
                onChange={(e) => onContentChange(id, e.target.value)}
                rows={isContext ? 5 : 3}
                placeholder={isContext ? "Context content is read-only here." : "Enter details here..."}
                readOnly={isContext}
                className="w-full bg-white dark:bg-gray-900/50 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>
    );
};
