import React, { useState, useEffect } from 'react';

const CopyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ClearIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const SaveIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
);


interface OutputDisplayProps {
  prompt: string;
  isLoading: boolean;
  onClear: () => void;
  onSave?: () => void;
  showActions: {
    save: boolean;
    clear: boolean;
  };
  children?: React.ReactNode;
  title?: string;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ prompt, isLoading, onClear, onSave, showActions, children, title = "4. Your Generated Prompt" }) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      setIsCopied(true);
    }
  };

  const hasContent = prompt || isLoading;

  if (!hasContent) {
    return null;
  }
  
  const buttonClasses = "p-2 bg-gray-200/60 dark:bg-gray-800/80 hover:bg-gray-300/80 dark:hover:bg-gray-700 rounded-full transition-colors";

  return (
    <div className="relative pt-6">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">{title}</h3>
        <div className="absolute top-6 right-4 flex space-x-2 z-10">
          {prompt && (
            <>
              {showActions.save && onSave && (
                <button
                  onClick={onSave}
                  className={buttonClasses}
                  title="Save to collection"
                >
                  <SaveIcon />
                </button>
              )}
              <button
                onClick={handleCopy}
                className={buttonClasses}
                title="Copy prompt"
              >
                {isCopied ? <CheckIcon /> : <CopyIcon />}
              </button>
            </>
          )}
          {showActions.clear && (
            <button
              onClick={onClear}
              className={buttonClasses}
              title="Clear"
            >
              <ClearIcon />
            </button>
          )}
      </div>
      
      <div className="w-full min-h-[120px] bg-gray-100/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg shadow-inner p-4 text-gray-800 dark:text-gray-300 relative">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400 animate-pulse">Generating your masterpiece...</p>
          </div>
        )}
        {prompt && <p className="whitespace-pre-wrap pr-20">{prompt}</p>}
        {children && <div className="absolute bottom-4 right-4">{children}</div>}
      </div>
    </div>
  );
};