import React, { useState, useMemo } from 'react';
import { CommunityPrompt, User } from '../prompts/collection';
import { CommunityPromptCard } from './CommunityPromptCard';

interface CommunityViewProps {
  communityPrompts: CommunityPrompt[];
  currentUser: User | null;
  onLike: (promptId: string) => void;
  onFork: (prompt: CommunityPrompt) => void;
}

type SortOption = 'trending' | 'newest' | 'likes';

const FREE_TIER_LIMIT = 10;

export const CommunityView: React.FC<CommunityViewProps> = ({ communityPrompts, currentUser, onLike, onFork }) => {
  const [sortOption, setSortOption] = useState<SortOption>('trending');

  const sortedPrompts = useMemo(() => {
    const prompts = [...communityPrompts];
    switch (sortOption) {
      case 'newest':
        return prompts.sort((a, b) => b.createdAt - a.createdAt);
      case 'likes':
        return prompts.sort((a, b) => b.likes - a.likes);
      case 'trending':
      default:
        // Simple trending algorithm: combination of likes and recency
        return prompts.sort((a, b) => {
          const scoreA = a.likes + (a.createdAt / (Date.now() - a.createdAt + 1));
          const scoreB = b.likes + (b.createdAt / (Date.now() - b.createdAt + 1));
          return scoreB - scoreA;
        });
    }
  }, [communityPrompts, sortOption]);

  const isPremium = currentUser?.subscriptionTier === 'premium';
  const promptsToDisplay = isPremium ? sortedPrompts : sortedPrompts.slice(0, FREE_TIER_LIMIT);

  const SortButton: React.FC<{ label: string; value: SortOption }> = ({ label, value }) => (
    <button
      onClick={() => setSortOption(value)}
      className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${sortOption === value ? 'bg-indigo-600 text-white' : 'bg-gray-200/80 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold gradient-text">Community Prompts</h2>
            <div className="flex items-center gap-2">
                <SortButton label="Trending" value="trending" />
                <SortButton label="Newest" value="newest" />
                <SortButton label="Most Liked" value="likes" />
            </div>
        </div>

        {promptsToDisplay.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-500">
                <p>No community prompts have been shared yet.</p>
                <p className="text-sm">Premium users can share their prompts from their collection.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {promptsToDisplay.map(prompt => (
                    <CommunityPromptCard
                        key={prompt.id}
                        prompt={prompt}
                        currentUser={currentUser}
                        onLike={onLike}
                        onFork={onFork}
                    />
                ))}
            </div>
        )}

        {!isPremium && communityPrompts.length > FREE_TIER_LIMIT && (
            <div className="relative text-center p-8 bg-gray-100 dark:bg-gray-800/40 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-100 dark:from-gray-800/40 via-transparent to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Want to see more?</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Upgrade to Premium to unlock all community prompts and share your own creations.</p>
                    <button className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity">
                        Go Premium
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};
