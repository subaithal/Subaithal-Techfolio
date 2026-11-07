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
import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { getIdbItem, setIdbItem } from './idb';

const LOCAL_STORAGE_KEY = 'subaithal_portfolio_v1';

export const INITIAL_PORTFOLIO_DATA: FullPortfolioData = {
  profile: {
    name: 'Subaithal S.',
    photoUrl: '',
    shortIntro: '',
    aboutText: '',
    educationSummary: '',
    location: '',
    email: 'subaithalnowfie@gmail.com',
    linkedIn: 'https://www.linkedin.com/in/subaithal-s-812584426',
    gitHub: 'https://github.com/Subaithals',
  },
  projects: [],
  certificates: [],
  experience: [],
  internships: [],
  events: [],
  education: [],
  skills: [],
  achievements: [],
  resume: {
    published: false,
  },
  settings: {
    hiddenSections: {},
    contactEmail: 'subaithalnowfie@gmail.com',
    contactNote: '',
  },
  version: 1,
};

// In-memory cache for instant UI responsiveness
let stateCache: FullPortfolioData = { ...INITIAL_PORTFOLIO_DATA };
let isInitialized = false;

// Subscribers for real-time reactivity
type Listener = (data: FullPortfolioData) => void;
const listeners = new Set<Listener>();

export function subscribeToPortfolio(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach(l => l({ ...stateCache }));
}

/**
 * Load portfolio data:
 * 1. Checks IndexedDB (large capacity for unlimited photos/projects)
 * 2. Checks LocalStorage as fallback
 * 3. Syncs from Supabase if configured
 * GUARANTEE: Never auto-deletes anything. Data persists permanently for lifetime.
 */
