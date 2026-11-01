import React, { useState } from 'react';
import { TeddyBear } from './TeddyBear';
import { Menu, X, Sparkles, Send } from 'lucide-react';

export type PageId =
  | 'home'
  | 'projects'
  | 'certificates'
  | 'experience'
  | 'internships'
  | 'events'
  | 'skills'
  | 'education'
  | 'achievements'
  | 'resume'
  | 'contact'
  | 'admin';

interface NavigationProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  hiddenSections?: Record<string, boolean>;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
  hiddenSections = {},
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: PageId; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'projects', label: 'Projects' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'experience', label: 'Experience' },
    { id: 'internships', label: 'Internships' },
    { id: 'events', label: 'Events' },
    { id: 'skills', label: 'Skills' },
    { id: 'education', label: 'Education' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'resume', label: 'Resume' },
    { id: 'contact', label: 'Contact' },
  ];

  // Filter out any section marked hidden in site settings (except home & contact)
  const visibleNavItems = navItems.filter(item => {
    if (item.id === 'home' || item.id === 'contact') return true;
    return !hiddenSections[item.id];
  });

  const handleNavClick = (id: PageId) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#EBA3B8]/90 border-b border-white/40 shadow-[0_4px_20px_-4px_rgba(143,37,71,0.1)] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8F2547] rounded-xl px-2 py-1 -ml-2"
        >
          <TeddyBear variant="heading" size={30} animated />
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-lg sm:text-xl text-[#3A0F05] tracking-tight group-hover:text-[#8F2547] transition-colors whitespace-nowrap">
              Subaithal S.
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium">
          {visibleNavItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 rounded-full text-xs xl:text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#8F2547] text-white shadow-[0_2px_10px_rgba(143,37,71,0.35)]'
                    : 'text-[#4F2119] hover:text-[#8F2547] hover:bg-white/40'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Button & Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
          {/* Quick Contact CTA */}
          <button
            onClick={() => handleNavClick('contact')}
            className="hidden sm:inline-flex items-center gap-1.5 btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Contact Me</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-white/60 hover:bg-white/80 text-[#3A0F05] border border-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8F2547]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#8F2547]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bg-[#F7D0DA]/95 backdrop-blur-xl border-b border-white/60 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto z-50 p-4 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E08FA7]/50 text-xs font-semibold text-[#85203F] uppercase tracking-wider">
            <span>Explore Portfolio</span>
            <div className="flex items-center gap-1 text-[11px] text-[#A93A5C]">
              <Sparkles className="w-3 h-3 text-[#A93A5C]" />
              <span>Subaithal S.</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {visibleNavItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-start px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    isActive
                      ? 'bg-[#8F2547] text-white shadow-md'
                      : 'bg-white/50 text-[#3A0F05] hover:bg-white/80 active:bg-white/90 border border-white/40'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 mt-3 border-t border-[#E08FA7]/50 flex items-center justify-between">
            <button
              onClick={() => handleNavClick('admin')}
              className="text-xs text-[#85203F] hover:text-[#8F2547] underline underline-offset-4 font-medium"
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold"
            >
              Contact Me
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
