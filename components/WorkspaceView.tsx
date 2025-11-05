import React, { useState, useMemo } from 'react';
import { Team, User, Prompt } from '../prompts/collection';
import { PromptCard } from './PromptCard';
// We can reuse ProjectListItem and WorkflowListItem here in the future
// import { ProjectListItem } from './ProjectListItem';
// import { WorkflowListItem } from './WorkflowListItem';

interface WorkspaceViewProps {
    teams: Team[];
    allUsers: User[];
    userCollection: Prompt[];
    currentUser: User | null;
}

type WorkspaceSubView = 'prompts' | 'projects' | 'workflows' | 'members';

const SubNavButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => {
  const baseClasses = "flex-shrink-0 text-center px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const activeClasses = "bg-indigo-600 text-white shadow";
  const inactiveClasses = "bg-transparent text-gray-500 hover:bg-gray-300/50 dark:bg-transparent dark:text-gray-400 dark:hover:bg-gray-800/60";
  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {label}
    </button>
  );
};

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({ teams, allUsers, userCollection, currentUser }) => {
    const [activeSubView, setActiveSubView] = useState<WorkspaceSubView>('prompts');
    
    // For now, we assume the user is in the first team. A team switcher could be added here.
    const activeTeam = useMemo(() => {
        if (!currentUser || !currentUser.teamIds) return null;
        return teams.find(t => t.id === currentUser.teamIds![0]);
    }, [currentUser, teams]);

    const sharedPrompts = useMemo(() => {
        if (!activeTeam) return [];
        return userCollection.filter(p => activeTeam.sharedPromptIds.includes(p.id));
    }, [activeTeam, userCollection]);
    
    // Add logic for shared projects and workflows when data model supports it
    // const sharedProjects = ...
    // const sharedWorkflows = ...

    if (!activeTeam) {
        return (
            <div className="text-center py-16 text-gray-500 dark:text-gray-500">
                <h2 className="text-2xl font-bold gradient-text mb-4">Team Workspace</h2>
                <p>You are not a part of any team yet.</p>
                <button className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50" disabled>
                    Create a New Team
                </button>
            </div>
        );
    }

    const renderSubView = () => {
        switch (activeSubView) {
            case 'prompts':
                return sharedPrompts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {sharedPrompts.map(p => <PromptCard key={p.id} prompt={p} />)}
                    </div>
                ) : <p className="text-center text-gray-500 py-8">No prompts have been shared in this workspace yet.</p>;
            
            case 'projects':
                return <p className="text-center text-gray-500 py-8">Shared projects will appear here. (Coming Soon)</p>;
                
            case 'workflows':
                return <p className="text-center text-gray-500 py-8">Shared workflows will appear here. (Coming Soon)</p>;

            case 'members':
                return (
                    <div className="max-w-md mx-auto space-y-3">
                        {activeTeam.members.map(member => (
                            <div key={member.userId} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                                <span className="font-semibold">{member.name}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700/80 px-2 py-0.5 rounded-full">{member.role}</span>
                            </div>
                        ))}
                    </div>
                );
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold gradient-text">{activeTeam.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">A collaborative space for your team.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-opacity disabled:opacity-50" disabled>
                    + Invite Member
                </button>
            </div>
            
            <div className="flex items-center gap-1 p-1 bg-gray-200/60 dark:bg-gray-900/50 rounded-xl border border-gray-300 dark:border-gray-700/80 self-start">
                <SubNavButton label="Shared Prompts" isActive={activeSubView === 'prompts'} onClick={() => setActiveSubView('prompts')} />
                <SubNavButton label="Shared Projects" isActive={activeSubView === 'projects'} onClick={() => setActiveSubView('projects')} />
                <SubNavButton label="Team Members" isActive={activeSubView === 'members'} onClick={() => setActiveSubView('members')} />
            </div>

            <div>
                {renderSubView()}
            </div>
        </div>
    );
};