import React, { useState } from 'react';
import { AchievementItem } from '../types/portfolio';
import { EmptyState } from '../components/EmptyState';
import { TeddyBear } from '../components/TeddyBear';
import { ImageLightboxModal } from '../components/ImageLightboxModal';
import { Trophy, Calendar, Sparkles, Image as ImageIcon, Award, Eye } from 'lucide-react';

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
  const [lightboxData, setLightboxData] = useState<{
    images: string[];
    initialIndex: number;
    title: string;
    subtitle?: string;
  } | null>(null);

  const handleOpenProof = (item: AchievementItem, index = 0) => {
    const list = (item.proofImages && item.proofImages.length > 0)
      ? item.proofImages
      : item.proofUrl ? [item.proofUrl] : [];
    if (list.length === 0) return;
    setLightboxData({
      images: list,
      initialIndex: index,
      title: item.title,
      subtitle: `${item.issuerOrEvent} • ${item.date}`,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <TeddyBear variant="heading" size={26} animated />
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-rose-100 ribbon-underline tracking-tight">
              Honors & Achievements
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-rose-200/70 mt-2 font-medium">
            Academic accolades, hackathon podiums, certifications of excellence, and recognitions.
          </p>
        </div>

        {isAdmin && onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="btn-rose-gradient px-4 py-2 rounded-xl text-xs font-semibold self-start sm:self-auto shadow-md"
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
          {publishedAchievements.map((item) => {
            const proofList = (item.proofImages && item.proofImages.length > 0)
              ? item.proofImages
              : item.proofUrl ? [item.proofUrl] : [];
            const primaryProof = proofList[0];

            return (
              <div
                key={item.id}
                className="glass-card glass-card-hover p-6 rounded-[22px] border border-rose-500/20 flex flex-col justify-between space-y-4 group transition-all duration-300"
              >
                <div className="space-y-4">
                  {/* Top Badge & Trophy */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-3 bg-rose-950/60 text-rose-300 rounded-2xl border border-rose-500/30 shrink-0 shadow-inner">
                      <Trophy className="w-5 h-5 text-rose-300" />
                    </div>
                    {item.rankOrAward && (
                      <span className="bg-gradient-to-r from-rose-700 to-rose-600 text-rose-100 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm border border-rose-400/30">
                        {item.rankOrAward}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-lg sm:text-xl text-rose-100 group-hover:text-rose-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-rose-300/90 mt-1 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-rose-400" />
                      {item.issuerOrEvent}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-rose-200/80 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-rose-300/70 pt-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    <span>{item.date}</span>
                  </div>

                  {/* Proof preview thumbnail */}
                  {primaryProof && (
                    <div className="pt-2">
                      <div
                        onClick={() => handleOpenProof(item, 0)}
                        className="relative rounded-xl overflow-hidden border border-rose-500/30 bg-rose-950/40 group/thumb cursor-pointer aspect-video max-h-48 flex items-center justify-center hover:border-rose-400/60 transition-all"
                      >
                        {primaryProof.startsWith('data:application/pdf') || primaryProof.toLowerCase().endsWith('.pdf') ? (
                          <div className="flex flex-col items-center justify-center text-rose-300/80 p-4">
                            <span className="text-3xl mb-1">📄</span>
                            <span className="text-xs font-medium">PDF Proof Document</span>
                          </div>
                        ) : (
                          <img
                            src={primaryProof}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-200">
                          <span className="bg-rose-900/90 text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 shadow-lg border border-rose-400/40 backdrop-blur-xs">
                            <Eye className="w-3.5 h-3.5" />
                            View Full Proof
                          </span>
                        </div>
                        {proofList.length > 1 && (
                          <span className="absolute top-2 right-2 bg-black/75 text-rose-200 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-rose-500/30">
                            +{proofList.length - 1} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {proofList.length > 0 && (
                  <div className="pt-3 border-t border-rose-500/20 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenProof(item, 0)}
                      className="text-xs font-semibold text-rose-300 hover:text-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>View Proof Document ({proofList.length})</span>
                    </button>
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal with Zoom, Pan, Rotate, and Multi-image support */}
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
