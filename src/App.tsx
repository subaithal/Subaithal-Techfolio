import React, { useState, useEffect } from 'react';
import { FullPortfolioData } from './types/portfolio';
import { loadPortfolioData, subscribeToPortfolio } from './lib/storage';
import { Navigation, PageId } from './components/Navigation';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { ExperiencePage } from './pages/ExperiencePage';
import { InternshipsPage } from './pages/InternshipsPage';
import { EventsPage } from './pages/EventsPage';
import { SkillsPage } from './pages/SkillsPage';
import { EducationPage } from './pages/EducationPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { ResumePage } from './pages/ResumePage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [data, setData] = useState<FullPortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize and subscribe to data changes
  useEffect(() => {
    let isMounted = true;

    async function initData() {
      try {
        const loaded = await loadPortfolioData();
        if (isMounted) {
          setData(loaded);
          setLoading(false);
        }
      } catch (e) {
        console.error('Error loading portfolio:', e);
        if (isMounted) setLoading(false);
      }
    }

    initData();

    // Listen for live updates
    const unsubscribe = subscribeToPortfolio((updatedData) => {
      if (isMounted) setData(updatedData);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Sync with URL route or hash (e.g. /admin or #admin)
  useEffect(() => {
    const checkPath = () => {
      const path = window.location.pathname.replace(/^\//, '').toLowerCase();
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();

      if (path === 'admin' || hash === 'admin') {
        setCurrentPage('admin');
      } else if (hash && [
        'home', 'projects', 'certificates', 'experience', 'internships',
        'events', 'skills', 'education', 'achievements', 'resume', 'contact'
      ].includes(hash)) {
        setCurrentPage(hash as PageId);
      }
    };

    checkPath();
    window.addEventListener('popstate', checkPath);
    window.addEventListener('hashchange', checkPath);
    return () => {
      window.removeEventListener('popstate', checkPath);
      window.removeEventListener('hashchange', checkPath);
    };
  }, []);

  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    if (page === 'admin') {
      window.history.pushState(null, '', '#admin');
    } else if (page === 'home') {
      window.history.pushState(null, '', '#');
    } else {
      window.history.pushState(null, '', `#${page}`);
    }
  };

  const handleRefreshData = async () => {
    const refreshed = await loadPortfolioData(true);
    setData(refreshed);
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-rose-hearts flex flex-col items-center justify-center p-6 text-rose-100">
        <div className="glass-card p-8 rounded-[24px] flex flex-col items-center space-y-4 shadow-2xl border border-rose-500/30 bg-rose-950/60 backdrop-blur-xl">
          <div className="w-12 h-12 rounded-full border-3 border-rose-500 border-t-transparent animate-spin" />
          <h2 className="font-heading font-extrabold text-xl tracking-tight text-rose-100">
            Subaithal S.
          </h2>
          <p className="text-xs text-rose-300">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-hearts text-rose-100 flex flex-col justify-between overflow-x-hidden selection:bg-rose-600 selection:text-white">
      {/* Top Header Navigation */}
      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
        hiddenSections={data.settings.hiddenSections}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto pb-12 transition-opacity duration-200">
        {currentPage === 'home' && (
          <HomePage
            profile={data.profile}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'projects' && (
          <ProjectsPage
            projects={data.projects}
            isAdmin={false}
            onOpenAdmin={() => handleNavigate('admin')}
          />
        )}

        {currentPage === 'certificates' && (
          <CertificatesPage
            certificates={data.certificates}
            isAdmin={false}
            onOpenAdmin={() => handleNavigate('admin')}
          />
        )}

        {currentPage === 'experience' && (
          <ExperiencePage
            experience={data.experience}
            isAdmin={false}
            onOpenAdmin={() => handleNavigate('admin')}
          />
        )}

        {currentPage === 'internships' && (
          <InternshipsPage
            internships={data.internships}
            isAdmin={false}
            onOpenAdmin={() => handleNavigate('admin')}
          />
        )}

        {currentPage === 'events' && (
          <EventsPage
            events={data.events}
            isAdmin={false}
            onOpenAdmin={() => handleNavigate('admin')}
          />
        )}

        {currentPage === 'skills' && (
          <SkillsPage
            skills={data.skills}
            isAdmin={false}
            onOpenAdmin={() => handleNavigate('admin')}
          />
        )}

        {currentPage === 'education' && (
          <EducationPage
            education={data.education}
            isAdmin={false}
            onOpenAdmin={() => handleNavigate('admin')}
          />
        )}

        {currentPage === 'achievements' && (
          <AchievementsPage
            achievements={data.achievements}
            isAdmin={false}
            onOpenAdmin={() => handleNavigate('admin')}
          />
        )}

        {currentPage === 'resume' && (
          <ResumePage
            resume={data.resume}
            isAdmin={false}
            onOpenAdmin={() => handleNavigate('admin')}
          />
        )}

        {currentPage === 'contact' && (
          <ContactPage
            profile={data.profile}
          />
        )}

        {currentPage === 'admin' && (
          <AdminPage
            portfolioData={data}
            onRefreshData={handleRefreshData}
            onExitAdmin={() => handleNavigate('home')}
          />
        )}
      </main>

      {/* Site Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
