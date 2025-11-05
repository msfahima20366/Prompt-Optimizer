import React from 'react';

interface ProfileDropdownProps {
  onShowCollection: () => void;
  onShowFavorites: () => void;
  onShowHistory: () => void;
  onClose: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  onShowCollection,
  onShowFavorites,
  onShowHistory,
  onClose
}) => {
  const itemClasses = "block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors rounded-md";

  const handleSelect = (action: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    action();
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white/80 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl animate-fade-in z-50">
      <div className="p-2 space-y-1">
        <button onClick={handleSelect(onShowCollection)} className={itemClasses}>My Collection</button>
        <button onClick={handleSelect(onShowFavorites)} className={itemClasses}>Favorites</button>
        <button onClick={handleSelect(onShowHistory)} className={`${itemClasses} sm:hidden`}>History</button>
        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
        <span className={`${itemClasses} opacity-50 cursor-not-allowed`}>Settings <em className="text-xs">(Soon)</em></span>
      </div>
    </div>
  );
};