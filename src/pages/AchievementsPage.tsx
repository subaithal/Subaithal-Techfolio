import React, { useState } from 'react';
import { AchievementItem } from '../types/portfolio';
import { EmptyState } from '../components/EmptyState';
import { TeddyBear } from '../components/TeddyBear';
import { Trophy, Calendar, ExternalLink, Sparkles, X, Image as ImageIcon } from 'lucide-react';

interface AchievementsPageProps {
  achievements: AchievementItem[];
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
}

export const AchievementsPage: React.FC<AchievementsPageProps> = ({
  achievements,
  isAdmin,
  onOpenAdmin,
}) => {
  const publishedAchievements = achievements.filter((a) => a.published || isAdmin);
  const [proofModal, setProofModal] = useState<{ title: string; url: string } | null>(null);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TeddyBear variant="heading" size={26} animated />
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#3A0F05] ribbon-underline">
              Honors & Achievements
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#85203F] mt-2">
            Awards, hackathon podiums, leadership accolades, and special recognitions.
          </p>
        </div>

        {isAdmin && onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold self-start sm:self-auto"
          >
            + Add Achievement
          </button>
        )}
      </div>

      {publishedAchievements.length === 0 ? (
        <EmptyState
          title="Achievements coming soon"
          message="Subaithal's competition achievements and academic recognitions will be showcased here once published."
          actionText={isAdmin ? 'Add Achievement' : undefined}
          onAction={onOpenAdmin}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {publishedAchievements.map((item) => (
            <div
              key={item.id}
              className="glass-card glass-card-hover p-6 rounded-[22px] border border-white/70 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-3 bg-white/70 text-[#8F2547] rounded-2xl border border-white/80 shrink-0 shadow-xs">
                    <Trophy className="w-5 h-5" />
                  </div>
                  {item.rankOrAward && (
                    <span className="bg-[#8F2547] text-white px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider shadow-xs">
                      {item.rankOrAward}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-heading font-bold text-lg text-[#3A0F05] group-hover:text-[#8F2547] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#8F2547] mt-0.5">
                    {item.issuerOrEvent}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-[#4F2119]/85 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center gap-1.5 text-[11px] text-[#85203F] pt-1">
                  <Calendar className="w-3.5 h-3.5 text-[#C9577B]" />
                  <span>{item.date}</span>
                </div>
              </div>

              {item.proofUrl && (
                <div className="pt-3 border-t border-white/40 flex items-center justify-between">
                  <button
                    onClick={() => setProofModal({ title: item.title, url: item.proofUrl! })}
                    className="text-xs font-semibold text-[#8F2547] hover:underline flex items-center gap-1"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>View Proof Document</span>
                  </button>
                  <Sparkles className="w-3.5 h-3.5 text-[#C9577B]" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Proof Modal */}
      {proofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] flex flex-col p-6 relative border-2 border-white/80 shadow-2xl overflow-hidden">
            <button
              onClick={() => setProofModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 text-[#85203F]"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-heading font-bold text-lg text-[#3A0F05] mb-4">
              {proofModal.title} — Proof
            </h3>
            <div className="flex-1 overflow-auto rounded-xl border border-white/80 bg-white/40 p-2 flex items-center justify-center min-h-[300px]">
              {proofModal.url.startsWith('data:application/pdf') || proofModal.url.toLowerCase().endsWith('.pdf') ? (
                <iframe src={proofModal.url} title={proofModal.title} className="w-full h-[450px] rounded-lg border-0" />
              ) : (
                <img src={proofModal.url} alt={proofModal.title} referrerPolicy="no-referrer" className="max-h-[450px] w-auto object-contain rounded-lg" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
