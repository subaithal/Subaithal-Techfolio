import React from 'react';
import { TeddyBear } from './TeddyBear';
import { PageId } from './Navigation';
import { Github, Linkedin, Mail, Heart, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full mt-20 pt-12 pb-10 border-t border-white/50 bg-[#F7D0DA]/60 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        {/* Cute Teddy Bear with gentle floating animation */}
        <div className="mb-4">
          <div className="p-3 bg-white/70 rounded-full shadow-sm border border-white/80 inline-flex items-center justify-center">
            <TeddyBear variant="footer" size={36} animated />
          </div>
        </div>

        {/* Wordmark and warm tagline */}
        <h3 className="font-heading font-extrabold text-xl text-[#3A0F05] tracking-tight">
          Subaithal S.
        </h3>
        <p className="text-xs text-[#85203F] max-w-sm mt-1">
          Designed with soft rose tones, gentle animations, and attention to every detail.
        </p>

        {/* Social Links */}
        <div className="flex items-center gap-3 mt-5">
          <a
            href="https://www.linkedin.com/in/subaithal-s-812584426"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Subaithal LinkedIn Profile"
            className="p-2.5 rounded-full bg-white/70 hover:bg-white text-[#8F2547] border border-white/80 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <a
            href="https://github.com/Subaithals"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Subaithal GitHub Profile"
            className="p-2.5 rounded-full bg-white/70 hover:bg-white text-[#8F2547] border border-white/80 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <Github className="w-4 h-4" />
          </a>
          <a
            href="mailto:subaithalnowfie@gmail.com"
            aria-label="Email Subaithal"
            className="p-2.5 rounded-full bg-white/70 hover:bg-white text-[#8F2547] border border-white/80 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <Mail className="w-4 h-4" />
          </a>
        </div>

        {/* Bottom row: copyright & discreet Admin entrance */}
        <div className="mt-8 pt-6 border-t border-[#E08FA7]/40 w-full flex flex-col sm:flex-row items-center justify-between text-xs text-[#4F2119]/80 gap-3">
          <div className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} Subaithal S. Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-[#A93A5C] fill-[#A93A5C]" />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                onNavigate('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-[#85203F] hover:text-[#8F2547] underline underline-offset-2"
            >
              Get in Touch
            </button>
            <span className="text-white/40">·</span>
            <button
              onClick={() => {
                onNavigate('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1 text-[11px] text-[#85203F]/70 hover:text-[#8F2547] transition-colors"
            >
              <Lock className="w-3 h-3" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
