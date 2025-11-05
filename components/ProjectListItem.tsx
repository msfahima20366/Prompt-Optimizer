import React from 'react';
import { Project } from '../prompts/collection';

// Icons
const EditIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
);
const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);

interface ProjectListItemProps {
  project: Project;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ProjectListItem: React.FC<ProjectListItemProps> = ({ project, onView, onEdit, onDelete }) => {
  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div
      onClick={onView}
      className="group w-full flex flex-col justify-between p-5 bg-white/50 dark:bg-gray-900/50 rounded-2xl border-2 border-gray-200 dark:border-gray-700/60 shadow-lg hover:shadow-indigo-500/20 hover:border-indigo-500/50 transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 cursor-pointer"
    >
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => handleActionClick(e, onEdit)} className="p-1.5 bg-gray-100 dark:bg-gray-700/80 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Edit Project">
          <EditIcon />
        </button>
        <button onClick={(e) => handleActionClick(e, onDelete)} className="p-1.5 bg-gray-100 text-red-500 dark:bg-gray-700/80 dark:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-500/30 transition-colors" title="Delete Project">
          <TrashIcon />
        </button>
      </div>

      <div className="flex-1 space-y-3">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg pr-16">{project.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium text-left line-clamp-3">
          {project.description || 'No description provided.'}
        </p>
      </div>
      
      <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700/50">
        <span className="text-sm font-semibold text-indigo-500 dark:text-indigo-400">
          {project.promptIds.length} {project.promptIds.length === 1 ? 'Prompt' : 'Prompts'}
        </span>
      </div>
    </div>
  );
};