import React from 'react';
import { SkillItem } from '../types/portfolio';
import { EmptyState } from '../components/EmptyState';
import { TeddyBear } from '../components/TeddyBear';
import { Wrench, Sparkles, CheckCircle2 } from 'lucide-react';

interface SkillsPageProps {
  skills: SkillItem[];
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
}

export const SkillsPage: React.FC<SkillsPageProps> = ({
  skills,
  isAdmin,
  onOpenAdmin,
}) => {
  const publishedSkills = skills.filter((s) => s.published || isAdmin);

  // Group skills by category
  const categories = Array.from(new Set(publishedSkills.map((s) => s.category || 'Technical')));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TeddyBear variant="heading" size={26} animated />
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#3A0F05] ribbon-underline">
              Skills & Tech Stack
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#85203F] mt-2">
            Languages, frameworks, developer tools, and domain proficiencies.
          </p>
        </div>

        {isAdmin && onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold self-start sm:self-auto"
          >
            + Add Skill
          </button>
        )}
      </div>

      {publishedSkills.length === 0 ? (
        <EmptyState
          title="Skills coming soon"
          message="Subaithal's technical abilities and core skill competencies will be highlighted here once added in the admin dashboard."
          actionText={isAdmin ? 'Add Skills' : undefined}
          onAction={onOpenAdmin}
        />
      ) : (
        <div className="space-y-8">
          {categories.map((category) => {
            const categorySkills = publishedSkills.filter((s) => (s.category || 'Technical') === category);
            return (
              <div key={category} className="glass-card p-6 sm:p-7 rounded-[22px] border border-white/70 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/40 pb-3">
                  <Wrench className="w-4 h-4 text-[#8F2547]" />
                  <h3 className="font-heading font-bold text-lg text-[#3A0F05]">
                    {category}
                  </h3>
                  <span className="text-xs text-[#85203F] font-semibold ml-auto">
                    {categorySkills.length} skill{categorySkills.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {categorySkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="p-3.5 bg-white/60 hover:bg-white/80 rounded-2xl border border-white/80 transition-all flex flex-col justify-between space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-[#3A0F05] group-hover:text-[#8F2547] transition-colors">
                          {skill.name}
                        </span>
                        {skill.proficiency && (
                          <span className="text-[11px] font-mono text-[#85203F]">
                            {skill.proficiency}%
                          </span>
                        )}
                      </div>

                      {skill.proficiency && (
                        <div className="w-full h-1.5 bg-pink-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#8F2547] to-[#C9577B] rounded-full"
                            style={{ width: `${skill.proficiency}%` }}
                          />
                        </div>
                      )}

                      {skill.notes && (
                        <p className="text-[11px] text-[#4F2119]/75 italic">
                          {skill.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
