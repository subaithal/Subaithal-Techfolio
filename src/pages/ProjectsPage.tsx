import React, { useState } from 'react';
import { ProjectItem } from '../types/portfolio';
import { EmptyState } from '../components/EmptyState';
import { ImageLightboxModal } from '../components/ImageLightboxModal';
import { ExternalLink, Github, Sparkles, X, Image as ImageIcon, Eye } from 'lucide-react';

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

  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    images: string[];
    initialIndex: number;
  }>({
    isOpen: false,
    title: '',
    subtitle: '',
    images: [],
    initialIndex: 0,
  });

  const handleOpenProjectGallery = (project: ProjectItem, index = 0) => {
    const images: string[] = [];
    if (project.thumbnailUrl) images.push(project.thumbnailUrl);
    if (project.screenshots && project.screenshots.length > 0) {
      project.screenshots.forEach((s) => {
        if (!images.includes(s)) images.push(s);
      });
    }

    if (images.length === 0) return;

    setLightboxData({
      isOpen: true,
      title: project.title,
      subtitle: `${project.status} Project · ${project.summary}`,
      images,
      initialIndex: index,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-500/20 pb-6">
        <div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-rose-50 ribbon-underline">
            Featured Projects
          </h1>
          <p className="text-xs sm:text-sm text-rose-300/80 mt-2">
            Software builds, technical systems, and full-stack solutions.
          </p>
        </div>

        {isAdmin && onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold self-start sm:self-auto cursor-pointer"
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
          {publishedProjects.map((project) => {
            const allMedia: string[] = [];
            if (project.thumbnailUrl) allMedia.push(project.thumbnailUrl);
            if (project.screenshots && project.screenshots.length > 0) {
              project.screenshots.forEach((s) => {
                if (!allMedia.includes(s)) allMedia.push(s);
              });
            }

            return (
              <div
                key={project.id}
                className="glass-card glass-card-hover flex flex-col justify-between overflow-hidden border border-rose-500/20 rounded-[20px] group transition-all"
              >
                {/* Thumbnail Container */}
                <div 
                  className="relative aspect-video w-full bg-[#1A0813] overflow-hidden cursor-pointer group"
                  onClick={() => allMedia.length > 0 ? handleOpenProjectGallery(project, 0) : setSelectedProject(project)}
                >
                  {project.thumbnailUrl ? (
                    <img
                      src={project.thumbnailUrl}
                      alt={project.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-rose-950/40 to-[#1F0815] text-rose-300">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-80" />
                      <span className="text-[11px] font-medium text-rose-300">
                        Project Showcase
                      </span>
                    </div>
                  )}

                  {/* Status Indicator */}
                  <div className="absolute top-3 right-3 bg-[#15070E]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-rose-200 border border-rose-500/30 shadow-sm">
                    {project.status}
                  </div>

                  {/* Multi-photo counter badge */}
                  {project.screenshots && project.screenshots.length > 0 && (
                    <div className="absolute bottom-3 left-3 bg-[#15070E]/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-rose-200 border border-rose-500/30 flex items-center gap-1 shadow-sm">
                      <ImageIcon className="w-3 h-3 text-rose-300" />
                      <span>{project.screenshots.length} Photo{project.screenshots.length > 1 ? 's' : ''}</span>
                    </div>
                  )}

                  {/* Quick Zoom Preview Icon Overlay */}
                  {allMedia.length > 0 && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="px-3 py-1 rounded-full bg-[#16060E]/90 text-rose-200 border border-rose-500/30 text-[11px] font-semibold flex items-center gap-1.5 shadow-lg">
                        <Eye className="w-3.5 h-3.5 text-rose-300" />
                        <span>Preview Gallery</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3
                      onClick={() => setSelectedProject(project)}
                      className="font-heading font-bold text-lg text-rose-50 group-hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      {project.title}
                    </h3>
                    <p className="text-xs text-rose-200/80 line-clamp-3 leading-relaxed">
                      {project.summary}
                    </p>
                  </div>

                  {/* Tech Tags */}
                  {project.techTags && project.techTags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-rose-300 pt-2 border-t border-rose-500/15">
                      {project.techTags.slice(0, 4).map((tag, idx) => (
                        <span key={idx} className="bg-white/5 border border-rose-500/20 px-2 py-0.5 rounded-md font-medium text-rose-200">
                          {tag}
                        </span>
                      ))}
                      {project.techTags.length > 4 && (
                        <span className="text-[10px] text-rose-400">+{project.techTags.length - 4} more</span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-rose-500/15">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="text-xs font-semibold text-rose-300 hover:text-white flex items-center gap-1 cursor-pointer hover:underline"
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
                          className="p-1.5 rounded-full bg-white/5 hover:bg-rose-900/40 text-rose-200 border border-rose-500/20 transition-all"
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
                          className="p-1.5 rounded-full bg-white/5 hover:bg-rose-900/40 text-rose-200 border border-rose-500/20 transition-all"
                          aria-label="Live Demo"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] flex flex-col p-6 sm:p-8 relative border border-rose-500/30 shadow-2xl overflow-y-auto">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-rose-300 transition-colors cursor-pointer"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                {selectedProject.status} Project
              </span>

              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-rose-50">
                {selectedProject.title}
              </h2>

              <p className="text-sm text-rose-200/90 leading-relaxed">
                {selectedProject.summary}
              </p>

              {/* Tech stack */}
              {selectedProject.techTags && selectedProject.techTags.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                    Technologies Used:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.techTags.map((tech, idx) => (
                      <span key={idx} className="bg-white/5 text-rose-200 px-2.5 py-1 rounded-lg text-xs font-medium border border-rose-500/20">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Features list */}
              {selectedProject.features && selectedProject.features.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                    Key Features:
                  </h4>
                  <ul className="space-y-1.5 pl-4 list-disc text-xs sm:text-sm text-rose-200/80">
                    {selectedProject.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Screenshots gallery */}
              {selectedProject.screenshots && selectedProject.screenshots.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Screenshots ({selectedProject.screenshots.length}) — Click to Zoom:</span>
                    <span className="text-[10px] text-rose-400 font-normal">Click image for full viewer</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedProject.screenshots.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleOpenProjectGallery(selectedProject, selectedProject.thumbnailUrl ? idx + 1 : idx)}
                        className="rounded-xl overflow-hidden border border-rose-500/25 bg-[#170610] aspect-video block group hover:shadow-lg hover:border-rose-400/50 transition-all cursor-pointer relative"
                      >
                        <img
                          src={imgUrl}
                          alt={`${selectedProject.title} screenshot ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="w-5 h-5 text-rose-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-rose-500/20">
                {selectedProject.liveDemoLink && (
                  <a
                    href={selectedProject.liveDemoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-rose-gradient px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 cursor-pointer"
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
                    className="btn-rose-secondary px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 cursor-pointer"
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

      {/* Lightbox with Zoom and Pan */}
      <ImageLightboxModal
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData({ ...lightboxData, isOpen: false })}
        title={lightboxData.title}
        subtitle={lightboxData.subtitle}
        images={lightboxData.images}
        initialIndex={lightboxData.initialIndex}
      />
    </div>
  );
};
