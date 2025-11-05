import React from 'react';
import { Workflow } from '../prompts/collection';
import { WorkflowListItem } from './WorkflowListItem';

interface WorkflowsViewProps {
  workflows: Workflow[];
  onViewWorkflow: (workflow: Workflow) => void;
  onEditWorkflow: (workflow: Workflow) => void;
  onDeleteWorkflow: (workflowId: string) => void;
  onCreateWorkflow: () => void;
}

export const WorkflowsView: React.FC<WorkflowsViewProps> = ({
  workflows,
  onViewWorkflow,
  onEditWorkflow,
  onDeleteWorkflow,
  onCreateWorkflow,
}) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold gradient-text">My Workflows</h2>
        <button
          onClick={onCreateWorkflow}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
        >
          + Create New Workflow
        </button>
      </div>

      {workflows.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-500">
          <p>You don't have any workflows yet.</p>
          <p className="text-sm">Create a workflow to chain prompts together for powerful automations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {workflows.map(workflow => (
            <WorkflowListItem
              key={workflow.id}
              workflow={workflow}
              onView={() => onViewWorkflow(workflow)}
              onEdit={() => onEditWorkflow(workflow)}
              onDelete={() => onDeleteWorkflow(workflow.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};