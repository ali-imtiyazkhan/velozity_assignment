import { useState } from 'react';
import { ProjectCard } from './ProjectCard';
import { ProjectForm } from './ProjectForm';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import type { ProjectListItem } from '../../types/api';

interface ProjectListProps {
  projects: ProjectListItem[];
  loading?: boolean;
  clients: { id: string; name: string }[];
  managers: { id: string; name: string; email: string }[];
  onEdit: (project: ProjectListItem) => void;
  onDelete: (projectId: string) => void;
  onView: (project: ProjectListItem) => void;
  onCreate: () => void;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

export function ProjectList({ 
  projects, 
  loading, 
  clients, 
  managers, 
  onEdit, 
  onDelete, 
  onView,
  onCreate,
  meta,
  onPageChange
}: ProjectListProps) {
  const [editingProject, setEditingProject] = useState<ProjectListItem | null>(null);
  const [creatingProject, setCreatingProject] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
          {meta && (
            <span className="text-sm text-gray-500">
              {meta.total} total
            </span>
          )}
        </div>
        <Button onClick={() => { setCreatingProject(true); onCreate(); }}>
          + New Project
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-48" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No projects found</p>
          <p className="text-sm">Create your first project</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => { setEditingProject(project); onEdit(project); }}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Page {meta.page} of {meta.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => onPageChange(meta.page - 1)} 
              disabled={meta.page === 1}
            >
              Previous
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => onPageChange(meta.page + 1)} 
              disabled={meta.page === meta.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Modal isOpen={!!editingProject} onClose={() => setEditingProject(null)} title="Edit Project">
        <ProjectForm
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          onSubmit={async () => {}}
          initialData={editingProject || undefined}
          clients={clients}
          managers={managers}
          title="Edit Project"
        />
      </Modal>

      <Modal isOpen={creatingProject} onClose={() => setCreatingProject(false)} title="Create Project">
        <ProjectForm
          isOpen={creatingProject}
          onClose={() => setCreatingProject(false)}
          onSubmit={async () => {}}
          clients={clients}
          managers={managers}
          title="Create Project"
        />
      </Modal>
    </div>
  );
}