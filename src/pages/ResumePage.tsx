import React from 'react';
import { ResumeData } from '../types/portfolio';
import { EmptyState } from '../components/EmptyState';
import { TeddyBear } from '../components/TeddyBear';
import { Download, FileText, Calendar, Eye, Sparkles } from 'lucide-react';

interface ResumePageProps {
  resume: ResumeData;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
}

export const ResumePage: React.FC<ResumePageProps> = ({
  resume,
  isAdmin,
  onOpenAdmin,
}) => {
  const isAvailable = Boolean(resume.fileUrl && (resume.published || isAdmin));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <TeddyBear variant="heading" size={26} animated />
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-rose-100 ribbon-underline tracking-tight">
              Curriculum Vitae & Resume
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-rose-200/70 mt-2 font-medium">
            Comprehensive resume document of Subaithal S. Available for review and download.
          </p>
        </div>

        {isAdmin && onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="btn-rose-gradient px-4 py-2 rounded-xl text-xs font-semibold self-start sm:self-auto shadow-md"
          >
            {isAvailable ? 'Update Resume PDF' : 'Upload Resume PDF'}
          </button>
        )}
      </div>

      {!isAvailable ? (
        <EmptyState
          title="Resume coming soon"
          message="Subaithal's updated resume document is currently being finalized. Please check back shortly or connect directly via LinkedIn."
          actionText={isAdmin ? 'Upload Resume PDF' : undefined}
          onAction={onOpenAdmin}
        />
      ) : (
        <div className="space-y-6">
          {/* Header Action Card */}
          <div className="glass-card p-6 sm:p-7 rounded-[22px] border border-rose-500/20 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-rose-950/60 text-rose-300 rounded-2xl border border-rose-500/30 shadow-inner shrink-0">
                <FileText className="w-7 h-7 text-rose-300" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-xl text-rose-100">
                  {resume.fileName || 'Subaithal_S_Resume.pdf'}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-rose-300/80">
                  {resume.versionName && (
                    <span className="bg-rose-950/70 px-2.5 py-0.5 rounded-md font-semibold text-rose-200 border border-rose-500/30">
                      {resume.versionName}
                    </span>
                  )}
                  {resume.fileSize && <span>· {resume.fileSize}</span>}
                  {resume.lastUpdated && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-rose-400" />
                      Updated {resume.lastUpdated}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={resume.fileUrl}
                download={resume.fileName || 'Subaithal_S_Resume.pdf'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-rose-gradient px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>

          {/* Embedded PDF Viewer Frame */}
          <div className="glass-card p-4 sm:p-6 rounded-[22px] border border-rose-500/20 shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-rose-500/20 text-xs text-rose-300/80">
              <span className="font-semibold flex items-center gap-1.5 text-rose-200">
                <Eye className="w-4 h-4 text-rose-400" />
                Document Preview
              </span>
              <a
                href={resume.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-rose-300 font-medium"
              >
                Open in Full Tab
              </a>
            </div>

            <div className="w-full h-[650px] rounded-xl overflow-hidden border border-rose-500/30 bg-rose-950/60 shadow-inner">
              <iframe
                src={resume.fileUrl}
                title="Subaithal S. Resume"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
