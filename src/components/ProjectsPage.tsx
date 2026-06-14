import { Plus, Layers } from 'lucide-react';
import type { Project } from '@/types';
import { ProjectCard } from './ProjectCard';

interface ProjectsPageProps {
  projects: Project[];
  onCreateProject: () => void;
  onViewProject: (project: Project) => void;
  onModifyProject: (projectId: number, content: string) => void;
  onDeleteProject: (projectId: number) => void;
}

export function ProjectsPage({ projects, onCreateProject, onViewProject, onModifyProject, onDeleteProject }: ProjectsPageProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#1e1208]">Projects</h1>
        </div>
        <button
          onClick={onCreateProject}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)', boxShadow: '0 2px 10px rgba(171,110,71,0.30)' }}
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Grid or empty */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border text-center"
          style={{ background: 'linear-gradient(160deg, #fdfaf6 0%, #faf5ee 100%)', border: '1px solid #ddd0bc' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)', boxShadow: '0 4px 14px rgba(139,90,60,0.28)' }}>
            <Layers className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#1e1208] mb-2">No projects yet</h3>
          <p className="text-sm text-[#7a6858] mb-6 max-w-xs">Create your first project by uploading a markdown file with your project details.</p>
          <button
            onClick={onCreateProject}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)', boxShadow: '0 2px 10px rgba(171,110,71,0.25)' }}>
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onView={onViewProject}
              onModify={onModifyProject}
              onDelete={onDeleteProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