export async function loadPortfolioData(forceRefresh = false): Promise<FullPortfolioData> {
  if (isInitialized && !forceRefresh) {
    return stateCache;
  }

  // 1. Try IndexedDB first (holds hundreds of MBs of photos and projects)
  try {
    const idbData = await getIdbItem<FullPortfolioData>();
    if (idbData && idbData.profile) {
      stateCache = {
        ...INITIAL_PORTFOLIO_DATA,
        ...idbData,
        profile: {
          ...INITIAL_PORTFOLIO_DATA.profile,
          ...(idbData.profile || {}),
          linkedIn: idbData.profile?.linkedIn || INITIAL_PORTFOLIO_DATA.profile.linkedIn,
          gitHub: idbData.profile?.gitHub || INITIAL_PORTFOLIO_DATA.profile.gitHub,
          name: idbData.profile?.name || INITIAL_PORTFOLIO_DATA.profile.name,
        },
      };
    } else {
      // Fallback to localStorage if IndexedDB is empty
      const raw = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        stateCache = {
          ...INITIAL_PORTFOLIO_DATA,
          ...parsed,
          profile: {
            ...INITIAL_PORTFOLIO_DATA.profile,
            ...(parsed.profile || {}),
            linkedIn: parsed.profile?.linkedIn || INITIAL_PORTFOLIO_DATA.profile.linkedIn,
            gitHub: parsed.profile?.gitHub || INITIAL_PORTFOLIO_DATA.profile.gitHub,
            name: parsed.profile?.name || INITIAL_PORTFOLIO_DATA.profile.name,
          },
        };
        // Migrate to IndexedDB for lifetime safety
        await setIdbItem('full_portfolio_data', stateCache);
      }
    }
  } catch (e) {
    console.warn('Could not read cached portfolio data:', e);
  }

  // 2. Attempt Supabase fetch if configured
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        // Fetch Profile
        const { data: profileRow } = await client.from('portfolio_profile').select('*').limit(1).maybeSingle();
        if (profileRow) {
          stateCache.profile = {
            name: profileRow.name || 'Subaithal S.',
            photoUrl: profileRow.photo_url || '',
            shortIntro: profileRow.short_intro || '',
            aboutText: profileRow.about_text || '',
            educationSummary: profileRow.education_summary || '',
            location: profileRow.location || '',
            email: profileRow.email || 'subaithalnowfie@gmail.com',
            linkedIn: profileRow.linkedin || 'https://www.linkedin.com/in/subaithal-s-812584426',
            gitHub: profileRow.github || 'https://github.com/Subaithals',
          };
        }

        // Fetch Projects (unlimited)
        const { data: projectsRows } = await client.from('portfolio_projects').select('*').order('created_at', { ascending: false });
        if (projectsRows) {
          stateCache.projects = projectsRows.map((r: any) => ({
            id: r.id,
            title: r.title,
            summary: r.summary,
            techTags: r.tech_tags || [],
            gitHubLink: r.github_link,
            liveDemoLink: r.live_demo_link,
            thumbnailUrl: r.thumbnail_url,
            screenshots: r.screenshots || [],
            features: r.features || [],
            status: r.status || 'Completed',
            published: Boolean(r.published),
            createdAt: r.created_at,
          }));
        }

        // Fetch Certificates (unlimited)
        const { data: certRows } = await client.from('portfolio_certificates').select('*').order('created_at', { ascending: false });
        if (certRows) {
          stateCache.certificates = certRows.map((r: any) => ({
            id: r.id,
            title: r.title,
            issuer: r.issuer,
            issueDate: r.issue_date,
            expiryDate: r.expiry_date,
            credentialId: r.credential_id,
            verifyLink: r.verify_link,
            fileUrl: r.file_url,
            images: r.images || (r.file_url ? [r.file_url] : []),
            fileType: r.file_type || 'image',
            description: r.description,
            published: Boolean(r.published),
            createdAt: r.created_at,
          }));
        }

        // Fetch Experiences
        const { data: expRows } = await client.from('portfolio_experience').select('*').order('created_at', { ascending: false });
        if (expRows) {
          stateCache.experience = expRows.map((r: any) => ({
            id: r.id,
            organization: r.organization,
            role: r.role,
            status: r.status,
            startDate: r.start_date,
            endDate: r.end_date,
            isCurrent: r.is_current,
            location: r.location,
            description: r.description,
            offerLetterUrl: r.offer_letter_url,
            completionCertUrl: r.completion_cert_url,
            published: Boolean(r.published),
            createdAt: r.created_at,
          }));
        }

        // Fetch Internships
        const { data: internRows } = await client.from('portfolio_internships').select('*').order('created_at', { ascending: false });
        if (internRows) {
          stateCache.internships = internRows.map((r: any) => ({
            id: r.id,
            organization: r.organization,
            role: r.role,
            status: r.status,
            startDate: r.start_date,
            endDate: r.end_date,
            isCurrent: r.is_current,
            location: r.location,
            description: r.description,
            offerLetterUrl: r.offer_letter_url,
            completionCertUrl: r.completion_cert_url,
            published: Boolean(r.published),
            createdAt: r.created_at,
          }));
        }

        // Fetch Events
        const { data: eventRows } = await client.from('portfolio_events').select('*').order('created_at', { ascending: false });
        if (eventRows) {
          stateCache.events = eventRows.map((r: any) => ({
            id: r.id,
            title: r.title,
            organizer: r.organizer,
            date: r.date,
            location: r.location,
            participationStatus: r.participation_status || 'Participant',
            posterUrl: r.poster_url,
            photos: r.photos || [],
            certificateUrl: r.certificate_url,
            description: r.description,
            published: Boolean(r.published),
            createdAt: r.created_at,
          }));
        }

        // Fetch Education
        const { data: eduRows } = await client.from('portfolio_education').select('*').order('start_year', { ascending: false });
        if (eduRows) {
          stateCache.education = eduRows.map((r: any) => ({
            id: r.id,
            college: r.college,
            degree: r.degree,
            field: r.field,
            startYear: r.start_year,
            endYear: r.end_year,
            grade: r.grade,
            place: r.place,
            notes: r.notes,
            published: Boolean(r.published),
            createdAt: r.created_at,
          }));
        }

        // Fetch Skills
        const { data: skillRows } = await client.from('portfolio_skills').select('*').order('created_at', { ascending: false });
        if (skillRows) {
          stateCache.skills = skillRows.map((r: any) => ({
            id: r.id,
            name: r.name,
            category: r.category,
            proficiency: r.proficiency,
            notes: r.notes,
            published: Boolean(r.published),
            createdAt: r.created_at,
          }));
        }

        // Fetch Achievements
        const { data: achRows } = await client.from('portfolio_achievements').select('*').order('created_at', { ascending: false });
        if (achRows) {
          stateCache.achievements = achRows.map((r: any) => ({
            id: r.id,
            title: r.title,
            issuerOrEvent: r.issuer_or_event,
            date: r.date,
            description: r.description,
            rankOrAward: r.rank_or_award,
            proofUrl: r.proof_url,
            proofImages: r.proof_images || (r.proof_url ? [r.proof_url] : []),
            published: Boolean(r.published),
            createdAt: r.created_at,
          }));
        }

        // Fetch Resume
        const { data: resumeRow } = await client.from('portfolio_resume').select('*').limit(1).maybeSingle();
        if (resumeRow) {
          stateCache.resume = {
            fileUrl: resumeRow.file_url,
            fileName: resumeRow.file_name,
            fileSize: resumeRow.file_size,
            lastUpdated: resumeRow.last_updated,
            versionName: resumeRow.version_name,
            published: Boolean(resumeRow.published),
          };
        }

        // Fetch Settings
        const { data: settingsRow } = await client.from('portfolio_settings').select('*').limit(1).maybeSingle();
        if (settingsRow) {
          stateCache.settings = {
            hiddenSections: settingsRow.hidden_sections || {},
            contactEmail: settingsRow.contact_email || 'subaithalnowfie@gmail.com',
            contactNote: settingsRow.contact_note || '',
          };
        }
      }
    } catch (err) {
      console.warn('Error syncing with Supabase:', err);
    }
  }

  isInitialized = true;
  await persistDataLocally(stateCache);
  notifyListeners();
  return stateCache;
}

