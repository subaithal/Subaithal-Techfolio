import React, { useState } from 'react';
import { ExperienceItem } from '../types/portfolio';
import { EmptyState } from '../components/EmptyState';
import { TeddyBear } from '../components/TeddyBear';
import { Briefcase, Calendar, MapPin, FileCheck, FileText, X } from 'lucide-react';

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
  const [docModal, setDocModal] = useState<{ title: string; url: string } | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'applied':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-pink-100 text-[#8F2547] border-pink-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TeddyBear variant="heading" size={26} animated />
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#3A0F05] ribbon-underline">
              Work Experience
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#85203F] mt-2">
            Professional roles, team responsibilities, and industry track records.
          </p>
        </div>

        {isAdmin && onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold self-start sm:self-auto"
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
              className="glass-card glass-card-hover p-6 sm:p-7 rounded-[22px] border border-white/70 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 bg-white/70 text-[#8F2547] rounded-2xl border border-white/80 shrink-0 shadow-xs">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl text-[#3A0F05]">
                      {item.role}
                    </h3>
                    <p className="text-sm font-semibold text-[#8F2547]">
                      {item.organization}
                    </p>
                    {item.location && (
                      <div className="flex items-center gap-1 text-[11px] text-[#85203F] mt-0.5">
                        <MapPin className="w-3 h-3 text-[#A93A5C]" />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-1.5 text-xs text-[#85203F] font-medium bg-white/40 px-3 py-1.5 rounded-xl w-fit">
                <Calendar className="w-3.5 h-3.5 text-[#C9577B]" />
                <span>
                  {item.startDate} — {item.isCurrent ? 'Present' : item.endDate || 'Ongoing'}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-[#4F2119] leading-relaxed whitespace-pre-line">
                {item.description}
              </p>

              {/* Document Attachments */}
              {(item.offerLetterUrl || item.completionCertUrl) && (
                <div className="pt-3 border-t border-white/40 flex flex-wrap items-center gap-3">
                  {item.offerLetterUrl && (
                    <button
                      onClick={() => setDocModal({ title: `${item.role} - Offer Letter`, url: item.offerLetterUrl! })}
                      className="btn-rose-secondary px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Offer Letter</span>
                    </button>
                  )}
                  {item.completionCertUrl && (
                    <button
                      onClick={() => setDocModal({ title: `${item.role} - Completion Certificate`, url: item.completionCertUrl! })}
                      className="btn-rose-secondary px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Experience Certificate</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Document Viewer Modal */}
      {docModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] flex flex-col p-6 sm:p-7 relative border-2 border-white/80 shadow-2xl overflow-hidden">
            <button
              onClick={() => setDocModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 text-[#85203F]"
              aria-label="Close document"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-heading font-bold text-lg text-[#3A0F05] mb-4">
              {docModal.title}
            </h3>
            <div className="flex-1 overflow-auto rounded-xl border border-white/80 bg-white/40 p-2 flex items-center justify-center min-h-[300px]">
              {docModal.url.startsWith('data:application/pdf') || docModal.url.toLowerCase().endsWith('.pdf') ? (
                <iframe src={docModal.url} title={docModal.title} className="w-full h-[450px] rounded-lg border-0" />
              ) : (
                <img src={docModal.url} alt={docModal.title} referrerPolicy="no-referrer" className="max-h-[450px] w-auto object-contain rounded-lg" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
