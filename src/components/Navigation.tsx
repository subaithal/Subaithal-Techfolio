import React, { useState } from 'react';
import { Menu, X, Sparkles, Send, Shield } from 'lucide-react';

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
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#14060E]/85 border-b border-rose-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-xl px-2 py-1 -ml-2 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8E183D] to-[#D4436E] flex items-center justify-center text-white shadow-sm shadow-rose-950/60 font-heading font-extrabold text-sm border border-rose-400/30">
            S
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-lg sm:text-xl text-rose-50 tracking-tight group-hover:text-rose-300 transition-colors whitespace-nowrap">
              Subaithal S.
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-sm font-medium">
          {visibleNavItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 rounded-full text-xs xl:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#8E183D] to-[#D4436E] text-white shadow-md shadow-rose-950/50'
                    : 'text-rose-200/80 hover:text-white hover:bg-white/10'
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
            className="hidden sm:inline-flex items-center gap-1.5 btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase shadow-sm cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Contact Me</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-rose-100 border border-rose-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-rose-300" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bg-[#170610]/95 backdrop-blur-2xl border-b border-rose-500/25 shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto z-50 p-4 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-rose-900/40 text-xs font-semibold text-rose-300 uppercase tracking-wider">
            <span>Explore Portfolio</span>
            <div className="flex items-center gap-1 text-[11px] text-rose-400">
              <Sparkles className="w-3 h-3 text-rose-400" />
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
                  className={`flex items-center justify-start px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#8E183D] to-[#D4436E] text-white shadow-md'
                      : 'bg-white/5 text-rose-200 hover:bg-white/10 active:bg-white/15 border border-rose-900/40'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 mt-3 border-t border-rose-900/40 flex items-center justify-between">
            <button
              onClick={() => handleNavClick('admin')}
              className="text-xs text-rose-300/80 hover:text-rose-200 flex items-center gap-1 font-medium cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Access</span>
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold cursor-pointer"
            >
              Contact Me
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
