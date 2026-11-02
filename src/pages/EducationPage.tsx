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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <TeddyBear variant="heading" size={26} animated />
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-rose-100 ribbon-underline tracking-tight">
              Education & Academics
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-rose-200/70 mt-2 font-medium">
            Academic degrees, collegiate qualifications, and coursework.
          </p>
        </div>

        {isAdmin && onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="btn-rose-gradient px-4 py-2 rounded-xl text-xs font-semibold self-start sm:self-auto shadow-md"
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
              className="glass-card glass-card-hover p-6 sm:p-7 rounded-[22px] border border-rose-500/20 space-y-4 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 bg-rose-950/60 text-rose-300 rounded-2xl border border-rose-500/30 shrink-0 shadow-inner">
                    <GraduationCap className="w-5 h-5 text-rose-300" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl text-rose-100">
                      {item.degree} in {item.field}
                    </h3>
                    <p className="text-sm font-semibold text-rose-300">
                      {item.college}
                    </p>
                    {item.place && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-300/70 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>{item.place}</span>
                      </div>
                    )}
                  </div>
                </div>

                {item.grade && (
                  <div className="flex items-center gap-1 bg-rose-950/70 px-3 py-1 rounded-full text-xs font-semibold text-rose-200 border border-rose-500/30 self-start shadow-sm">
                    <Award className="w-3.5 h-3.5 text-rose-400" />
                    <span>Grade / GPA: {item.grade}</span>
                  </div>
                )}
              </div>

              {/* Years */}
              <div className="flex items-center gap-1.5 text-xs text-rose-200/90 font-medium bg-rose-950/50 px-3 py-1.5 rounded-xl w-fit border border-rose-500/20">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                <span>
                  {item.startYear} — {item.endYear}
                </span>
              </div>

              {/* Notes */}
              {item.notes && (
                <div className="pt-2 text-xs sm:text-sm text-rose-200/90 leading-relaxed flex items-start gap-2 bg-rose-950/40 p-3.5 rounded-2xl border border-rose-500/20">
                  <BookOpen className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
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
