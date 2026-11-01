import React from 'react';
import { ProfileData } from '../types/portfolio';
import { PageId } from '../components/Navigation';
import { TeddyBear, WaxSealBadge, FlowerSprig } from '../components/TeddyBear';
import { Linkedin, Github, Send, ArrowRight, Sparkles, MapPin, Mail, ExternalLink } from 'lucide-react';

interface HomePageProps {
  profile: ProfileData;
  onNavigate: (page: PageId) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ profile, onNavigate }) => {
  const hasShortIntro = Boolean(profile.shortIntro && profile.shortIntro.trim());
  const hasAboutText = Boolean(profile.aboutText && profile.aboutText.trim());
  const hasEducationSummary = Boolean(profile.educationSummary && profile.educationSummary.trim());
  const hasLocation = Boolean(profile.location && profile.location.trim());

  return (
    <div className="space-y-12 max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
      {/* Hero Section */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Name & Presets */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Cute Greeting Pill / Kicker */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-white/80 shadow-xs backdrop-blur-md">
              <TeddyBear variant="heading" size={20} animated />
              <span className="text-xs font-semibold text-[#8F2547] uppercase tracking-wider">
                Personal Portfolio
              </span>
            </div>

            {/* Name - strictly Subaithal S. */}
            <div className="space-y-2">
              <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-[#3A0F05] tracking-tight leading-tight">
                Subaithal S.
              </h1>
              <div className="w-24 h-1.5 bg-gradient-to-r from-[#8F2547] via-[#C9577B] to-transparent rounded-full" />
            </div>

            {/* Optional Location (hidden until added in admin) */}
            {hasLocation && (
              <div className="flex items-center gap-2 text-xs font-medium text-[#85203F]">
                <MapPin className="w-4 h-4 text-[#A93A5C]" />
                <span>{profile.location}</span>
              </div>
            )}

            {/* Short Intro - ONLY rendered if filled from Admin dashboard */}
            {hasShortIntro && (
              <div className="glass-card p-5 border border-white/60 text-sm sm:text-base text-[#4F2119] leading-relaxed shadow-sm">
                <p>{profile.shortIntro}</p>
              </div>
            )}

            {/* Core Action Buttons - strictly LinkedIn, GitHub, and Contact Me */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={profile.linkedIn || 'https://www.linkedin.com/in/subaithal-s-812584426'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-rose-gradient px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-sm"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <a
                href={profile.gitHub || 'https://github.com/Subaithals'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-rose-secondary px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-sm"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <button
                onClick={() => onNavigate('contact')}
                className="btn-rose-secondary px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Contact Me</span>
              </button>
            </div>
          </div>

          {/* Right Column: Visual Frame with Pink Teddy Wearing Graduation Cap */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group">
              {/* Notepad-style tab behind the photo frame */}
              <div className="absolute -top-4 left-6 sm:left-10 px-5 py-1.5 bg-[#8F2547] text-white rounded-t-xl text-[11px] font-heading font-bold uppercase tracking-wider shadow-sm z-0">
                Subaithal's Desk
              </div>

              {/* Main Photo / Teddy Showcase Frame */}
              <div className="relative z-10 glass-card p-4 sm:p-5 rounded-[22px] border-2 border-white/80 shadow-xl max-w-[320px] sm:max-w-[340px] bg-white/40">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#FAD6E1] to-[#E88FA7] border border-white/60 shadow-inner flex items-center justify-center">
                  {profile.photoUrl ? (
                    <img
                      src={profile.photoUrl}
                      alt="Subaithal S."
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    /* Default graduation teddy illustration */
                    <div className="relative w-full h-full flex flex-col items-center justify-center p-3">
                      <img
                        src="/src/assets/images/teddy_grad_cap_1793518818115.jpg"
                        alt="Subaithal's Teddy Bear"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-xl shadow-xs"
                      />
                    </div>
                  )}

                  {/* Wax-Seal Badge at bottom-right corner */}
                  <div className="absolute -bottom-1 -right-1 z-20">
                    <WaxSealBadge />
                  </div>

                  {/* Flower Sprig at top-left corner */}
                  <div className="absolute -top-1 -left-1 z-20 transform -rotate-12 pointer-events-none">
                    <FlowerSprig />
                  </div>
                </div>

                {/* Subtitle caption below photo */}
                <div className="mt-3 text-center">
                  <span className="font-heading font-bold text-sm text-[#3A0F05]">
                    Subaithal S.
                  </span>
                  <p className="text-[11px] text-[#85203F]">
                    {hasEducationSummary ? profile.educationSummary : 'Personal Portfolio'}
                  </p>
                </div>
              </div>

              {/* Floating cute sparkle badge */}
              <div className="absolute -bottom-3 -left-3 z-20 px-3 py-1.5 rounded-full bg-white/90 border border-[#E08FA7] shadow-md flex items-center gap-1.5 text-xs text-[#8F2547] font-semibold animate-teddy-float-delayed">
                <Sparkles className="w-3.5 h-3.5 text-[#C9577B]" />
                <span>Welcome</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Me Section - ONLY renders if filled from Admin dashboard */}
      {hasAboutText && (
        <section className="glass-card p-6 sm:p-8 space-y-4 text-left border border-white/70 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <TeddyBear variant="heading" size={24} />
            <h2 className="font-heading font-extrabold text-2xl text-[#3A0F05] ribbon-underline">
              About Me
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#4F2119] leading-relaxed whitespace-pre-line">
            {profile.aboutText}
          </p>
        </section>
      )}

      {/* Education Summary Box - ONLY renders if filled from Admin dashboard */}
      {hasEducationSummary && (
        <section className="glass-card p-6 sm:p-8 space-y-4 text-left border border-white/70 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TeddyBear variant="heading" size={24} />
              <h2 className="font-heading font-extrabold text-2xl text-[#3A0F05] ribbon-underline">
                Education Summary
              </h2>
            </div>
            <button
              onClick={() => onNavigate('education')}
              className="text-xs font-semibold text-[#8F2547] hover:underline flex items-center gap-1"
            >
              <span>View details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-sm sm:text-base text-[#4F2119] leading-relaxed">
            {profile.educationSummary}
          </p>
        </section>
      )}

      {/* Explore Grid Navigators */}
      <section className="pt-4">
        <div className="flex items-center gap-2 mb-4">
          <TeddyBear variant="heading" size={22} />
          <h3 className="font-heading font-bold text-xl text-[#3A0F05]">
            Quick Navigation
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { id: 'projects' as PageId, title: 'Projects', desc: 'Code & builds' },
            { id: 'certificates' as PageId, title: 'Certificates', desc: 'Credentials' },
            { id: 'experience' as PageId, title: 'Experience', desc: 'Roles & career' },
            { id: 'internships' as PageId, title: 'Internships', desc: 'Training' },
            { id: 'events' as PageId, title: 'Events', desc: 'Conferences' },
            { id: 'skills' as PageId, title: 'Skills', desc: 'Proficiencies' },
            { id: 'education' as PageId, title: 'Education', desc: 'Academics' },
            { id: 'achievements' as PageId, title: 'Achievements', desc: 'Milestones' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="glass-card glass-card-hover p-4 text-left flex flex-col justify-between group transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading font-bold text-sm text-[#3A0F05] group-hover:text-[#8F2547] transition-colors">
                  {item.title}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C9577B] group-hover:translate-x-1 transition-transform" />
              </div>
              <span className="text-[11px] text-[#85203F]">
                {item.desc}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