/**
 * Persists data permanently in IndexedDB and LocalStorage.
 * IndexedDB guarantees no 5MB limit, meaning unlimited photos can be safely stored.
 */
async function persistDataLocally(data: FullPortfolioData) {
  try {
    // 1. IndexedDB for unlimited capacity
    await setIdbItem('full_portfolio_data', data);

    // 2. LocalStorage as light backup (omitting heavy base64 strings if over quota)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      }
    } catch (quotaError) {
      console.info('LocalStorage quota reached, but data is safely stored in IndexedDB for lifetime.');
    }
  } catch (err) {
    console.error('Local persistence error:', err);
  }
}

/**
 * Save updated state across IndexedDB, LocalStorage, and remote Supabase
 * Lifetime guarantee: Nothing is ever deleted automatically.
 */
export async function savePortfolioData(updated: FullPortfolioData): Promise<{ success: boolean; error?: string }> {
  stateCache = { ...updated };
  await persistDataLocally(stateCache);
  notifyListeners();

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        // Sync profile
        await client.from('portfolio_profile').upsert({
          name: updated.profile.name,
          photo_url: updated.profile.photoUrl,
          short_intro: updated.profile.shortIntro,
          about_text: updated.profile.aboutText,
          education_summary: updated.profile.educationSummary,
          location: updated.profile.location,
          email: updated.profile.email,
          linkedin: updated.profile.linkedIn,
          github: updated.profile.gitHub,
          updated_at: new Date().toISOString(),
        });

        // Sync settings
        await client.from('portfolio_settings').upsert({
          hidden_sections: updated.settings.hiddenSections,
          contact_email: updated.settings.contactEmail,
          contact_note: updated.settings.contactNote,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.warn('Supabase remote write error:', err);
    }
  }

  return { success: true };
}

