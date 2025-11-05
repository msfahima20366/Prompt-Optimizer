import React from 'react';

interface FilterDropdownProps {
  label: string;
  options: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, options, selectedValue, onValueChange }) => {
  return (
    <div>
      <label htmlFor={`filter-${label}`} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
        {label}
      </label>
      <select
        id={`filter-${label}`}
        value={selectedValue}
        onChange={(e) => onValueChange(e.target.value)}
        className="w-full bg-white dark:bg-gray-900/50 border-2 border-gray-300 dark:border-gray-700 rounded-lg shadow-inner px-4 py-2.5 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};