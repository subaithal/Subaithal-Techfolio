import React, { useState } from 'react';
import { SUPABASE_SQL_SCRIPT, SUPABASE_SQL_EDITOR_URL } from '../lib/supabase';
import { Copy, Check, X, Database, Cloud, ShieldCheck, ExternalLink } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card max-w-3xl w-full max-h-[90vh] flex flex-col p-6 sm:p-8 relative border border-rose-500/30 bg-[#16060E]/95 shadow-2xl rounded-[24px]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-500/20">
          <div className="flex items-center gap-2.5">
            <TeddyBear variant="heading" size={28} />
            <div>
              <h2 className="font-heading font-extrabold text-xl text-rose-100">
                Supabase SQL & Vercel Deployment Guide
              </h2>
              <p className="text-xs text-rose-300/80">
                Creates database tables (fixes PGRST205), configures public storage, and sets up RLS security.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-rose-900/40 text-rose-300 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-2 mt-4 pb-2 border-b border-rose-500/20 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-rose-700 text-white shadow-sm border border-rose-400/30'
                : 'bg-rose-950/50 text-rose-300 hover:bg-rose-900/50'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase SQL Script (Creates Tables + Storage + RLS)</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'supabase'
                ? 'bg-rose-700 text-white shadow-sm border border-rose-400/30'
                : 'bg-rose-950/50 text-rose-300 hover:bg-rose-900/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Supabase Setup Steps</span>
          </button>

          <button
            onClick={() => setActiveTab('vercel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'vercel'
                ? 'bg-rose-700 text-white shadow-sm border border-rose-400/30'
                : 'bg-rose-950/50 text-rose-300 hover:bg-rose-900/50'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Vercel Multi-Device Setup</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto mt-4 text-xs text-rose-100 space-y-4 pr-1">
          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="bg-rose-950/60 p-4 rounded-2xl border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-rose-100 block">
                    Fixes PGRST205 by creating <code>public.portfolio_certificates</code> and all portfolio tables:
                  </span>
                  <span className="text-[11px] text-rose-300/80 block">
                    1. Copy the script below &rarr; 2. Click "Open Supabase SQL Editor" &rarr; 3. Paste and click "Run".
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={SUPABASE_SQL_EDITOR_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-rose-secondary px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open SQL Editor</span>
                  </a>
                  <button
                    onClick={handleCopySql}
                    className="btn-rose-gradient px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied SQL!' : 'Copy SQL Script'}</span>
                  </button>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-rose-500/30 bg-[#0E040A] text-rose-200 font-mono text-[11px] p-4 max-h-[380px] overflow-y-auto">
                <pre>{SUPABASE_SQL_SCRIPT}</pre>
              </div>
            </div>
          )}

          {activeTab === 'supabase' && (
            <div className="space-y-3 bg-rose-950/50 p-5 rounded-2xl border border-rose-500/30">
              <h4 className="font-heading font-bold text-sm text-rose-200">
                Step-by-Step Supabase Setup:
              </h4>
              <ol className="list-decimal pl-4 space-y-3 text-xs text-rose-200/90 leading-relaxed">
                <li>
                  <strong>Create a Supabase Project:</strong> Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-rose-300 underline font-semibold">supabase.com</a>, log in or sign up, and create a new project.
                </li>
                <li>
                  <strong>Run the SQL Query:</strong> Click <strong>SQL Editor</strong> &rarr; <strong>New query</strong> in your Supabase dashboard. Paste the SQL script from the SQL tab and click <strong>Run</strong>.
                </li>
                <li>
                  <strong>Create or Verify the Storage Bucket:</strong> In the Supabase sidebar, go to <strong>Storage</strong>. Verify the bucket <strong>portfolio-assets</strong> is listed. If not created, click <strong>New bucket</strong>, name it <code>portfolio-assets</code>, and toggle <strong>Public bucket</strong> to <strong>ON</strong>.
                </li>
                <li>
                  <strong>Create Your Admin User:</strong> Go to <strong>Authentication &rarr; Users</strong>. Click <strong>Add user &rarr; Create user</strong>. Enter email <code>subaithalnowfie@gmail.com</code> and your private password. Disable public signup in <em>Authentication &rarr; Providers / Settings</em> so nobody else can register.
                </li>
                <li>
                  <strong>Copy API Keys:</strong> Go to <strong>Project Settings &rarr; API</strong>. Copy the <strong>Project URL</strong> and <strong>anon public key</strong>.
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'vercel' && (
            <div className="space-y-3 bg-rose-950/50 p-5 rounded-2xl border border-rose-500/30">
              <h4 className="font-heading font-bold text-sm text-rose-200">
                Vercel Setup for Permanent Multi-Device Access:
              </h4>
              <p className="text-xs text-rose-300">
                To ensure all certificates and portfolio data are visible to every visitor on any phone, laptop, or browser without needing local configuration:
              </p>
              <ol className="list-decimal pl-4 space-y-3 text-xs text-rose-200/90 leading-relaxed">
                <li>
                  Go to your project on <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-rose-300 underline font-semibold">vercel.com</a> &rarr; <strong>Settings &rarr; Environment Variables</strong>.
                </li>
                <li>
                  Add these two variables (from your Supabase API settings):
                  <div className="my-2 bg-[#0E040A] text-rose-300 p-3 rounded-xl font-mono text-[11px] space-y-1.5 border border-rose-500/30">
                    <div><strong>VITE_SUPABASE_URL</strong> = https://your-project.supabase.co</div>
                    <div><strong>VITE_SUPABASE_ANON_KEY</strong> = eyJhbGciOi...</div>
                  </div>
                </li>
                <li>
                  Click <strong>Deployments &rarr; Redeploy</strong> (or push a new commit to GitHub). Once deployed, Vercel will bake the Supabase connection directly into the client, making your published certificates visible to everyone in the world!
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-rose-500/20 flex items-center justify-end">
          <button
            onClick={onClose}
            className="btn-rose-secondary px-5 py-2 rounded-full text-xs font-semibold cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