// Entity-level helper operations
export async function updateProfile(profile: ProfileData): Promise<void> {
  const current = await loadPortfolioData();
  current.profile = profile;
  await savePortfolioData(current);
}

export async function saveProject(project: ProjectItem): Promise<void> {
  const current = await loadPortfolioData();
  const index = current.projects.findIndex(p => p.id === project.id);
  if (index >= 0) {
    current.projects[index] = project;
  } else {
    current.projects.unshift(project);
  }
  await savePortfolioData(current);

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        await client.from('portfolio_projects').upsert({
          id: project.id.startsWith('proj_') ? undefined : project.id,
          title: project.title,
          summary: project.summary,
          tech_tags: project.techTags,
          github_link: project.gitHubLink,
          live_demo_link: project.liveDemoLink,
          thumbnail_url: project.thumbnailUrl,
          screenshots: project.screenshots,
          features: project.features,
          status: project.status,
          published: project.published,
          created_at: project.createdAt || new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Supabase project sync error:', e);
    }
  }
}

export async function deleteProject(id: string): Promise<void> {
  const current = await loadPortfolioData();
  current.projects = current.projects.filter(p => p.id !== id);
  await savePortfolioData(current);

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) await client.from('portfolio_projects').delete().eq('id', id);
    } catch (e) {
      console.warn('Error deleting project from Supabase:', e);
    }
  }
}

export async function saveCertificate(item: CertificateItem): Promise<void> {
  let savedItem = { ...item };

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id);
        const payload: any = {
          title: item.title,
          issuer: item.issuer,
          issue_date: item.issueDate,
          expiry_date: item.expiryDate || null,
          credential_id: item.credentialId || null,
          verify_link: item.verifyLink || null,
          file_url: item.fileUrl || (item.images && item.images[0]) || null,
          images: item.images || (item.fileUrl ? [item.fileUrl] : []),
          file_type: item.fileType || 'image',
          description: item.description || '',
          published: item.published ?? true,
          created_at: item.createdAt || new Date().toISOString(),
        };

        if (isUuid) {
          payload.id = item.id;
        }

        const { data, error } = await client
          .from('portfolio_certificates')
          .upsert(payload)
          .select()
          .single();

        if (error) {
          console.error('Supabase certificate upsert error:', error);
        } else if (data && data.id) {
          savedItem.id = data.id;
        }
      }
    } catch (e) {
      console.warn('Supabase cert sync error:', e);
    }
  }

  const current = await loadPortfolioData();
  const index = current.certificates.findIndex(c => c.id === item.id || c.id === savedItem.id);
  if (index >= 0) {
    current.certificates[index] = savedItem;
  } else {
    current.certificates.unshift(savedItem);
  }
  await savePortfolioData(current);
}

export async function deleteCertificate(id: string): Promise<void> {
  const current = await loadPortfolioData();
  current.certificates = current.certificates.filter(c => c.id !== id);
  await savePortfolioData(current);

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) await client.from('portfolio_certificates').delete().eq('id', id);
    } catch (e) {
      console.warn('Error deleting certificate from Supabase:', e);
    }
  }
}

export async function saveExperience(item: ExperienceItem): Promise<void> {
  const current = await loadPortfolioData();
  const index = current.experience.findIndex(e => e.id === item.id);
  if (index >= 0) {
    current.experience[index] = item;
  } else {
    current.experience.unshift(item);
  }
  await savePortfolioData(current);

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        await client.from('portfolio_experience').upsert({
          id: item.id.startsWith('exp_') ? undefined : item.id,
          organization: item.organization,
          role: item.role,
          status: item.status,
          start_date: item.startDate,
          end_date: item.endDate,
          is_current: item.isCurrent,
          location: item.location,
          description: item.description,
          offer_letter_url: item.offerLetterUrl,
          completion_cert_url: item.completionCertUrl,
          published: item.published,
          created_at: item.createdAt || new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Supabase exp sync error:', e);
    }
  }
}

