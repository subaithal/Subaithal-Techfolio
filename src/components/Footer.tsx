import React from 'react';
import { PageId } from './Navigation';
import { Github, Linkedin, Mail, Heart, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full mt-24 pt-12 pb-10 border-t border-rose-500/15 bg-[#10040B]/85 backdrop-blur-md text-rose-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        {/* Brand emblem */}
        <div className="mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8E183D] to-[#D4436E] flex items-center justify-center text-white shadow-md shadow-rose-950/60 font-heading font-black text-lg border border-rose-400/30">
            S
          </div>
        </div>

        {/* Wordmark and tagline */}
        <h3 className="font-heading font-extrabold text-xl text-rose-50 tracking-tight">
          Subaithal S.
        </h3>
        <p className="text-xs text-rose-300/80 max-w-sm mt-1">
          Engineering, software innovation, and professional achievements.
        </p>

        {/* Social Links */}
        <div className="flex items-center gap-3 mt-5">
          <a
            href="https://www.linkedin.com/in/subaithal-s-812584426"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Subaithal LinkedIn Profile"
            className="p-2.5 rounded-full bg-white/5 hover:bg-rose-900/40 text-rose-200 hover:text-white border border-rose-500/20 transition-all hover:-translate-y-0.5"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <a
            href="https://github.com/Subaithals"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Subaithal GitHub Profile"
            className="p-2.5 rounded-full bg-white/5 hover:bg-rose-900/40 text-rose-200 hover:text-white border border-rose-500/20 transition-all hover:-translate-y-0.5"
          >
            <Github className="w-4 h-4" />
          </a>
          <a
            href="mailto:subaithalnowfie@gmail.com"
            aria-label="Email Subaithal"
            className="p-2.5 rounded-full bg-white/5 hover:bg-rose-900/40 text-rose-200 hover:text-white border border-rose-500/20 transition-all hover:-translate-y-0.5"
          >
            <Mail className="w-4 h-4" />
          </a>
        </div>

        {/* Bottom row: copyright & discreet Admin entrance */}
        <div className="mt-8 pt-6 border-t border-rose-900/30 w-full flex flex-col sm:flex-row items-center justify-between text-xs text-rose-300/70 gap-3">
          <div className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} Subaithal S. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                onNavigate('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-rose-300 hover:text-rose-100 underline underline-offset-2 cursor-pointer"
            >
              Get in Touch
            </button>
            <span className="text-rose-800">·</span>
            <button
              onClick={() => {
                onNavigate('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1 text-[11px] text-rose-400/60 hover:text-rose-200 transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
