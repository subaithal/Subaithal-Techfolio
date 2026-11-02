import React, { useState } from 'react';
import { ExperienceItem } from '../types/portfolio';
import { EmptyState } from '../components/EmptyState';
import { TeddyBear } from '../components/TeddyBear';
import { ImageLightboxModal } from '../components/ImageLightboxModal';
import { Briefcase, Calendar, MapPin, FileCheck, FileText, Sparkles } from 'lucide-react';

interface ExperiencePageProps {
  experience: ExperienceItem[];
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
}

export const ExperiencePage: React.FC<ExperiencePageProps> = ({
  experience,
  isAdmin,
  onOpenAdmin,
}) => {
  const publishedExp = experience.filter((e) => e.published || isAdmin);
  const [lightboxData, setLightboxData] = useState<{
    images: string[];
    initialIndex: number;
    title: string;
    subtitle?: string;
  } | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40';
      case 'applied':
        return 'bg-amber-950/70 text-amber-300 border-amber-500/40';
      default:
        return 'bg-rose-950/70 text-rose-300 border-rose-500/40';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <TeddyBear variant="heading" size={26} animated />
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-rose-100 ribbon-underline tracking-tight">
              Work Experience
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-rose-200/70 mt-2 font-medium">
            Professional roles, team responsibilities, and industry track records.
          </p>
        </div>

        {isAdmin && onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="btn-rose-gradient px-4 py-2 rounded-xl text-xs font-semibold self-start sm:self-auto shadow-md"
          >
            + Add Experience
          </button>
        )}
      </div>

      {publishedExp.length === 0 ? (
        <EmptyState
          title="Experience coming soon"
          message="Subaithal's career milestones and professional journey entries will be published here shortly."
          actionText={isAdmin ? 'Add Experience' : undefined}
          onAction={onOpenAdmin}
        />
      ) : (
        <div className="space-y-6">
          {publishedExp.map((item) => (
            <div
              key={item.id}
              className="glass-card glass-card-hover p-6 sm:p-7 rounded-[22px] border border-rose-500/20 space-y-4 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 bg-rose-950/60 text-rose-300 rounded-2xl border border-rose-500/30 shrink-0 shadow-inner">
                    <Briefcase className="w-5 h-5 text-rose-300" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl text-rose-100">
                      {item.role}
                    </h3>
                    <p className="text-sm font-semibold text-rose-300">
                      {item.organization}
                    </p>
                    {item.location && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-300/70 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start">
                  <span className={`px-3 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-1.5 text-xs text-rose-200/90 font-medium bg-rose-950/50 px-3 py-1.5 rounded-xl w-fit border border-rose-500/20">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                <span>
                  {item.startDate} — {item.isCurrent ? 'Present' : item.endDate || 'Ongoing'}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-rose-100/90 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>

              {/* Document Attachments */}
              {(item.offerLetterUrl || item.completionCertUrl) && (
                <div className="pt-3 border-t border-rose-500/20 flex flex-wrap items-center gap-3">
                  {item.offerLetterUrl && (
                    <button
                      onClick={() =>
                        setLightboxData({
                          images: [item.offerLetterUrl!],
                          initialIndex: 0,
                          title: `${item.role} — Offer Letter`,
                          subtitle: item.organization,
                        })
                      }
                      className="btn-rose-secondary px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Offer Letter</span>
                    </button>
                  )}
                  {item.completionCertUrl && (
                    <button
                      onClick={() =>
                        setLightboxData({
                          images: [item.completionCertUrl!],
                          initialIndex: 0,
                          title: `${item.role} — Experience Certificate`,
                          subtitle: item.organization,
                        })
                      }
                      className="btn-rose-secondary px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Experience Certificate</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxData && (
        <ImageLightboxModal
          isOpen={true}
          onClose={() => setLightboxData(null)}
          images={lightboxData.images}
          initialIndex={lightboxData.initialIndex}
          title={lightboxData.title}
          subtitle={lightboxData.subtitle}
        />
      )}
    </div>
  );
};