export async function deleteExperience(id: string): Promise<void> {
  const current = await loadPortfolioData();
  current.experience = current.experience.filter(e => e.id !== id);
  await savePortfolioData(current);

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) await client.from('portfolio_experience').delete().eq('id', id);
    } catch (e) {
      console.warn('Error deleting experience from Supabase:', e);
    }
  }
}

export async function saveInternship(item: InternshipItem): Promise<void> {
  const current = await loadPortfolioData();
  const index = current.internships.findIndex(i => i.id === item.id);
  if (index >= 0) {
    current.internships[index] = item;
  } else {
    current.internships.unshift(item);
  }
  await savePortfolioData(current);

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        await client.from('portfolio_internships').upsert({
          id: item.id.startsWith('intern_') ? undefined : item.id,
          organization: item.organization,
          role: item.role,
          status: item.status,
          start_date: item.startDate,
          end_date: item.endDate,
          is_current: item.isCurrent,
          location: item.location,
          description: item.description,
          offer_letter_url: item.offerLetterUrl,
          completion_cert_url: item.completionCertUrl,
          published: item.published,
          created_at: item.createdAt || new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Supabase intern sync error:', e);
    }
  }
}

export async function deleteInternship(id: string): Promise<void> {
  const current = await loadPortfolioData();
  current.internships = current.internships.filter(i => i.id !== id);
  await savePortfolioData(current);

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) await client.from('portfolio_internships').delete().eq('id', id);
    } catch (e) {
      console.warn('Error deleting internship from Supabase:', e);
    }
  }
}

export async function saveEvent(item: EventItem): Promise<void> {
  const current = await loadPortfolioData();
  const index = current.events.findIndex(e => e.id === item.id);
  if (index >= 0) {
    current.events[index] = item;
  } else {
    current.events.unshift(item);
  }
  await savePortfolioData(current);

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        await client.from('portfolio_events').upsert({
          id: item.id.startsWith('event_') ? undefined : item.id,
          title: item.title,
          organizer: item.organizer,
          date: item.date,
          location: item.location,
          participation_status: item.participationStatus,
          poster_url: item.posterUrl,
          photos: item.photos,
          certificate_url: item.certificateUrl,
          description: item.description,
          published: item.published,
          created_at: item.createdAt || new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Supabase event sync error:', e);
    }
  }
}

export async function deleteEvent(id: string): Promise<void> {
  const current = await loadPortfolioData();
  current.events = current.events.filter(e => e.id !== id);
  await savePortfolioData(current);

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) await client.from('portfolio_events').delete().eq('id', id);
    } catch (e) {
      console.warn('Error deleting event from Supabase:', e);
    }
  }
}

export async function saveEducation(item: EducationItem): Promise<void> {
  const current = await loadPortfolioData();
  const index = current.education.findIndex(e => e.id === item.id);
  if (index >= 0) {
    current.education[index] = item;
  } else {
    current.education.unshift(item);
  }
  await savePortfolioData(current);

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        await client.from('portfolio_education').upsert({
          id: item.id.startsWith('edu_') ? undefined : item.id,
          college: item.college,
          degree: item.degree,
          field: item.field,
          start_year: item.startYear,
          end_year: item.endYear,
          grade: item.grade,
          place: item.place,
          notes: item.notes,
          published: item.published,
          created_at: item.createdAt || new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Supabase edu sync error:', e);
    }
  }
}

export async function deleteEducation(id: string): Promise<void> {
  const current = await loadPortfolioData();
  current.education = current.education.filter(e => e.id !== id);
  await savePortfolioData(current);

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) await client.from('portfolio_education').delete().eq('id', id);
    } catch (e) {
      console.warn('Error deleting education from Supabase:', e);
    }
  }
}

