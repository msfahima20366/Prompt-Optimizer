import React, { useMemo } from 'react';
import { CommunityPrompt, User } from '../prompts/collection';

interface AnalyticsDashboardViewProps {
    communityPrompts: CommunityPrompt[];
    currentUser: User | null;
}

const StatCard: React.FC<{ label: string; value: number | string; icon: string }> = ({ label, value, icon }) => (
    <div className="bg-gray-100 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            </div>
            <span className="text-4xl">{icon}</span>
        </div>
    </div>
);

export const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({ communityPrompts, currentUser }) => {
    
    const userSharedPrompts = useMemo(() => {
        if (!currentUser) return [];
        return communityPrompts.filter(p => p.authorId === currentUser.id);
    }, [communityPrompts, currentUser]);

    const totalViews = useMemo(() => userSharedPrompts.reduce((sum, p) => sum + (p.views || 0), 0), [userSharedPrompts]);
    const totalLikes = useMemo(() => userSharedPrompts.reduce((sum, p) => sum + p.likes, 0), [userSharedPrompts]);
    const totalForks = useMemo(() => userSharedPrompts.reduce((sum, p) => sum + p.forks, 0), [userSharedPrompts]);

    if (!currentUser) {
        return <p className="text-center text-gray-500">Please log in to see analytics.</p>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold gradient-text">Analytics Dashboard</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Performance of your shared prompts in the community.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard label="Total Views" value={totalViews} icon="👁️" />
                <StatCard label="Total Likes" value={totalLikes} icon="❤️" />
                <StatCard label="Total Forks" value={totalForks} icon="🍴" />
            </div>
            
            <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Your Shared Prompts</h3>
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                    {userSharedPrompts.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">You haven't shared any prompts yet. Share a prompt from your collection to see its stats here.</p>
                    ) : (
                        userSharedPrompts.map(prompt => (
                            <div key={prompt.id} className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-200 dark:border-gray-700/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{prompt.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-1">{prompt.prompt}</p>
                                </div>
                                <div className="flex items-center gap-6 text-sm font-semibold flex-shrink-0">
                                    <span title="Views">👁️ {prompt.views || 0}</span>
                                    <span title="Likes">❤️ {prompt.likes}</span>
                                    <span title="Forks">🍴 {prompt.forks}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};