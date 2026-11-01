import React from 'react';
import { EducationItem } from '../types/portfolio';
import { EmptyState } from '../components/EmptyState';
import { TeddyBear } from '../components/TeddyBear';
import { GraduationCap, Calendar, MapPin, Award, BookOpen } from 'lucide-react';

interface EducationPageProps {
  education: EducationItem[];
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
}

export const EducationPage: React.FC<EducationPageProps> = ({
  education,
  isAdmin,
  onOpenAdmin,
}) => {
  const publishedEdu = education.filter((e) => e.published || isAdmin);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TeddyBear variant="heading" size={26} animated />
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#3A0F05] ribbon-underline">
              Education & Academics
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#85203F] mt-2">
            Academic degrees, collegiate qualifications, and coursework.
          </p>
        </div>

        {isAdmin && onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold self-start sm:self-auto"
          >
            + Add Education Entry
          </button>
        )}
      </div>

      {publishedEdu.length === 0 ? (
        <EmptyState
          title="Education coming soon"
          message="Subaithal's academic qualifications and educational timeline will appear here once added in the admin dashboard."
          actionText={isAdmin ? 'Add Education' : undefined}
          onAction={onOpenAdmin}
        />
      ) : (
        <div className="space-y-6">
          {publishedEdu.map((item) => (
            <div
              key={item.id}
              className="glass-card glass-card-hover p-6 sm:p-7 rounded-[22px] border border-white/70 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 bg-white/70 text-[#8F2547] rounded-2xl border border-white/80 shrink-0 shadow-xs">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl text-[#3A0F05]">
                      {item.degree} in {item.field}
                    </h3>
                    <p className="text-sm font-semibold text-[#8F2547]">
                      {item.college}
                    </p>
                    {item.place && (
                      <div className="flex items-center gap-1 text-[11px] text-[#85203F] mt-0.5">
                        <MapPin className="w-3 h-3 text-[#A93A5C]" />
                        <span>{item.place}</span>
                      </div>
                    )}
                  </div>
                </div>

                {item.grade && (
                  <div className="flex items-center gap-1 bg-white/70 px-3 py-1 rounded-full text-xs font-semibold text-[#8F2547] border border-white/80 self-start">
                    <Award className="w-3.5 h-3.5 text-[#C9577B]" />
                    <span>Grade / GPA: {item.grade}</span>
                  </div>
                )}
              </div>

              {/* Years */}
              <div className="flex items-center gap-1.5 text-xs text-[#85203F] font-medium bg-white/40 px-3 py-1.5 rounded-xl w-fit">
                <Calendar className="w-3.5 h-3.5 text-[#C9577B]" />
                <span>
                  {item.startYear} — {item.endYear}
                </span>
              </div>

              {/* Notes */}
              {item.notes && (
                <div className="pt-2 text-xs sm:text-sm text-[#4F2119] leading-relaxed flex items-start gap-2 bg-white/40 p-3.5 rounded-2xl">
                  <BookOpen className="w-4 h-4 text-[#8F2547] shrink-0 mt-0.5" />
                  <p>{item.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
