import React, { useState } from 'react';
import { SUPABASE_SQL_SCRIPT } from '../lib/supabase';
import { Copy, Check, X, Database, Cloud, Terminal, ShieldCheck } from 'lucide-react';
import { TeddyBear } from './TeddyBear';

interface SqlAndDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlAndDeploymentModal: React.FC<SqlAndDeploymentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'vercel' | 'supabase'>('sql');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-card max-w-3xl w-full max-h-[90vh] flex flex-col p-6 sm:p-8 relative border-2 border-white/70 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/50">
          <div className="flex items-center gap-2.5">
            <TeddyBear variant="heading" size={28} />
            <div>
              <h2 className="font-heading font-extrabold text-xl text-[#3A0F05]">
                Supabase SQL & Vercel Deployment Guide
              </h2>
              <p className="text-xs text-[#85203F]">
                Everything you need to connect your real Supabase database and launch live
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-[#85203F]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-2 mt-4 pb-2 border-b border-white/40 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'sql'
                ? 'bg-[#8F2547] text-white shadow-sm'
                : 'bg-white/50 text-[#3A0F05] hover:bg-white/80'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase SQL Script (RLS + Tables)</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'supabase'
                ? 'bg-[#8F2547] text-white shadow-sm'
                : 'bg-white/50 text-[#3A0F05] hover:bg-white/80'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Supabase Setup Steps</span>
          </button>

          <button
            onClick={() => setActiveTab('vercel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'vercel'
                ? 'bg-[#8F2547] text-white shadow-sm'
                : 'bg-white/50 text-[#3A0F05] hover:bg-white/80'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Vercel Deployment Guide</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto mt-4 text-xs text-[#3A0F05] space-y-4 pr-1">
          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white/60 p-3 rounded-2xl border border-white/80">
                <span className="text-xs text-[#4F2119]">
                  Copy this complete schema to run in your <strong>Supabase SQL Editor</strong>. It sets up all 11 tables, storage bucket, and strict Row Level Security (public read for published items, admin-only write).
                </span>
                <button
                  onClick={handleCopySql}
                  className="btn-rose-gradient px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 ml-3"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied SQL!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-black/10 bg-[#231A24] text-pink-100 font-mono text-[11px] p-4 max-h-[380px] overflow-y-auto">
                <pre>{SUPABASE_SQL_SCRIPT}</pre>
              </div>
            </div>
          )}

          {activeTab === 'supabase' && (
            <div className="space-y-3 bg-white/50 p-5 rounded-2xl border border-white/80">
              <h4 className="font-heading font-bold text-sm text-[#8F2547]">
                Step-by-Step Supabase Setup:
              </h4>
              <ol className="list-decimal pl-4 space-y-2.5 text-xs text-[#4F2119]/90 leading-relaxed">
                <li>
                  <strong>Create a Supabase Project:</strong> Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#8F2547] underline font-semibold">supabase.com</a>, log in or sign up, and click <strong>"New Project"</strong>. Choose a name (e.g. <code>subaithal-portfolio</code>) and a database password.
                </li>
                <li>
                  <strong>Run the Database SQL:</strong> In your Supabase project sidebar, click on <strong>SQL Editor</strong> &rarr; <strong>"New Query"</strong>. Paste the SQL script from the SQL tab above, and click <strong>"Run"</strong>.
                </li>
                <li>
                  <strong>Get Your API Credentials:</strong> In Supabase sidebar, go to <strong>Project Settings &rarr; API</strong>. Copy the <strong>Project URL</strong> and the <strong>anon / public key</strong>.
                </li>
                <li>
                  <strong>Enter Them in the Dashboard:</strong> Click <strong>"Supabase Connection"</strong> inside the Admin Dashboard and paste both values. Your portfolio is now permanently backed by your live Supabase database!
                </li>
                <li>
                  <strong>Admin Account:</strong> In <strong>Authentication &rarr; Users</strong>, click <strong>"Add User"</strong> &rarr; <strong>"Create User"</strong> with your email <code>subaithalnowfie@gmail.com</code> and a secure password. Disable public signup in <em>Auth &rarr; Settings</em> to guarantee nobody else can register.
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'vercel' && (
            <div className="space-y-3 bg-white/50 p-5 rounded-2xl border border-white/80">
              <h4 className="font-heading font-bold text-sm text-[#8F2547]">
                Beginner-Friendly Vercel Deployment:
              </h4>
              <ol className="list-decimal pl-4 space-y-2.5 text-xs text-[#4F2119]/90 leading-relaxed">
                <li>
                  <strong>Push code to GitHub:</strong> Ensure your repository on GitHub (<a href="https://github.com/Subaithals" target="_blank" rel="noreferrer" className="text-[#8F2547] underline font-semibold">github.com/Subaithals</a>) contains the portfolio code.
                </li>
                <li>
                  <strong>Sign in to Vercel:</strong> Visit <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-[#8F2547] underline font-semibold">vercel.com</a> and sign in with your GitHub account.
                </li>
                <li>
                  <strong>Import Git Repository:</strong> Click <strong>"Add New..." &rarr; "Project"</strong>, locate your repository, and click <strong>Import</strong>.
                </li>
                <li>
                  <strong>Configure Environment Variables:</strong> Under <em>Environment Variables</em>, add:
                  <div className="my-2 bg-[#2D1B28] text-pink-100 p-2.5 rounded-xl font-mono text-[11px] space-y-1">
                    <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
                    <div>VITE_SUPABASE_ANON_KEY=eyJhbGciOi...</div>
                  </div>
                </li>
                <li>
                  <strong>Click Deploy:</strong> Vercel will build and assign you a free fast HTTPS domain (e.g. <code>subaithal.vercel.app</code>) with instant global CDN caching and automatic updates whenever you push changes!
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-white/50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="btn-rose-secondary px-5 py-2 rounded-full text-xs font-semibold"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
