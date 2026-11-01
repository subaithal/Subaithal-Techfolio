import React, { useState } from 'react';
import { ProjectItem } from '../types/portfolio';
import { EmptyState } from '../components/EmptyState';
import { TeddyBear } from '../components/TeddyBear';
import { ExternalLink, Github, Layers, Sparkles, X, Image as ImageIcon } from 'lucide-react';

interface ProjectsPageProps {
  projects: ProjectItem[];
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  isAdmin,
  onOpenAdmin,
}) => {
  const publishedProjects = projects.filter((p) => p.published || isAdmin);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TeddyBear variant="heading" size={26} animated />
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#3A0F05] ribbon-underline">
              Projects
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#85203F] mt-2">
            Selected works, software builds, and technical experiments.
          </p>
        </div>

        {isAdmin && onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold self-start sm:self-auto"
          >
            + Add New Project
          </button>
        )}
      </div>

      {/* Projects List or Friendly Empty State */}
      {publishedProjects.length === 0 ? (
        <EmptyState
          title="Projects coming soon"
          message="Subaithal is currently adding new project case studies. Check back very soon or reach out via LinkedIn!"
          actionText={isAdmin ? 'Add Your First Project' : undefined}
          onAction={onOpenAdmin}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedProjects.map((project) => (
            <div
              key={project.id}
              className="glass-card glass-card-hover flex flex-col justify-between overflow-hidden border border-white/70 rounded-[22px] group"
            >
              {/* Thumbnail Container */}
              <div 
                className="relative aspect-video w-full bg-pink-100/60 overflow-hidden cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                {project.thumbnailUrl ? (
                  <img
                    src={project.thumbnailUrl}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#FCE5ED] to-[#EBA3B8]/40 text-[#8F2547]">
                    <TeddyBear variant="heading" size={44} />
                    <span className="text-[11px] font-medium mt-2 text-[#85203F]">
                      Project Showcase
                    </span>
                  </div>
                )}

                {/* Status Indicator */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-[#8F2547] shadow-xs">
                  {project.status}
                </div>

                {/* Multi-photo counter badge */}
                {project.screenshots && project.screenshots.length > 0 && (
                  <div className="absolute bottom-3 left-3 bg-black/65 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white flex items-center gap-1 shadow-xs">
                    <ImageIcon className="w-3 h-3 text-pink-200" />
                    <span>+{project.screenshots.length} Photo{project.screenshots.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3
                    onClick={() => setSelectedProject(project)}
                    className="font-heading font-bold text-lg text-[#3A0F05] group-hover:text-[#8F2547] transition-colors cursor-pointer"
                  >
                    {project.title}
                  </h3>
                  <p className="text-xs text-[#4F2119]/85 line-clamp-3 leading-relaxed">
                    {project.summary}
                  </p>
                </div>

                {/* Tech Tags - clean unboxed typography */}
                {project.techTags && project.techTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#85203F] pt-2 border-t border-white/50">
                    {project.techTags.slice(0, 4).map((tag, idx) => (
                      <span key={idx} className="bg-white/60 px-2 py-0.5 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                    {project.techTags.length > 4 && (
                      <span className="text-[10px] text-[#A93A5C]">+{project.techTags.length - 4} more</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-white/40">
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="text-xs font-semibold text-[#8F2547] hover:underline flex items-center gap-1"
                  >
                    <span>View Details</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    {project.gitHubLink && (
                      <a
                        href={project.gitHubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-full bg-white/70 hover:bg-white text-[#8F2547] transition-all"
                        aria-label="GitHub Repository"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {project.liveDemoLink && (
                      <a
                        href={project.liveDemoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-full bg-white/70 hover:bg-white text-[#8F2547] transition-all"
                        aria-label="Live Demo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] flex flex-col p-6 sm:p-8 relative border-2 border-white/80 shadow-2xl overflow-y-auto">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 text-[#85203F] transition-colors"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TeddyBear variant="heading" size={24} />
                <span className="text-xs font-bold uppercase tracking-wider text-[#8F2547]">
                  {selectedProject.status} Project
                </span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#3A0F05]">
                {selectedProject.title}
              </h2>

              <p className="text-sm text-[#4F2119] leading-relaxed">
                {selectedProject.summary}
              </p>

              {/* Tech stack */}
              {selectedProject.techTags && selectedProject.techTags.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <h4 className="text-xs font-bold text-[#8F2547] uppercase tracking-wider">
                    Technologies Used:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.techTags.map((tech, idx) => (
                      <span key={idx} className="bg-white/70 text-[#3A0F05] px-2.5 py-1 rounded-lg text-xs font-medium border border-white/60">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Features list */}
              {selectedProject.features && selectedProject.features.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-[#8F2547] uppercase tracking-wider">
                    Key Features:
                  </h4>
                  <ul className="space-y-1.5 pl-4 list-disc text-xs sm:text-sm text-[#4F2119]/90">
                    {selectedProject.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Screenshots gallery */}
              {selectedProject.screenshots && selectedProject.screenshots.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-[#8F2547] uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Screenshots ({selectedProject.screenshots.length}):</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedProject.screenshots.map((imgUrl, idx) => (
                      <a
                        key={idx}
                        href={imgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl overflow-hidden border border-white/80 bg-white/50 aspect-video block group hover:shadow-md transition-all"
                      >
                        <img
                          src={imgUrl}
                          alt={`${selectedProject.title} screenshot ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/50">
                {selectedProject.liveDemoLink && (
                  <a
                    href={selectedProject.liveDemoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-rose-gradient px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2"
                  >
                    <span>Open Live Demo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {selectedProject.gitHubLink && (
                  <a
                    href={selectedProject.gitHubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-rose-secondary px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2"
                  >
                    <Github className="w-4 h-4" />
                    <span>View on GitHub</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
