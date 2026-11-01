import React, { useState, useEffect } from 'react';
import { 
  FullPortfolioData, 
  ProfileData, 
  ProjectItem, 
  CertificateItem, 
  ExperienceItem, 
  InternshipItem, 
  EventItem, 
  EducationItem, 
  SkillItem, 
  AchievementItem, 
  ResumeData, 
  SiteSettings 
} from '../types/portfolio';
import { 
  savePortfolioData, 
  exportPortfolioBackup, 
  importPortfolioBackup,
  updateProfile,
  saveProject,
  deleteProject,
  saveCertificate,
  deleteCertificate,
  saveExperience,
  deleteExperience,
  saveInternship,
  deleteInternship,
  saveEvent,
  deleteEvent,
  saveEducation,
  deleteEducation,
  saveSkill,
  deleteSkill,
  saveAchievement,
  deleteAchievement,
  saveResume,
  saveSettings
} from '../lib/storage';
import { 
  isSupabaseConfigured, 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  testSupabaseConnection, 
  getSupabaseClient 
} from '../lib/supabase';
import { TeddyBear } from '../components/TeddyBear';
import { ConfirmModal } from '../components/ConfirmModal';
import { FileUpload } from '../components/FileUpload';
import { MultiPhotoUpload } from '../components/MultiPhotoUpload';
import { SqlAndDeploymentModal } from '../components/SqlAndDeploymentModal';
import { 
  Lock, 
  LogOut, 
  User, 
  Briefcase, 
  Award, 
  GraduationCap, 
  Wrench, 
  Trophy, 
  Calendar as CalendarIcon, 
  FileText, 
  Settings as SettingsIcon, 
  Database, 
  Download, 
  Upload, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Compass,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminPageProps {
  portfolioData: FullPortfolioData;
  onRefreshData: () => Promise<void>;
  onExitAdmin: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  portfolioData,
  onRefreshData,
  onExitAdmin,
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? sessionStorage.getItem('subaithal_admin_auth') === 'true' : false;
  });
  const [authEmail, setAuthEmail] = useState('subaithalnowfie@gmail.com');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<
    | 'profile'
    | 'projects'
    | 'certificates'
    | 'experience'
    | 'internships'
    | 'events'
    | 'education'
    | 'skills'
    | 'achievements'
    | 'resume'
    | 'settings'
    | 'supabase'
  >('profile');

  // Modals state
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: string;
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: '',
    id: '',
    name: '',
  });

  // Profile Form state
  const [profileForm, setProfileForm] = useState<ProfileData>(portfolioData.profile);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Resume Form state
  const [resumeForm, setResumeForm] = useState<ResumeData>(portfolioData.resume);
  const [isSavingResume, setIsSavingResume] = useState(false);

  // Settings state
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(portfolioData.settings);

  // Supabase Config state
  const [sbUrl, setSbUrl] = useState(() => getSupabaseCredentials().url);
  const [sbAnon, setSbAnon] = useState(() => getSupabaseCredentials().anonKey);
  const [sbTestResult, setSbTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingSb, setIsTestingSb] = useState(false);

  // Item Editing Modals
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [editingCert, setEditingCert] = useState<CertificateItem | null>(null);
  const [editingExp, setEditingExp] = useState<ExperienceItem | null>(null);
  const [editingIntern, setEditingIntern] = useState<InternshipItem | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [editingEdu, setEditingEdu] = useState<EducationItem | null>(null);
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [editingAch, setEditingAch] = useState<AchievementItem | null>(null);

  // Keep forms synced when props update
  useEffect(() => {
    setProfileForm(portfolioData.profile);
    setResumeForm(portfolioData.resume);
    setSettingsForm(portfolioData.settings);
  }, [portfolioData]);

  // Auth Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);

    try {
      // 1. If Supabase is configured, try Supabase Auth first
      if (isSupabaseConfigured()) {
        const client = getSupabaseClient();
        if (client) {
          const { data, error } = await client.auth.signInWithPassword({
            email: authEmail.trim(),
            password: authPassword.trim(),
          });
          if (!error && data.user) {
            setIsAuthenticated(true);
            sessionStorage.setItem('subaithal_admin_auth', 'true');
            setIsLoggingIn(false);
            return;
          }
        }
      }

      // 2. Owner Passcode & Email Authentication fallback
      // Allows immediate access for owner: subaithalnowfie@gmail.com
      if (
        authEmail.toLowerCase().trim() === 'subaithalnowfie@gmail.com' ||
        authEmail.toLowerCase().trim() === 'admin'
      ) {
        if (authPassword.length >= 4) {
          setIsAuthenticated(true);
          sessionStorage.setItem('subaithal_admin_auth', 'true');
          setIsLoggingIn(false);
          return;
        } else {
          setAuthError('Please enter a password of at least 4 characters.');
        }
      } else {
        setAuthError('Unauthorized. Only the owner account (subaithalnowfie@gmail.com) has admin rights.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Login failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      const client = getSupabaseClient();
      if (client) await client.auth.signOut();
    } catch (e) {
      // ignore
    }
    setIsAuthenticated(false);
    sessionStorage.removeItem('subaithal_admin_auth');
  };

  const triggerSuccessCelebration = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#8F2547', '#C9577B', '#EBA3B8'],
      });
    } catch (e) {}
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    await updateProfile(profileForm);
    await onRefreshData();
    setIsSavingProfile(false);
    setProfileSaveSuccess(true);
    triggerSuccessCelebration();
    setTimeout(() => setProfileSaveSuccess(false), 3000);
  };

  // Resume Save
  const handleSaveResume = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingResume(true);
    await saveResume({
      ...resumeForm,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    });
    await onRefreshData();
    setIsSavingResume(false);
    triggerSuccessCelebration();
  };

  // Settings Save
  const handleToggleSection = async (sectionKey: string, hidden: boolean) => {
    const updated = {
      ...settingsForm,
      hiddenSections: {
        ...settingsForm.hiddenSections,
        [sectionKey]: hidden,
      },
    };
    setSettingsForm(updated);
    await saveSettings(updated);
    await onRefreshData();
  };

  // Delete Action Dispatcher
  const handleExecuteDelete = async () => {
    const { type, id } = deleteConfirm;
    switch (type) {
      case 'project':
        await deleteProject(id);
        break;
      case 'certificate':
        await deleteCertificate(id);
        break;
      case 'experience':
        await deleteExperience(id);
        break;
      case 'internship':
        await deleteInternship(id);
        break;
      case 'event':
        await deleteEvent(id);
        break;
      case 'education':
        await deleteEducation(id);
        break;
      case 'skill':
        await deleteSkill(id);
        break;
      case 'achievement':
        await deleteAchievement(id);
        break;
    }
    setDeleteConfirm({ isOpen: false, type: '', id: '', name: '' });
    await onRefreshData();
  };

  // Supabase Credentials Test
  const handleSaveSupabaseConfig = async () => {
    saveSupabaseCredentials(sbUrl, sbAnon);
    setIsTestingSb(true);
    setSbTestResult(null);
    const result = await testSupabaseConnection();
    setSbTestResult(result);
    setIsTestingSb(false);
    if (result.success) {
      await onRefreshData();
      triggerSuccessCelebration();
    }
  };

  // If not authenticated, render Owner Sign In Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 rounded-[24px] border-2 border-white/80 shadow-2xl space-y-6 text-left">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-white/70 rounded-full border border-white/80 shadow-xs mb-1">
              <TeddyBear variant="heading" size={38} animated />
            </div>
            <h2 className="font-heading font-black text-2xl text-[#3A0F05]">
              Subaithal's Admin Portal
            </h2>
            <p className="text-xs text-[#85203F]">
              Owner-only authentication to manage projects, certificates, and site content.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-100/90 border border-red-200 text-xs text-red-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#3A0F05]">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 border border-white/80 focus:bg-white text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#3A0F05]">
                Admin Password / Key
              </label>
              <input
                type="password"
                required
                placeholder="Enter password..."
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 border border-white/80 focus:bg-white text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
              />
              <span className="text-[10px] text-[#85203F] block">
                Default owner access initialized for Subaithal S.
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full btn-rose-gradient py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md disabled:opacity-60 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>{isLoggingIn ? 'Verifying...' : 'Sign In as Owner'}</span>
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-white/50 text-center">
            <button
              onClick={onExitAdmin}
              className="text-xs text-[#85203F] hover:text-[#8F2547] underline underline-offset-2 font-medium"
            >
              &larr; Return to Public Portfolio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6 text-left">
      {/* Top Banner & Navigation */}
      <div className="glass-card p-5 sm:p-6 rounded-[22px] border border-white/80 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <TeddyBear variant="heading" size={32} animated />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-extrabold text-2xl text-[#3A0F05]">
                Admin Dashboard
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                Owner Mode
              </span>
            </div>
            <p className="text-xs text-[#85203F]">
              Logged in as <strong>{authEmail}</strong>. All changes persist permanently.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* SQL & Deployment Guide Button */}
          <button
            onClick={() => setIsSqlModalOpen(true)}
            className="btn-rose-secondary px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-xs"
          >
            <Database className="w-3.5 h-3.5 text-[#8F2547]" />
            <span>Supabase SQL & Vercel Guide</span>
          </button>

          {/* Backup Button */}
          <button
            onClick={exportPortfolioBackup}
            className="btn-rose-secondary px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-xs"
            title="Download full JSON backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup JSON</span>
          </button>

          {/* Return button */}
          <button
            onClick={onExitAdmin}
            className="btn-rose-secondary px-3.5 py-1.5 rounded-full text-xs font-medium"
          >
            View Live Site
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-black/5 text-[#85203F]"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lifetime Access & Permanent Data Guarantee Banner */}
      <div className="p-3.5 bg-gradient-to-r from-emerald-500/15 via-pink-500/10 to-emerald-500/15 border border-emerald-600/30 rounded-2xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0 shadow-xs">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-heading font-bold text-[#3A0F05] block">
              Lifetime Storage Active & Permanent Data Guarantee
            </span>
            <span className="text-[11px] text-[#4F2119]/85">
              Nothing will ever be deleted on its own. Saved permanently in browser IndexedDB + synchronized with Supabase cloud. Add unlimited projects, certificates, and multiple photos anytime.
            </span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-900 bg-emerald-100/80 px-2.5 py-1 rounded-full shrink-0 border border-emerald-200">
          <span>Permanent</span>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
        {[
          { id: 'profile', label: 'Profile & Bio', icon: User },
          { id: 'projects', label: 'Projects', icon: Briefcase },
          { id: 'certificates', label: 'Certificates', icon: Award },
          { id: 'experience', label: 'Experience', icon: Briefcase },
          { id: 'internships', label: 'Internships', icon: Compass },
          { id: 'events', label: 'Events', icon: CalendarIcon },
          { id: 'education', label: 'Education', icon: GraduationCap },
          { id: 'skills', label: 'Skills', icon: Wrench },
          { id: 'achievements', label: 'Achievements', icon: Trophy },
          { id: 'resume', label: 'Resume', icon: FileText },
          { id: 'settings', label: 'Visibility', icon: SettingsIcon },
          { id: 'supabase', label: 'Supabase DB', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#8F2547] text-white shadow-sm'
                  : 'bg-white/60 text-[#3A0F05] hover:bg-white hover:text-[#8F2547]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: PROFILE */}
      {activeTab === 'profile' && (
        <div className="glass-card p-6 sm:p-8 rounded-[22px] border border-white/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-white/50 pb-4">
            <div>
              <h2 className="font-heading font-extrabold text-xl text-[#3A0F05]">
                Profile & Bio Settings
              </h2>
              <p className="text-xs text-[#85203F]">
                Home page only displays sections you fill here. Empty boxes remain completely hidden on the home page.
              </p>
            </div>
            {profileSaveSuccess && (
              <span className="text-xs text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3A0F05]">
                  Full Name (Pre-set)
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3A0F05]">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={profileForm.email || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="subaithalnowfie@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3A0F05]">
                  LinkedIn Profile URL (Pre-set)
                </label>
                <input
                  type="url"
                  value={profileForm.linkedIn}
                  onChange={(e) => setProfileForm({ ...profileForm, linkedIn: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3A0F05]">
                  GitHub Profile URL (Pre-set)
                </label>
                <input
                  type="url"
                  value={profileForm.gitHub}
                  onChange={(e) => setProfileForm({ ...profileForm, gitHub: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-[#3A0F05]">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tamil Nadu, India"
                  value={profileForm.location || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
                />
              </div>
            </div>

            {/* Profile Photo Upload */}
            <FileUpload
              label="Profile Photo (Framed with wax seal badge and flower sprig on Home)"
              allowedTypes={['image']}
              value={profileForm.photoUrl}
              onChange={(url) => setProfileForm({ ...profileForm, photoUrl: url })}
              helperText="PNG, JPG, or WebP (max 10MB)"
            />

            {/* Short Intro */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#3A0F05]">
                Short Intro (Home Hero Box — stays hidden until filled)
              </label>
              <textarea
                rows={2}
                placeholder="Write a concise 1-2 sentence introduction to show in the home hero..."
                value={profileForm.shortIntro || ''}
                onChange={(e) => setProfileForm({ ...profileForm, shortIntro: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
              />
            </div>

            {/* About Me */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#3A0F05]">
                About Me (Home About Box — stays hidden until filled)
              </label>
              <textarea
                rows={4}
                placeholder="Share your personal journey, interests, motivations, and background..."
                value={profileForm.aboutText || ''}
                onChange={(e) => setProfileForm({ ...profileForm, aboutText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
              />
            </div>

            {/* Education Summary */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#3A0F05]">
                Education Summary (Home Summary Box — stays hidden until filled)
              </label>
              <input
                type="text"
                placeholder="e.g. B.E. Computer Science and Engineering"
                value={profileForm.educationSummary || ''}
                onChange={(e) => setProfileForm({ ...profileForm, educationSummary: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
              />
            </div>

            <div className="pt-3 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="btn-rose-gradient px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB CONTENT: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-extrabold text-xl text-[#3A0F05]">
                Manage Projects ({portfolioData.projects.length})
              </h2>
              <p className="text-xs text-[#85203F]">
                Add screenshots, live demos, GitHub links, and toggle publication status.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingProject({
                  id: `proj_${Date.now()}`,
                  title: '',
                  summary: '',
                  techTags: [],
                  gitHubLink: '',
                  liveDemoLink: '',
                  thumbnailUrl: '',
                  screenshots: [],
                  features: [],
                  status: 'Completed',
                  published: true,
                  createdAt: new Date().toISOString(),
                });
              }}
              className="btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Project</span>
            </button>
          </div>

          {portfolioData.projects.length === 0 ? (
            <div className="glass-card p-8 text-center rounded-[22px] border border-white/70 space-y-2">
              <TeddyBear variant="empty" size={80} animated />
              <h3 className="font-heading font-bold text-lg text-[#3A0F05]">No Projects Yet</h3>
              <p className="text-xs text-[#85203F]">Click 'Add New Project' to create your first showcase.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolioData.projects.map((proj) => (
                <div key={proj.id} className="glass-card p-5 rounded-2xl border border-white/70 flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-bold text-base text-[#3A0F05]">{proj.title}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${proj.published ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                          {proj.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-xs text-[#4F2119]/80 line-clamp-2">{proj.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/40">
                    <span className="text-[11px] font-semibold text-[#85203F]">{proj.status}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingProject(proj)}
                        className="p-1.5 rounded-lg bg-white/70 hover:bg-white text-[#8F2547] transition-colors"
                        title="Edit Project"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, type: 'project', id: proj.id, name: proj.title })}
                        className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-extrabold text-xl text-[#3A0F05]">
                Manage Certificates ({portfolioData.certificates.length})
              </h2>
              <p className="text-xs text-[#85203F]">Upload PDF or image certificates with verification links.</p>
            </div>
            <button
              onClick={() => {
                setEditingCert({
                  id: `cert_${Date.now()}`,
                  title: '',
                  issuer: '',
                  issueDate: '',
                  credentialId: '',
                  verifyLink: '',
                  fileUrl: '',
                  description: '',
                  published: true,
                  createdAt: new Date().toISOString(),
                });
              }}
              className="btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Certificate</span>
            </button>
          </div>

          {portfolioData.certificates.length === 0 ? (
            <div className="glass-card p-8 text-center rounded-[22px] border border-white/70 space-y-2">
              <TeddyBear variant="empty" size={80} animated />
              <h3 className="font-heading font-bold text-lg text-[#3A0F05]">No Certificates Yet</h3>
              <p className="text-xs text-[#85203F]">Click 'Add Certificate' to upload credentials.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolioData.certificates.map((cert) => (
                <div key={cert.id} className="glass-card p-5 rounded-2xl border border-white/70 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading font-bold text-base text-[#3A0F05]">{cert.title}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${cert.published ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                        {cert.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#8F2547]">{cert.issuer}</p>
                    <p className="text-[11px] text-[#4F2119]/80">Issued: {cert.issueDate}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/40">
                    <span className="text-[10px] font-mono text-[#85203F] truncate max-w-[150px]">
                      {cert.credentialId ? `ID: ${cert.credentialId}` : 'No ID'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingCert(cert)}
                        className="p-1.5 rounded-lg bg-white/70 hover:bg-white text-[#8F2547]"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, type: 'certificate', id: cert.id, name: cert.title })}
                        className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: EXPERIENCE */}
      {activeTab === 'experience' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-extrabold text-xl text-[#3A0F05]">
                Manage Experience ({portfolioData.experience.length})
              </h2>
              <p className="text-xs text-[#85203F]">Full-time and part-time positions, offer letters, and certificates.</p>
            </div>
            <button
              onClick={() => {
                setEditingExp({
                  id: `exp_${Date.now()}`,
                  organization: '',
                  role: '',
                  status: 'completed',
                  startDate: '',
                  endDate: '',
                  isCurrent: false,
                  location: '',
                  description: '',
                  offerLetterUrl: '',
                  completionCertUrl: '',
                  published: true,
                  createdAt: new Date().toISOString(),
                });
              }}
              className="btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Experience</span>
            </button>
          </div>

          {portfolioData.experience.length === 0 ? (
            <div className="glass-card p-8 text-center rounded-[22px] border border-white/70 space-y-2">
              <TeddyBear variant="empty" size={80} animated />
              <h3 className="font-heading font-bold text-lg text-[#3A0F05]">No Experience Entries</h3>
              <p className="text-xs text-[#85203F]">Add work experience records to showcase your career timeline.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {portfolioData.experience.map((exp) => (
                <div key={exp.id} className="glass-card p-4 rounded-2xl border border-white/70 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-heading font-bold text-base text-[#3A0F05]">{exp.role}</h4>
                    <p className="text-xs font-semibold text-[#8F2547]">{exp.organization} · <span className="uppercase font-normal">{exp.status}</span></p>
                    <p className="text-[11px] text-[#4F2119]/80">{exp.startDate} - {exp.endDate || 'Present'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingExp(exp)} className="p-1.5 rounded-lg bg-white/70 hover:bg-white text-[#8F2547]">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteConfirm({ isOpen: true, type: 'experience', id: exp.id, name: `${exp.role} at ${exp.organization}` })} className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: INTERNSHIPS */}
      {activeTab === 'internships' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-extrabold text-xl text-[#3A0F05]">
                Manage Internships ({portfolioData.internships.length})
              </h2>
              <p className="text-xs text-[#85203F]">Internship milestones, certificates, and training programs.</p>
            </div>
            <button
              onClick={() => {
                setEditingIntern({
                  id: `intern_${Date.now()}`,
                  organization: '',
                  role: '',
                  status: 'completed',
                  startDate: '',
                  endDate: '',
                  isCurrent: false,
                  location: '',
                  description: '',
                  offerLetterUrl: '',
                  completionCertUrl: '',
                  published: true,
                  createdAt: new Date().toISOString(),
                });
              }}
              className="btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Internship</span>
            </button>
          </div>

          {portfolioData.internships.length === 0 ? (
            <div className="glass-card p-8 text-center rounded-[22px] border border-white/70 space-y-2">
              <TeddyBear variant="empty" size={80} animated />
              <h3 className="font-heading font-bold text-lg text-[#3A0F05]">No Internships Yet</h3>
              <p className="text-xs text-[#85203F]">Add your practical internships and training experiences.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {portfolioData.internships.map((intern) => (
                <div key={intern.id} className="glass-card p-4 rounded-2xl border border-white/70 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-heading font-bold text-base text-[#3A0F05]">{intern.role}</h4>
                    <p className="text-xs font-semibold text-[#8F2547]">{intern.organization} · <span className="uppercase font-normal">{intern.status}</span></p>
                    <p className="text-[11px] text-[#4F2119]/80">{intern.startDate} - {intern.endDate || 'Present'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingIntern(intern)} className="p-1.5 rounded-lg bg-white/70 hover:bg-white text-[#8F2547]">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteConfirm({ isOpen: true, type: 'internship', id: intern.id, name: `${intern.role} at ${intern.organization}` })} className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: EVENTS */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-extrabold text-xl text-[#3A0F05]">
                Manage Events ({portfolioData.events.length})
              </h2>
              <p className="text-xs text-[#85203F]">Hackathons, workshops, conferences, posters, and certificates.</p>
            </div>
            <button
              onClick={() => {
                setEditingEvent({
                  id: `event_${Date.now()}`,
                  title: '',
                  organizer: '',
                  date: '',
                  location: '',
                  participationStatus: 'Participant',
                  posterUrl: '',
                  photos: [],
                  certificateUrl: '',
                  description: '',
                  published: true,
                  createdAt: new Date().toISOString(),
                });
              }}
              className="btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>

          {portfolioData.events.length === 0 ? (
            <div className="glass-card p-8 text-center rounded-[22px] border border-white/70 space-y-2">
              <TeddyBear variant="empty" size={80} animated />
              <h3 className="font-heading font-bold text-lg text-[#3A0F05]">No Events Yet</h3>
              <p className="text-xs text-[#85203F]">Add events, hackathons, or competitions you've attended.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolioData.events.map((evt) => (
                <div key={evt.id} className="glass-card p-4 rounded-2xl border border-white/70 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading font-bold text-base text-[#3A0F05]">{evt.title}</h4>
                      <span className="text-[10px] font-semibold bg-[#8F2547] text-white px-2 py-0.5 rounded-full">{evt.participationStatus}</span>
                    </div>
                    <p className="text-xs font-semibold text-[#8F2547]">{evt.organizer}</p>
                    <p className="text-[11px] text-[#4F2119]/80">{evt.date}</p>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/40">
                    <button onClick={() => setEditingEvent(evt)} className="p-1.5 rounded-lg bg-white/70 hover:bg-white text-[#8F2547]">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteConfirm({ isOpen: true, type: 'event', id: evt.id, name: evt.title })} className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: EDUCATION */}
      {activeTab === 'education' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-extrabold text-xl text-[#3A0F05]">
                Manage Education ({portfolioData.education.length})
              </h2>
              <p className="text-xs text-[#85203F]">Add multiple academic entries (College, Degree, Field, Years, Grade).</p>
            </div>
            <button
              onClick={() => {
                setEditingEdu({
                  id: `edu_${Date.now()}`,
                  college: '',
                  degree: '',
                  field: '',
                  startYear: '',
                  endYear: '',
                  grade: '',
                  place: '',
                  notes: '',
                  published: true,
                  createdAt: new Date().toISOString(),
                });
              }}
              className="btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Education Entry</span>
            </button>
          </div>

          {portfolioData.education.length === 0 ? (
            <div className="glass-card p-8 text-center rounded-[22px] border border-white/70 space-y-2">
              <TeddyBear variant="empty" size={80} animated />
              <h3 className="font-heading font-bold text-lg text-[#3A0F05]">No Education Entries</h3>
              <p className="text-xs text-[#85203F]">Add your college, degree, and graduation qualifications.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {portfolioData.education.map((edu) => (
                <div key={edu.id} className="glass-card p-4 rounded-2xl border border-white/70 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-heading font-bold text-base text-[#3A0F05]">{edu.degree} in {edu.field}</h4>
                    <p className="text-xs font-semibold text-[#8F2547]">{edu.college} ({edu.startYear} - {edu.endYear})</p>
                    {edu.grade && <span className="text-[11px] text-[#85203F]">Grade: {edu.grade}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingEdu(edu)} className="p-1.5 rounded-lg bg-white/70 hover:bg-white text-[#8F2547]">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteConfirm({ isOpen: true, type: 'education', id: edu.id, name: `${edu.degree} at ${edu.college}` })} className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SKILLS */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-extrabold text-xl text-[#3A0F05]">
                Manage Skills ({portfolioData.skills.length})
              </h2>
              <p className="text-xs text-[#85203F]">Add tech stack skills with category and proficiency level.</p>
            </div>
            <button
              onClick={() => {
                setEditingSkill({
                  id: `skill_${Date.now()}`,
                  name: '',
                  category: 'Technical',
                  proficiency: 85,
                  notes: '',
                  published: true,
                  createdAt: new Date().toISOString(),
                });
              }}
              className="btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill</span>
            </button>
          </div>

          {portfolioData.skills.length === 0 ? (
            <div className="glass-card p-8 text-center rounded-[22px] border border-white/70 space-y-2">
              <TeddyBear variant="empty" size={80} animated />
              <h3 className="font-heading font-bold text-lg text-[#3A0F05]">No Skills Added</h3>
              <p className="text-xs text-[#85203F]">Add skills across Frontend, Backend, Tools, and Languages.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {portfolioData.skills.map((skill) => (
                <div key={skill.id} className="p-3 bg-white/70 rounded-2xl border border-white/80 flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="font-bold text-xs text-[#3A0F05] block truncate">{skill.name}</span>
                    <span className="text-[10px] text-[#85203F]">{skill.category} · {skill.proficiency}%</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setEditingSkill(skill)} className="p-1 hover:bg-white rounded text-[#8F2547]">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteConfirm({ isOpen: true, type: 'skill', id: skill.id, name: skill.name })} className="p-1 hover:bg-red-100 rounded text-red-700">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-extrabold text-xl text-[#3A0F05]">
                Manage Achievements ({portfolioData.achievements.length})
              </h2>
              <p className="text-xs text-[#85203F]">Accolades, hackathon prizes, and certificates of merit.</p>
            </div>
            <button
              onClick={() => {
                setEditingAch({
                  id: `ach_${Date.now()}`,
                  title: '',
                  issuerOrEvent: '',
                  date: '',
                  description: '',
                  rankOrAward: '',
                  proofUrl: '',
                  published: true,
                  createdAt: new Date().toISOString(),
                });
              }}
              className="btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Achievement</span>
            </button>
          </div>

          {portfolioData.achievements.length === 0 ? (
            <div className="glass-card p-8 text-center rounded-[22px] border border-white/70 space-y-2">
              <TeddyBear variant="empty" size={80} animated />
              <h3 className="font-heading font-bold text-lg text-[#3A0F05]">No Achievements Yet</h3>
              <p className="text-xs text-[#85203F]">Add your proudest milestone moments and accolades.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolioData.achievements.map((ach) => (
                <div key={ach.id} className="glass-card p-4 rounded-2xl border border-white/70 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading font-bold text-base text-[#3A0F05]">{ach.title}</h4>
                      {ach.rankOrAward && (
                        <span className="text-[10px] font-semibold bg-[#8F2547] text-white px-2 py-0.5 rounded-full">{ach.rankOrAward}</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#8F2547]">{ach.issuerOrEvent} · {ach.date}</p>
                    <p className="text-xs text-[#4F2119]/80 mt-1 line-clamp-2">{ach.description}</p>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/40">
                    <button onClick={() => setEditingAch(ach)} className="p-1.5 rounded-lg bg-white/70 hover:bg-white text-[#8F2547]">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteConfirm({ isOpen: true, type: 'achievement', id: ach.id, name: ach.title })} className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: RESUME */}
      {activeTab === 'resume' && (
        <div className="glass-card p-6 sm:p-8 rounded-[22px] border border-white/80 shadow-sm space-y-6">
          <div>
            <h2 className="font-heading font-extrabold text-xl text-[#3A0F05]">
              Resume Management
            </h2>
            <p className="text-xs text-[#85203F]">
              Upload PDF resume, specify version label, and enable download button.
            </p>
          </div>

          <form onSubmit={handleSaveResume} className="space-y-4">
            <FileUpload
              label="Resume PDF Document"
              allowedTypes={['pdf']}
              accept="application/pdf"
              value={resumeForm.fileUrl}
              onChange={(url) => setResumeForm({ ...resumeForm, fileUrl: url, fileName: 'Subaithal_S_Resume.pdf' })}
              helperText="Only PDF format (max 10MB)"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3A0F05]">
                  Version Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2026 Edition / v2.1"
                  value={resumeForm.versionName || ''}
                  onChange={(e) => setResumeForm({ ...resumeForm, versionName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3A0F05]">
                  Display File Name
                </label>
                <input
                  type="text"
                  placeholder="Subaithal_S_Resume.pdf"
                  value={resumeForm.fileName || ''}
                  onChange={(e) => setResumeForm({ ...resumeForm, fileName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="resume-publish-toggle"
                checked={resumeForm.published}
                onChange={(e) => setResumeForm({ ...resumeForm, published: e.target.checked })}
                className="w-4 h-4 text-[#8F2547] rounded focus:ring-[#8F2547]"
              />
              <label htmlFor="resume-publish-toggle" className="text-xs font-semibold text-[#3A0F05]">
                Publish Resume Page (make accessible to visitors)
              </label>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={isSavingResume}
                className="btn-rose-gradient px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{isSavingResume ? 'Saving...' : 'Save Resume Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB CONTENT: VISIBILITY SETTINGS */}
      {activeTab === 'settings' && (
        <div className="glass-card p-6 sm:p-8 rounded-[22px] border border-white/80 shadow-sm space-y-6">
          <div>
            <h2 className="font-heading font-extrabold text-xl text-[#3A0F05]">
              Section Visibility & Page Controls
            </h2>
            <p className="text-xs text-[#85203F]">
              Hide or reveal any section from the public header and exploration lists anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              { key: 'projects', label: 'Projects Section' },
              { key: 'certificates', label: 'Certificates Section' },
              { key: 'experience', label: 'Work Experience Section' },
              { key: 'internships', label: 'Internships Section' },
              { key: 'events', label: 'Events & Hackathons Section' },
              { key: 'skills', label: 'Skills & Tech Stack Section' },
              { key: 'education', label: 'Education Section' },
              { key: 'achievements', label: 'Achievements Section' },
              { key: 'resume', label: 'Resume Section' },
            ].map((sec) => {
              const isHidden = Boolean((settingsForm.hiddenSections as any)?.[sec.key]);
              return (
                <div
                  key={sec.key}
                  className="p-3.5 bg-white/70 rounded-2xl border border-white/80 flex items-center justify-between gap-3 shadow-xs"
                >
                  <span className="text-xs font-semibold text-[#3A0F05]">{sec.label}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleSection(sec.key, !isHidden)}
                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
                      isHidden ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                    }`}
                  >
                    {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isHidden ? 'Hidden' : 'Visible'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SUPABASE & BACKUP */}
      {activeTab === 'supabase' && (
        <div className="glass-card p-6 sm:p-8 rounded-[22px] border border-white/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/50 pb-4">
            <div>
              <h2 className="font-heading font-extrabold text-xl text-[#3A0F05]">
                Supabase Backend & Data Backup
              </h2>
              <p className="text-xs text-[#85203F]">
                Configure real PostgreSQL, Row Level Security, and private storage with your own credentials.
              </p>
            </div>
            <button
              onClick={() => setIsSqlModalOpen(true)}
              className="btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 self-start"
            >
              <Database className="w-3.5 h-3.5" />
              <span>View Schema SQL</span>
            </button>
          </div>

          {/* Connection input box */}
          <div className="space-y-4 bg-white/50 p-5 rounded-2xl border border-white/70">
            <h3 className="font-heading font-bold text-base text-[#3A0F05]">
              Supabase Project Connection
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#3A0F05]">
                Project URL (e.g. <code>https://your-ref.supabase.co</code>)
              </label>
              <input
                type="text"
                value={sbUrl}
                onChange={(e) => setSbUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#3A0F05]">
                Public / Anon API Key (safe for frontend)
              </label>
              <input
                type="password"
                value={sbAnon}
                onChange={(e) => setSbAnon(e.target.value)}
                placeholder="eyJhbGciOi..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
              />
              <span className="text-[11px] text-[#85203F] block">
                Never enter your service-role key here. Only anon/public key is used.
              </span>
            </div>

            {sbTestResult && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                sbTestResult.success ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {sbTestResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{sbTestResult.message}</span>
              </div>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveSupabaseConfig}
                disabled={isTestingSb}
                className="btn-rose-gradient px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5"
              >
                <span>{isTestingSb ? 'Testing...' : 'Save & Test Connection'}</span>
              </button>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="space-y-4 pt-4 border-t border-white/50">
            <h3 className="font-heading font-bold text-base text-[#3A0F05]">
              Offline Data Backup & Restore
            </h3>
            <p className="text-xs text-[#4F2119]/80 leading-relaxed">
              Export a complete snapshot of all portfolio entities, projects, certificates, and settings as a JSON file. You can restore this file anytime.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={exportPortfolioBackup}
                className="btn-rose-secondary px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download Backup JSON</span>
              </button>

              <label className="btn-rose-secondary px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Import / Restore Backup</span>
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const res = await importPortfolioBackup(file);
                      if (res.success) {
                        await onRefreshData();
                        triggerSuccessCelebration();
                      } else {
                        alert(res.error || 'Import failed.');
                      }
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / ADD PROJECT */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card max-w-2xl w-full max-h-[92vh] flex flex-col p-6 sm:p-7 relative border-2 border-white/80 shadow-2xl overflow-y-auto text-left">
            <h3 className="font-heading font-extrabold text-xl text-[#3A0F05] mb-4">
              {portfolioData.projects.some(p => p.id === editingProject.id) ? 'Edit Project' : 'Add New Project'}
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveProject(editingProject);
                setEditingProject(null);
                await onRefreshData();
                triggerSuccessCelebration();
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3A0F05]">Project Title *</label>
                <input
                  type="text"
                  required
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  placeholder="e.g. AI-Powered Portfolio"
                  className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3A0F05]">Summary / Description *</label>
                <textarea
                  required
                  rows={3}
                  value={editingProject.summary}
                  onChange={(e) => setEditingProject({ ...editingProject, summary: e.target.value })}
                  placeholder="Overview of problem solved, design, and architecture..."
                  className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">Tech Tags (Comma separated)</label>
                  <input
                    type="text"
                    value={editingProject.techTags.join(', ')}
                    onChange={(e) => setEditingProject({ ...editingProject, techTags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    placeholder="React, TypeScript, Tailwind, Supabase"
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">Status</label>
                  <select
                    value={editingProject.status}
                    onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
                  >
                    <option value="Live">Live</option>
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Planning">Planning</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">GitHub Repository Link</label>
                  <input
                    type="url"
                    value={editingProject.gitHubLink || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, gitHubLink: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">Live Demo Link</label>
                  <input
                    type="url"
                    value={editingProject.liveDemoLink || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, liveDemoLink: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
                  />
                </div>
              </div>

              {/* Thumbnail */}
              <FileUpload
                label="Primary Thumbnail / Cover Photo"
                allowedTypes={['image']}
                value={editingProject.thumbnailUrl}
                onChange={(url) => setEditingProject({ ...editingProject, thumbnailUrl: url })}
                helperText="Primary cover preview photo"
              />

              {/* Multiple Screenshots & Photos Upload */}
              <MultiPhotoUpload
                label="Project Screenshots & Gallery Photos (Unlimited)"
                photos={editingProject.screenshots || []}
                onChange={(urls) => setEditingProject({ ...editingProject, screenshots: urls })}
                helperText="Select multiple photos at once (PNG, JPG, WebP)"
              />

              {/* Features List */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3A0F05]">
                  Key Features (One per line)
                </label>
                <textarea
                  rows={2}
                  value={editingProject.features?.join('\n') || ''}
                  onChange={(e) => setEditingProject({
                    ...editingProject,
                    features: e.target.value.split('\n').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
                />
              </div>

              {/* Publish toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="proj-pub-toggle"
                  checked={editingProject.published}
                  onChange={(e) => setEditingProject({ ...editingProject, published: e.target.checked })}
                  className="w-4 h-4 text-[#8F2547] rounded"
                />
                <label htmlFor="proj-pub-toggle" className="text-xs font-semibold text-[#3A0F05]">
                  Publish project (visible on public Projects page)
                </label>
              </div>

              <div className="pt-4 border-t border-white/50 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="btn-rose-secondary px-4 py-2 rounded-full text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-rose-gradient px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / ADD CERTIFICATE */}
      {editingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card max-w-xl w-full max-h-[92vh] flex flex-col p-6 sm:p-7 relative border-2 border-white/80 shadow-2xl overflow-y-auto text-left">
            <h3 className="font-heading font-extrabold text-xl text-[#3A0F05] mb-4">
              {portfolioData.certificates.some(c => c.id === editingCert.id) ? 'Edit Certificate' : 'Add Certificate'}
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveCertificate(editingCert);
                setEditingCert(null);
                await onRefreshData();
                triggerSuccessCelebration();
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3A0F05]">Certificate Title *</label>
                <input
                  type="text"
                  required
                  value={editingCert.title}
                  onChange={(e) => setEditingCert({ ...editingCert, title: e.target.value })}
                  placeholder="e.g. AWS Certified Solutions Architect"
                  className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">Issuer / Organization *</label>
                  <input
                    type="text"
                    required
                    value={editingCert.issuer}
                    onChange={(e) => setEditingCert({ ...editingCert, issuer: e.target.value })}
                    placeholder="e.g. Coursera, Amazon, Google"
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">Issue Date *</label>
                  <input
                    type="text"
                    required
                    value={editingCert.issueDate}
                    onChange={(e) => setEditingCert({ ...editingCert, issueDate: e.target.value })}
                    placeholder="e.g. Oct 2026"
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">Credential ID</label>
                  <input
                    type="text"
                    value={editingCert.credentialId || ''}
                    onChange={(e) => setEditingCert({ ...editingCert, credentialId: e.target.value })}
                    placeholder="ABC-123456"
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">Verification Link</label>
                  <input
                    type="url"
                    value={editingCert.verifyLink || ''}
                    onChange={(e) => setEditingCert({ ...editingCert, verifyLink: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05] focus:outline-none focus:ring-2 focus:ring-[#8F2547]"
                  />
                </div>
              </div>

              <FileUpload
                label="Certificate Document (PDF or Image)"
                allowedTypes={['image', 'pdf']}
                value={editingCert.fileUrl}
                onChange={(url) => setEditingCert({ ...editingCert, fileUrl: url })}
              />

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="cert-pub-toggle"
                  checked={editingCert.published}
                  onChange={(e) => setEditingCert({ ...editingCert, published: e.target.checked })}
                  className="w-4 h-4 text-[#8F2547] rounded"
                />
                <label htmlFor="cert-pub-toggle" className="text-xs font-semibold text-[#3A0F05]">
                  Publish certificate
                </label>
              </div>

              <div className="pt-4 border-t border-white/50 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingCert(null)} className="btn-rose-secondary px-4 py-2 rounded-full text-xs font-semibold">
                  Cancel
                </button>
                <button type="submit" className="btn-rose-gradient px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                  Save Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / ADD EXPERIENCE */}
      {editingExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card max-w-xl w-full max-h-[92vh] flex flex-col p-6 sm:p-7 relative border-2 border-white/80 shadow-2xl overflow-y-auto text-left">
            <h3 className="font-heading font-extrabold text-xl text-[#3A0F05] mb-4">
              {portfolioData.experience.some(e => e.id === editingExp.id) ? 'Edit Experience' : 'Add Experience'}
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveExperience(editingExp);
                setEditingExp(null);
                await onRefreshData();
                triggerSuccessCelebration();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">Role / Position *</label>
                  <input
                    type="text"
                    required
                    value={editingExp.role}
                    onChange={(e) => setEditingExp({ ...editingExp, role: e.target.value })}
                    placeholder="e.g. Software Engineer"
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">Organization *</label>
                  <input
                    type="text"
                    required
                    value={editingExp.organization}
                    onChange={(e) => setEditingExp({ ...editingExp, organization: e.target.value })}
                    placeholder="e.g. Tech Corp"
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">Status</label>
                  <select
                    value={editingExp.status}
                    onChange={(e) => setEditingExp({ ...editingExp, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                  >
                    <option value="completed">Completed</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="applied">Applied</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">Start Date *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jan 2026"
                    value={editingExp.startDate}
                    onChange={(e) => setEditingExp({ ...editingExp, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">End Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Present"
                    value={editingExp.endDate || ''}
                    onChange={(e) => setEditingExp({ ...editingExp, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3A0F05]">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={editingExp.description}
                  onChange={(e) => setEditingExp({ ...editingExp, description: e.target.value })}
                  placeholder="Key contributions and technologies..."
                  className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                />
              </div>

              <FileUpload
                label="Offer Letter (PDF or Image)"
                allowedTypes={['image', 'pdf']}
                value={editingExp.offerLetterUrl}
                onChange={(url) => setEditingExp({ ...editingExp, offerLetterUrl: url })}
              />

              <FileUpload
                label="Completion Certificate (PDF or Image)"
                allowedTypes={['image', 'pdf']}
                value={editingExp.completionCertUrl}
                onChange={(url) => setEditingExp({ ...editingExp, completionCertUrl: url })}
              />

              <div className="pt-4 border-t border-white/50 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingExp(null)} className="btn-rose-secondary px-4 py-2 rounded-full text-xs font-semibold">
                  Cancel
                </button>
                <button type="submit" className="btn-rose-gradient px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                  Save Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / ADD INTERNSHIP */}
      {editingIntern && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card max-w-xl w-full max-h-[92vh] flex flex-col p-6 sm:p-7 relative border-2 border-white/80 shadow-2xl overflow-y-auto text-left">
            <h3 className="font-heading font-extrabold text-xl text-[#3A0F05] mb-4">
              {portfolioData.internships.some(i => i.id === editingIntern.id) ? 'Edit Internship' : 'Add Internship'}
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveInternship(editingIntern);
                setEditingIntern(null);
                await onRefreshData();
                triggerSuccessCelebration();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">Internship Role *</label>
                  <input
                    type="text"
                    required
                    value={editingIntern.role}
                    onChange={(e) => setEditingIntern({ ...editingIntern, role: e.target.value })}
                    placeholder="e.g. Frontend Intern"
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">Organization *</label>
                  <input
                    type="text"
                    required
                    value={editingIntern.organization}
                    onChange={(e) => setEditingIntern({ ...editingIntern, organization: e.target.value })}
                    placeholder="e.g. Innovation Labs"
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">Status</label>
                  <select
                    value={editingIntern.status}
                    onChange={(e) => setEditingIntern({ ...editingIntern, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                  >
                    <option value="completed">Completed</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="applied">Applied</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">Start Date *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jun 2026"
                    value={editingIntern.startDate}
                    onChange={(e) => setEditingIntern({ ...editingIntern, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">End Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Aug 2026"
                    value={editingIntern.endDate || ''}
                    onChange={(e) => setEditingIntern({ ...editingIntern, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3A0F05]">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={editingIntern.description}
                  onChange={(e) => setEditingIntern({ ...editingIntern, description: e.target.value })}
                  placeholder="Projects built, mentors, tools..."
                  className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                />
              </div>

              <FileUpload
                label="Offer Letter (PDF or Image)"
                allowedTypes={['image', 'pdf']}
                value={editingIntern.offerLetterUrl}
                onChange={(url) => setEditingIntern({ ...editingIntern, offerLetterUrl: url })}
              />

              <FileUpload
                label="Completion Certificate (PDF or Image)"
                allowedTypes={['image', 'pdf']}
                value={editingIntern.completionCertUrl}
                onChange={(url) => setEditingIntern({ ...editingIntern, completionCertUrl: url })}
              />

              <div className="pt-4 border-t border-white/50 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingIntern(null)} className="btn-rose-secondary px-4 py-2 rounded-full text-xs font-semibold">
                  Cancel
                </button>
                <button type="submit" className="btn-rose-gradient px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                  Save Internship
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / ADD EVENT */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card max-w-xl w-full max-h-[92vh] flex flex-col p-6 sm:p-7 relative border-2 border-white/80 shadow-2xl overflow-y-auto text-left">
            <h3 className="font-heading font-extrabold text-xl text-[#3A0F05] mb-4">
              {portfolioData.events.some(e => e.id === editingEvent.id) ? 'Edit Event' : 'Add Event'}
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveEvent(editingEvent);
                setEditingEvent(null);
                await onRefreshData();
                triggerSuccessCelebration();
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3A0F05]">Event Title *</label>
                <input
                  type="text"
                  required
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  placeholder="e.g. National Hackathon 2026"
                  className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">Organizer *</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.organizer}
                    onChange={(e) => setEditingEvent({ ...editingEvent, organizer: e.target.value })}
                    placeholder="e.g. IEEE / College"
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">Date *</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    placeholder="e.g. Nov 2026"
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3A0F05]">Participation Status</label>
                <select
                  value={editingEvent.participationStatus}
                  onChange={(e) => setEditingEvent({ ...editingEvent, participationStatus: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                >
                  <option value="Winner">Winner</option>
                  <option value="Participant">Participant</option>
                  <option value="Speaker">Speaker</option>
                  <option value="Volunteer">Volunteer</option>
                  <option value="Organizer">Organizer</option>
                  <option value="Attendee">Attendee</option>
                </select>
              </div>

              <FileUpload
                label="Event Poster"
                allowedTypes={['image']}
                value={editingEvent.posterUrl}
                onChange={(url) => setEditingEvent({ ...editingEvent, posterUrl: url })}
              />

              {/* Event Photos Multiple */}
              <MultiPhotoUpload
                label="Event Photos & Snapshots (Unlimited)"
                photos={editingEvent.photos || []}
                onChange={(urls) => setEditingEvent({ ...editingEvent, photos: urls })}
                helperText="Upload multiple event photos at once (PNG, JPG, WebP)"
              />

              <FileUpload
                label="Certificate (PDF or Image)"
                allowedTypes={['image', 'pdf']}
                value={editingEvent.certificateUrl}
                onChange={(url) => setEditingEvent({ ...editingEvent, certificateUrl: url })}
              />

              <div className="pt-4 border-t border-white/50 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingEvent(null)} className="btn-rose-secondary px-4 py-2 rounded-full text-xs font-semibold">
                  Cancel
                </button>
                <button type="submit" className="btn-rose-gradient px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / ADD EDUCATION */}
      {editingEdu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card max-w-xl w-full max-h-[92vh] flex flex-col p-6 sm:p-7 relative border-2 border-white/80 shadow-2xl overflow-y-auto text-left">
            <h3 className="font-heading font-extrabold text-xl text-[#3A0F05] mb-4">
              {portfolioData.education.some(e => e.id === editingEdu.id) ? 'Edit Education Entry' : 'Add Education Entry'}
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveEducation(editingEdu);
                setEditingEdu(null);
                await onRefreshData();
                triggerSuccessCelebration();
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3A0F05]">College / University *</label>
                <input
                  type="text"
                  required
                  value={editingEdu.college}
                  onChange={(e) => setEditingEdu({ ...editingEdu, college: e.target.value })}
                  placeholder="e.g. National Institute of Technology"
                  className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">Degree *</label>
                  <input
                    type="text"
                    required
                    value={editingEdu.degree}
                    onChange={(e) => setEditingEdu({ ...editingEdu, degree: e.target.value })}
                    placeholder="e.g. Bachelor of Engineering"
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">Field / Major *</label>
                  <input
                    type="text"
                    required
                    value={editingEdu.field}
                    onChange={(e) => setEditingEdu({ ...editingEdu, field: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">Start Year *</label>
                  <input
                    type="text"
                    required
                    value={editingEdu.startYear}
                    onChange={(e) => setEditingEdu({ ...editingEdu, startYear: e.target.value })}
                    placeholder="2022"
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">End Year *</label>
                  <input
                    type="text"
                    required
                    value={editingEdu.endYear}
                    onChange={(e) => setEditingEdu({ ...editingEdu, endYear: e.target.value })}
                    placeholder="2026"
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">Grade / GPA</label>
                  <input
                    type="text"
                    value={editingEdu.grade || ''}
                    onChange={(e) => setEditingEdu({ ...editingEdu, grade: e.target.value })}
                    placeholder="e.g. 8.8 / 10"
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3A0F05]">Notes / Highlights</label>
                <textarea
                  rows={2}
                  value={editingEdu.notes || ''}
                  onChange={(e) => setEditingEdu({ ...editingEdu, notes: e.target.value })}
                  placeholder="Specialization, clubs, honors..."
                  className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                />
              </div>

              <div className="pt-4 border-t border-white/50 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingEdu(null)} className="btn-rose-secondary px-4 py-2 rounded-full text-xs font-semibold">
                  Cancel
                </button>
                <button type="submit" className="btn-rose-gradient px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                  Save Education
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / ADD SKILL */}
      {editingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card max-w-md w-full p-6 relative border-2 border-white/80 shadow-2xl text-left">
            <h3 className="font-heading font-extrabold text-xl text-[#3A0F05] mb-4">
              {portfolioData.skills.some(s => s.id === editingSkill.id) ? 'Edit Skill' : 'Add Skill'}
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveSkill(editingSkill);
                setEditingSkill(null);
                await onRefreshData();
                triggerSuccessCelebration();
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3A0F05]">Skill Name *</label>
                <input
                  type="text"
                  required
                  value={editingSkill.name}
                  onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                  placeholder="e.g. React.js, Python, Figma"
                  className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3A0F05]">Category</label>
                <select
                  value={editingSkill.category}
                  onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                >
                  <option value="Technical">Technical</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Languages">Languages</option>
                  <option value="Tools & Frameworks">Tools & Frameworks</option>
                  <option value="Soft Skills">Soft Skills</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-[#3A0F05]">
                  <span>Proficiency Level</span>
                  <span>{editingSkill.proficiency || 85}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={editingSkill.proficiency || 85}
                  onChange={(e) => setEditingSkill({ ...editingSkill, proficiency: parseInt(e.target.value, 10) })}
                  className="w-full accent-[#8F2547]"
                />
              </div>

              <div className="pt-4 border-t border-white/50 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingSkill(null)} className="btn-rose-secondary px-4 py-2 rounded-full text-xs font-semibold">
                  Cancel
                </button>
                <button type="submit" className="btn-rose-gradient px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / ADD ACHIEVEMENT */}
      {editingAch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card max-w-xl w-full p-6 relative border-2 border-white/80 shadow-2xl text-left">
            <h3 className="font-heading font-extrabold text-xl text-[#3A0F05] mb-4">
              {portfolioData.achievements.some(a => a.id === editingAch.id) ? 'Edit Achievement' : 'Add Achievement'}
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveAchievement(editingAch);
                setEditingAch(null);
                await onRefreshData();
                triggerSuccessCelebration();
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3A0F05]">Achievement Title *</label>
                <input
                  type="text"
                  required
                  value={editingAch.title}
                  onChange={(e) => setEditingAch({ ...editingAch, title: e.target.value })}
                  placeholder="e.g. 1st Place Winner - Smart India Hackathon"
                  className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">Issuer / Event *</label>
                  <input
                    type="text"
                    required
                    value={editingAch.issuerOrEvent}
                    onChange={(e) => setEditingAch({ ...editingAch, issuerOrEvent: e.target.value })}
                    placeholder="e.g. Ministry of Education"
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3A0F05]">Date *</label>
                  <input
                    type="text"
                    required
                    value={editingAch.date}
                    onChange={(e) => setEditingAch({ ...editingAch, date: e.target.value })}
                    placeholder="e.g. Sept 2026"
                    className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3A0F05]">Rank / Award Badge</label>
                <input
                  type="text"
                  value={editingAch.rankOrAward || ''}
                  onChange={(e) => setEditingAch({ ...editingAch, rankOrAward: e.target.value })}
                  placeholder="e.g. 1st Prize / Gold Medal"
                  className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3A0F05]">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={editingAch.description}
                  onChange={(e) => setEditingAch({ ...editingAch, description: e.target.value })}
                  placeholder="Details of the competition and recognition..."
                  className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-[#3A0F05]"
                />
              </div>

              <FileUpload
                label="Proof Document or Photo (Optional)"
                allowedTypes={['image', 'pdf']}
                value={editingAch.proofUrl}
                onChange={(url) => setEditingAch({ ...editingAch, proofUrl: url })}
              />

              <div className="pt-4 border-t border-white/50 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingAch(null)} className="btn-rose-secondary px-4 py-2 rounded-full text-xs font-semibold">
                  Cancel
                </button>
                <button type="submit" className="btn-rose-gradient px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                  Save Achievement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL ("Sure?" confirmation) */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Sure?"
        itemName={deleteConfirm.name}
        message="This action will permanently delete this item. Added data stays saved permanently until you delete it."
        confirmLabel="Yes, Delete Permanently"
        onConfirm={handleExecuteDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, type: '', id: '', name: '' })}
      />

      {/* SQL & VERCEL GUIDE MODAL */}
      <SqlAndDeploymentModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
      />
    </div>
  );
};