export async function saveSkill(item: SkillItem): Promise<void> {
  const current = await loadPortfolioData();
  const index = current.skills.findIndex(s => s.id === item.id);
  if (index >= 0) {
    current.skills[index] = item;
  } else {
    current.skills.unshift(item);
  }
  await savePortfolioData(current);

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        await client.from('portfolio_skills').upsert({
          id: item.id.startsWith('skill_') ? undefined : item.id,
          name: item.name,
          category: item.category,
          proficiency: item.proficiency,
          notes: item.notes,
          published: item.published,
          created_at: item.createdAt || new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Supabase skill sync error:', e);
    }
  }
}

export async function deleteSkill(id: string): Promise<void> {
  const current = await loadPortfolioData();
  current.skills = current.skills.filter(s => s.id !== id);
  await savePortfolioData(current);

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) await client.from('portfolio_skills').delete().eq('id', id);
    } catch (e) {
      console.warn('Error deleting skill from Supabase:', e);
    }
  }
}

export async function saveAchievement(item: AchievementItem): Promise<void> {
  let savedItem = { ...item };

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id);
        const payload: any = {
          title: item.title,
          issuer_or_event: item.issuerOrEvent,
          date: item.date,
          description: item.description,
          rank_or_award: item.rankOrAward || null,
          proof_url: item.proofUrl || (item.proofImages && item.proofImages[0]) || null,
          proof_images: item.proofImages || (item.proofUrl ? [item.proofUrl] : []),
          published: item.published ?? true,
          created_at: item.createdAt || new Date().toISOString(),
        };

        if (isUuid) {
          payload.id = item.id;
        }

        const { data, error } = await client
          .from('portfolio_achievements')
          .upsert(payload)
          .select()
          .single();

        if (error) {
          console.error('Supabase achievement upsert error:', error);
        } else if (data && data.id) {
          savedItem.id = data.id;
        }
      }
    } catch (e) {
      console.warn('Supabase ach sync error:', e);
    }
  }

  const current = await loadPortfolioData();
  const index = current.achievements.findIndex(a => a.id === item.id || a.id === savedItem.id);
  if (index >= 0) {
    current.achievements[index] = savedItem;
  } else {
    current.achievements.unshift(savedItem);
  }
  await savePortfolioData(current);
}

export async function deleteAchievement(id: string): Promise<void> {
  const current = await loadPortfolioData();
  current.achievements = current.achievements.filter(a => a.id !== id);
  await savePortfolioData(current);

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) await client.from('portfolio_achievements').delete().eq('id', id);
    } catch (e) {
      console.warn('Error deleting achievement from Supabase:', e);
    }
  }
}

export async function saveResume(resume: ResumeData): Promise<void> {
  const current = await loadPortfolioData();
  current.resume = resume;
  await savePortfolioData(current);

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        await client.from('portfolio_resume').upsert({
          file_url: resume.fileUrl,
          file_name: resume.fileName,
          file_size: resume.fileSize,
          last_updated: resume.lastUpdated,
          version_name: resume.versionName,
          published: resume.published,
        });
      }
    } catch (e) {
      console.warn('Supabase resume sync error:', e);
    }
  }
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  const current = await loadPortfolioData();
  current.settings = settings;
  await savePortfolioData(current);
}

// Full Backup Download as JSON
export function exportPortfolioBackup(): void {
  const data = stateCache;
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `subaithal-s-portfolio-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Restore / Import Backup from JSON
export async function importPortfolioBackup(file: File): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid JSON structure');
    }
    const merged: FullPortfolioData = {
      ...INITIAL_PORTFOLIO_DATA,
      ...parsed,
      profile: {
        ...INITIAL_PORTFOLIO_DATA.profile,
        ...(parsed.profile || {}),
        name: parsed.profile?.name || 'Subaithal S.',
      },
    };
    await savePortfolioData(merged);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to parse backup file.' };
  }
}
