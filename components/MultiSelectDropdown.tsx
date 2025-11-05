import React, { useState, useRef, useEffect } from 'react';

interface MultiSelectDropdownProps {
  label: string;
  options: readonly string[]; // Make options readonly for safety
  selectedValues: string[];
  onValueChange: (values: string[]) => void;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ label, options, selectedValues, onValueChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleOption = (option: string) => {
    const newSelectedValues = [...selectedValues];
    if (newSelectedValues.includes(option)) {
      onValueChange(newSelectedValues.filter(item => item !== option));
    } else {
      onValueChange([...newSelectedValues, option]);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{label}</label>
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex justify-between items-center bg-white dark:bg-gray-900/50 border-2 border-gray-300 dark:border-gray-700 rounded-lg shadow-inner px-4 py-2.5 text-left text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
            <span className="truncate">
                {selectedValues.length === 0 ? `All` : `${selectedValues.length} selected`}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>

        {isOpen && (
            <div className="absolute mt-1 w-full max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-10 animate-fade-in">
                <div className="p-2 space-y-1">
                    {selectedValues.length > 0 && (
                        <>
                            <button onClick={() => onValueChange([])} className="w-full text-left text-sm font-bold text-indigo-600 dark:text-indigo-400 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                Clear Selection
                            </button>
                            <div className="border-t border-gray-200 dark:border-gray-700/50 my-1"></div>
                        </>
                    )}
                    {options.map(option => (
                        <label key={option} className="flex items-center space-x-3 p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <input
                                type="checkbox"
                                checked={selectedValues.includes(option)}
                                onChange={() => handleToggleOption(option)}
                                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-800 dark:text-gray-200">{option}</span>
                        </label>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};
