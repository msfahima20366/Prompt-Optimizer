import React from 'react';
import { Project } from '../prompts/collection';
import { ProjectListItem } from './ProjectListItem';

interface ProjectsViewProps {
  projects: Project[];
  onViewProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onCreateProject: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onViewProject,
  onEditProject,
  onDeleteProject,
  onCreateProject,
}) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold gradient-text">My Projects</h2>
        <button
          onClick={onCreateProject}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
        >
          + Create New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-500">
          <p>You don't have any projects yet.</p>
          <p className="text-sm">Create a project to group related prompts together.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectListItem
              key={project.id}
              project={project}
              onView={() => onViewProject(project)}
              onEdit={() => onEditProject(project)}
              onDelete={() => onDeleteProject(project.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};