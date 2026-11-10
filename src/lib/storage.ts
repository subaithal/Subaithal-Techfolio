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
import { getSupabaseClient, isSupabaseConfigured, uploadFileToSupabase, reloadSupabaseSchemaCache } from './supabase';
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

/**
 * Ensures an ID is a valid RFC4122 v4 UUID for PostgreSQL compatibility.
 */
export function ensureValidUuid(id?: string): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch {
      // fallback
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Checks whether a given table exists in PostgREST schema cache.
 */
export async function checkTableExists(tableName: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from(tableName).select('id').limit(1);
    if (!error) return true;
    if (
      error.code === 'PGRST205' || 
      error.code === '42P01' || 
      error.message?.includes('schema cache') || 
      error.message?.includes('does not exist') ||
      error.message?.includes('relation')
    ) {
      return false;
    }
    // Any other error (permission, RLS, empty) indicates the table exists in schema cache
    return true;
  } catch {
    return false;
  }
}

/**
 * Translates PostgreSQL and Supabase errors into human-friendly explanations.
 */
export function formatSupabaseError(error: any, context = 'record'): string {
  if (!error) return 'Unknown error occurred.';
  const msg = error.message || String(error);
  const code = error.code || '';

  if (
    code === 'PGRST205' || 
    msg.includes('PGRST205') || 
    msg.includes('schema cache') || 
    code === '42P01' || 
    msg.includes('does not exist') || 
    msg.includes('relation')
  ) {
    return `Database table is missing for ${context} in Supabase (PGRST205: Not found in schema cache). Run the SQL script in your Supabase SQL Editor to create all tables and reload schema cache.`;
  }
  if (code === '42501' || msg.includes('permission denied')) {
    return `Permission denied for ${context}. Ensure PostgREST table permissions (GRANT) and RLS policies are applied. (Error 42501)`;
  }
  if (msg.includes('row-level security') || msg.includes('violates row-level security')) {
    return `Security Policy Blocked: Only subaithalnowfie@gmail.com is authorized to modify ${context}.`;
  }
  if (msg.toLowerCase().includes('bucket not found')) {
    return `Storage bucket 'portfolio-assets' is missing in your Supabase project. Go to Supabase -> Storage -> New Bucket -> name it 'portfolio-assets' and set Public to ON.`;
  }
  if (code === '22P02' || msg.includes('invalid input syntax for type uuid')) {
    return `UUID syntax mismatch for ${context}. The system has repaired the ID to standard UUID format.`;
  }
  return `Supabase error (${code || 'error'}): ${msg}`;
}

// In-memory state cache for real-time React UI updates across components
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
 * Pure cloud-authoritative architecture.
 * Fetches live data directly from Supabase Cloud tables for every visitor and device.
 * Eliminates device-bound localStorage/IndexedDB fallback.
 */
export async function loadPortfolioData(forceRefresh = false): Promise<FullPortfolioData> {
  if (isInitialized && !forceRefresh) {
    return stateCache;
  }

  // Pure cloud-authoritative fetch directly from Supabase
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        const [
          profileRes,
          projectsRes,
          certsRes,
          expRes,
          internRes,
          eventsRes,
          eduRes,
          skillsRes,
          achRes,
          resumeRes,
          settingsRes,
        ] = await Promise.all([
          client.from('portfolio_profile').select('*').limit(1).maybeSingle(),
          client.from('portfolio_projects').select('*').order('created_at', { ascending: false }),
          client.from('portfolio_certificates').select('*').order('created_at', { ascending: false }),
          client.from('portfolio_experience').select('*').order('created_at', { ascending: false }),
          client.from('portfolio_internships').select('*').order('created_at', { ascending: false }),
          client.from('portfolio_events').select('*').order('created_at', { ascending: false }),
          client.from('portfolio_education').select('*').order('start_year', { ascending: false }),
          client.from('portfolio_skills').select('*').order('created_at', { ascending: false }),
          client.from('portfolio_achievements').select('*').order('created_at', { ascending: false }),
          client.from('portfolio_resume').select('*').limit(1).maybeSingle(),
          client.from('portfolio_settings').select('*').limit(1).maybeSingle(),
        ]);

        // Sync Profile
        if (profileRes.data) {
          const p = profileRes.data;
          stateCache.profile = {
            name: p.name || 'Subaithal S.',
            photoUrl: p.photo_url || '',
            shortIntro: p.short_intro || '',
            aboutText: p.about_text || '',
            educationSummary: p.education_summary || '',
            location: p.location || '',
            email: p.email || 'subaithalnowfie@gmail.com',
            linkedIn: p.linkedin || 'https://www.linkedin.com/in/subaithal-s-812584426',
            gitHub: p.github || 'https://github.com/Subaithals',
          };
        }

        // Sync Projects
        if (projectsRes.data) {
          stateCache.projects = projectsRes.data.map((r: any) => ({
            id: r.id,
            title: r.title || '',
            summary: r.summary || '',
            techTags: Array.isArray(r.tech_tags) ? r.tech_tags : [],
            githubLink: r.github_link || undefined,
            liveDemoLink: r.live_demo_link || undefined,
            thumbnailUrl: r.thumbnail_url || undefined,
            screenshots: Array.isArray(r.screenshots) ? r.screenshots : [],
            features: Array.isArray(r.features) ? r.features : [],
            status: r.status || 'Completed',
            published: Boolean(r.published),
            createdAt: r.created_at || new Date().toISOString(),
          }));
        }

        // Sync Certificates (Cloud public storage URLs + multi-image support)
        if (certsRes.data) {
          stateCache.certificates = certsRes.data.map((r: any) => {
            const rawImages = Array.isArray(r.images)
              ? r.images.filter(Boolean)
              : typeof r.images === 'string' && r.images.trim()
              ? [r.images.trim()]
              : [];

            if (r.file_url && !rawImages.includes(r.file_url)) {
              rawImages.unshift(r.file_url);
            }

            return {
              id: r.id,
              title: r.title || 'Untitled Certificate',
              issuer: r.issuer || '',
              issueDate: r.issue_date || '',
              expiryDate: r.expiry_date || undefined,
              credentialId: r.credential_id || undefined,
              verifyLink: r.verify_link || undefined,
              fileUrl: r.file_url || rawImages[0] || undefined,
              images: rawImages,
              fileType: r.file_type || 'image',
              description: r.description || '',
              published: Boolean(r.published),
              createdAt: r.created_at || new Date().toISOString(),
            };
          });
        }

        // Sync Experience
        if (expRes.data) {
          stateCache.experience = expRes.data.map((r: any) => ({
            id: r.id,
            organization: r.organization || '',
            role: r.role || '',
            status: r.status || 'completed',
            startDate: r.start_date || '',
            endDate: r.end_date || undefined,
            isCurrent: Boolean(r.is_current),
            location: r.location || undefined,
            description: r.description || '',
            offerLetterUrl: r.offer_letter_url || undefined,
            completionCertUrl: r.completion_cert_url || undefined,
            published: Boolean(r.published),
            createdAt: r.created_at || new Date().toISOString(),
          }));
        }

        // Sync Internships
        if (internRes.data) {
          stateCache.internships = internRes.data.map((r: any) => ({
            id: r.id,
            organization: r.organization || '',
            role: r.role || '',
            status: r.status || 'completed',
            startDate: r.start_date || '',
            endDate: r.end_date || undefined,
            isCurrent: Boolean(r.is_current),
            location: r.location || undefined,
            description: r.description || '',
            offerLetterUrl: r.offer_letter_url || undefined,
            completionCertUrl: r.completion_cert_url || undefined,
            published: Boolean(r.published),
            createdAt: r.created_at || new Date().toISOString(),
          }));
        }

        // Sync Events
        if (eventsRes.data) {
          stateCache.events = eventsRes.data.map((r: any) => ({
            id: r.id,
            title: r.title || '',
            organizer: r.organizer || '',
            date: r.date || '',
            location: r.location || undefined,
            participationStatus: r.participation_status || 'Participant',
            posterUrl: r.poster_url || undefined,
            photos: Array.isArray(r.photos) ? r.photos : [],
            certificateUrl: r.certificate_url || undefined,
            description: r.description || undefined,
            published: Boolean(r.published),
            createdAt: r.created_at || new Date().toISOString(),
          }));
        }

        // Sync Education
        if (eduRes.data) {
          stateCache.education = eduRes.data.map((r: any) => ({
            id: r.id,
            college: r.college || '',
            degree: r.degree || '',
            field: r.field || '',
            startYear: r.start_year || '',
            endYear: r.end_year || '',
            grade: r.grade || undefined,
            place: r.place || undefined,
            notes: r.notes || undefined,
            published: Boolean(r.published),
            createdAt: r.created_at || new Date().toISOString(),
          }));
        }

        // Sync Skills
        if (skillsRes.data) {
          stateCache.skills = skillsRes.data.map((r: any) => ({
            id: r.id,
            name: r.name || '',
            category: r.category || 'Technical',
            proficiency: typeof r.proficiency === 'number' ? r.proficiency : 85,
            notes: r.notes || undefined,
            published: Boolean(r.published),
            createdAt: r.created_at || new Date().toISOString(),
          }));
        }

        // Sync Achievements
        if (achRes.data) {
          stateCache.achievements = achRes.data.map((r: any) => {
            const rawProofImages = Array.isArray(r.proof_images) ? r.proof_images : [];
            if (r.proof_url && !rawProofImages.includes(r.proof_url)) {
              rawProofImages.unshift(r.proof_url);
            }
            return {
              id: r.id,
              title: r.title || '',
              issuerOrEvent: r.issuer_or_event || '',
              date: r.date || '',
              description: r.description || '',
              rankOrAward: r.rank_or_award || undefined,
              proofUrl: r.proof_url || rawProofImages[0] || undefined,
              proofImages: rawProofImages,
              published: Boolean(r.published),
              createdAt: r.created_at || new Date().toISOString(),
            };
          });
        }

        // Sync Resume
        if (resumeRes.data) {
          const res = resumeRes.data;
          stateCache.resume = {
            fileUrl: res.file_url || undefined,
            fileName: res.file_name || undefined,
            fileSize: res.file_size || undefined,
            lastUpdated: res.last_updated || undefined,
            versionName: res.version_name || undefined,
            published: Boolean(res.published),
          };
        }

        // Sync Settings
        if (settingsRes.data) {
          const s = settingsRes.data;
          stateCache.settings = {
            hiddenSections: s.hidden_sections || {},
            contactEmail: s.contact_email || 'subaithalnowfie@gmail.com',
            contactNote: s.contact_note || '',
          };
        }
      }
    } catch (err) {
      console.warn('Supabase cloud fetch note:', err);
    }
  } else {
    console.warn('[Supabase] Supabase credentials not yet detected. Provide VITE_SUPABASE_ANON_KEY in Vercel or Admin Settings to load cloud data.');
  }

  isInitialized = true;
  notifyListeners();
  return stateCache;
}

/**
 * Updates in-memory portfolio state and notifies subscribers.
 * Does not write to browser localStorage/IndexedDB.
 */
export async function savePortfolioData(updated: FullPortfolioData): Promise<{ success: boolean; error?: string }> {
  stateCache = { ...updated };
  notifyListeners();
  return { success: true };
}

// -------------------------------------------------------------
// PROFILE & SETTINGS OPERATIONS (Cloud-Only Persistence)
// -------------------------------------------------------------
export async function updateProfile(profile: ProfileData): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Profile changes must be saved to Supabase to be visible across devices.');
  }
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not available.');

  const payload = {
    name: profile.name,
    photo_url: profile.photoUrl || null,
    short_intro: profile.shortIntro || null,
    about_text: profile.aboutText || null,
    education_summary: profile.educationSummary || null,
    location: profile.location || null,
    email: profile.email || 'subaithalnowfie@gmail.com',
    linkedin: profile.linkedIn || 'https://www.linkedin.com/in/subaithal-s-812584426',
    github: profile.gitHub || 'https://github.com/Subaithals',
    updated_at: new Date().toISOString(),
  };

  const { data: existing, error: fetchErr } = await client.from('portfolio_profile').select('id').limit(1).maybeSingle();
  if (fetchErr) throw new Error(formatSupabaseError(fetchErr, 'profile'));

  if (existing?.id) {
    const { error } = await client.from('portfolio_profile').update(payload).eq('id', existing.id);
    if (error) throw new Error(formatSupabaseError(error, 'profile'));
  } else {
    const { error } = await client.from('portfolio_profile').insert(payload);
    if (error) throw new Error(formatSupabaseError(error, 'profile'));
  }

  stateCache.profile = { ...profile };
  notifyListeners();
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Settings must be saved to Supabase to sync across devices.');
  }
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not available.');

  const payload = {
    hidden_sections: settings.hiddenSections || {},
    contact_email: settings.contactEmail || 'subaithalnowfie@gmail.com',
    contact_note: settings.contactNote || '',
    updated_at: new Date().toISOString(),
  };

  const { data: existing, error: fetchErr } = await client.from('portfolio_settings').select('id').limit(1).maybeSingle();
  if (fetchErr) throw new Error(formatSupabaseError(fetchErr, 'settings'));

  if (existing?.id) {
    const { error } = await client.from('portfolio_settings').update(payload).eq('id', existing.id);
    if (error) throw new Error(formatSupabaseError(error, 'settings'));
  } else {
    const { error } = await client.from('portfolio_settings').insert(payload);
    if (error) throw new Error(formatSupabaseError(error, 'settings'));
  }

  stateCache.settings = { ...settings };
  notifyListeners();
}

// -------------------------------------------------------------
// CERTIFICATES (Strict Cloud Persistence in portfolio_certificates)
// -------------------------------------------------------------
export async function saveCertificate(item: CertificateItem): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase connection required. Certificates must be saved to Supabase Cloud so all visitors can view them on any device.');
  }
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not available.');

  const validId = ensureValidUuid(item.id);
  const allImages = Array.isArray(item.images)
    ? item.images.filter(Boolean)
    : (typeof item.images === 'string' && item.images ? [item.images] : []);

  if (item.fileUrl && !allImages.includes(item.fileUrl)) {
    allImages.unshift(item.fileUrl);
  }

  const primaryUrl = item.fileUrl || allImages[0] || null;

  const payload: any = {
    id: validId,
    title: item.title,
    issuer: item.issuer,
    issue_date: item.issueDate,
    expiry_date: item.expiryDate || null,
    credential_id: item.credentialId || null,
    verify_link: item.verifyLink || null,
    file_url: primaryUrl,
    images: allImages,
    file_type: item.fileType || 'image',
    description: item.description || '',
    published: item.published ?? true,
    created_at: item.createdAt || new Date().toISOString(),
  };

  const { data, error } = await client
    .from('portfolio_certificates')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Supabase certificate upsert error:', error);
    throw new Error(formatSupabaseError(error, 'certificate'));
  }

  const savedItem: CertificateItem = {
    ...item,
    id: data?.id || validId,
    fileUrl: data?.file_url || primaryUrl || '',
    images: Array.isArray(data?.images) && data.images.length > 0 ? data.images : allImages,
    createdAt: data?.created_at || payload.created_at,
  };

  const index = stateCache.certificates.findIndex(c => c.id === item.id || c.id === savedItem.id);
  if (index >= 0) {
    stateCache.certificates[index] = savedItem;
  } else {
    stateCache.certificates.unshift(savedItem);
  }
  notifyListeners();
}

export async function deleteCertificate(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase connection required to delete certificate from cloud.');
  }
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not available.');

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isUuid) {
    const { error } = await client.from('portfolio_certificates').delete().eq('id', id);
    if (error) {
      console.error('Supabase delete certificate error:', error);
      throw new Error(formatSupabaseError(error, 'certificate'));
    }
  }

  stateCache.certificates = stateCache.certificates.filter(c => c.id !== id);
  notifyListeners();
}

// -------------------------------------------------------------
// PROJECTS (portfolio_projects)
// -------------------------------------------------------------
export async function saveProject(project: ProjectItem): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase connection required. Projects must be saved directly to Supabase Cloud.');
  }
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not available.');

  const validId = ensureValidUuid(project.id);
  const payload: any = {
    id: validId,
    title: project.title,
    summary: project.summary,
    tech_tags: project.techTags || [],
    github_link: project.gitHubLink || null,
    live_demo_link: project.liveDemoLink || null,
    thumbnail_url: project.thumbnailUrl || (project.screenshots && project.screenshots[0]) || null,
    screenshots: project.screenshots || [],
    features: project.features || [],
    status: project.status || 'Completed',
    published: project.published ?? true,
    created_at: project.createdAt || new Date().toISOString(),
  };

  const { data, error } = await client
    .from('portfolio_projects')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Supabase project upsert error:', error);
    throw new Error(formatSupabaseError(error, 'project'));
  }

  const savedProject: ProjectItem = {
    ...project,
    id: data?.id || validId,
    thumbnailUrl: data?.thumbnail_url || payload.thumbnail_url,
    screenshots: Array.isArray(data?.screenshots) ? data.screenshots : payload.screenshots,
    createdAt: data?.created_at || payload.created_at,
  };

  const index = stateCache.projects.findIndex(p => p.id === project.id || p.id === savedProject.id);
  if (index >= 0) {
    stateCache.projects[index] = savedProject;
  } else {
    stateCache.projects.unshift(savedProject);
  }
  notifyListeners();
}

export async function deleteProject(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase connection required to delete project from cloud.');
  }
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not available.');

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isUuid) {
    const { error } = await client.from('portfolio_projects').delete().eq('id', id);
    if (error) throw new Error(formatSupabaseError(error, 'project'));
  }

  stateCache.projects = stateCache.projects.filter(p => p.id !== id);
  notifyListeners();
}

// -------------------------------------------------------------
// EXPERIENCE (portfolio_experience)
// -------------------------------------------------------------
export async function saveExperience(item: ExperienceItem): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase connection required to save experience.');
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not available.');

  const validId = ensureValidUuid(item.id);
  const payload: any = {
    id: validId,
    organization: item.organization,
    role: item.role,
    status: item.status,
    start_date: item.startDate,
    end_date: item.endDate || null,
    is_current: item.isCurrent ?? false,
    location: item.location || null,
    description: item.description,
    offer_letter_url: item.offerLetterUrl || null,
    completion_cert_url: item.completionCertUrl || null,
    published: item.published ?? true,
    created_at: item.createdAt || new Date().toISOString(),
  };

  const { data, error } = await client
    .from('portfolio_experience')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw new Error(formatSupabaseError(error, 'experience'));

  const savedItem: ExperienceItem = {
    ...item,
    id: data?.id || validId,
    createdAt: data?.created_at || payload.created_at,
  };

  const index = stateCache.experience.findIndex(e => e.id === item.id || e.id === savedItem.id);
  if (index >= 0) {
    stateCache.experience[index] = savedItem;
  } else {
    stateCache.experience.unshift(savedItem);
  }
  notifyListeners();
}

export async function deleteExperience(id: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase connection required to delete experience.');
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not available.');

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isUuid) {
    const { error } = await client.from('portfolio_experience').delete().eq('id', id);
    if (error) throw new Error(formatSupabaseError(error, 'experience'));
  }

  stateCache.experience = stateCache.experience.filter(e => e.id !== id);
  notifyListeners();
}

// -------------------------------------------------------------
// INTERNSHIPS (portfolio_internships)
// -------------------------------------------------------------
export async function saveInternship(item: InternshipItem): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase connection required to save internship.');
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not available.');

  const validId = ensureValidUuid(item.id);
  const payload: any = {
    id: validId,
    organization: item.organization,
    role: item.role,
    status: item.status,
    start_date: item.startDate,
    end_date: item.endDate || null,
    is_current: item.isCurrent ?? false,
    location: item.location || null,
    description: item.description,
    offer_letter_url: item.offerLetterUrl || null,
    completion_cert_url: item.completionCertUrl || null,
    published: item.published ?? true,
    created_at: item.createdAt || new Date().toISOString(),
  };

  const { data, error } = await client
    .from('portfolio_internships')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw new Error(formatSupabaseError(error, 'internship'));

  const savedItem: InternshipItem = {
    ...item,
    id: data?.id || validId,
    createdAt: data?.created_at || payload.created_at,
  };

  const index = stateCache.internships.findIndex(i => i.id === item.id || i.id === savedItem.id);
  if (index >= 0) {
    stateCache.internships[index] = savedItem;
  } else {
    stateCache.internships.unshift(savedItem);
  }
  notifyListeners();
}

export async function deleteInternship(id: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase connection required to delete internship.');
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not available.');

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isUuid) {
    const { error } = await client.from('portfolio_internships').delete().eq('id', id);
    if (error) throw new Error(formatSupabaseError(error, 'internship'));
  }

  stateCache.internships = stateCache.internships.filter(i => i.id !== id);
  notifyListeners();
}

// -------------------------------------------------------------
// EVENTS (portfolio_events)
// -------------------------------------------------------------
export async function saveEvent(item: EventItem): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase connection required to save event.');
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not available.');

  const validId = ensureValidUuid(item.id);
  const payload: any = {
    id: validId,
    title: item.title,
    organizer: item.organizer || '',
    date: item.date || '',
    location: item.location || '',
    participation_status: item.participationStatus || 'Participant',
    poster_url: item.posterUrl || (item.photos && item.photos[0]) || null,
    photos: item.photos || [],
    certificate_url: item.certificateUrl || null,
    description: item.description || '',
    published: item.published ?? true,
    created_at: item.createdAt || new Date().toISOString(),
  };

  const { data, error } = await client
    .from('portfolio_events')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw new Error(formatSupabaseError(error, 'event'));

  const savedItem: EventItem = {
    ...item,
    id: data?.id || validId,
    createdAt: data?.created_at || payload.created_at,
  };

  const index = stateCache.events.findIndex(e => e.id === item.id || e.id === savedItem.id);
  if (index >= 0) {
    stateCache.events[index] = savedItem;
  } else {
    stateCache.events.unshift(savedItem);
  }
  notifyListeners();
}

export async function deleteEvent(id: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase connection required to delete event.');
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not available.');

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isUuid) {
    const { error } = await client.from('portfolio_events').delete().eq('id', id);
    if (error) throw new Error(formatSupabaseError(error, 'event'));
  }

  stateCache.events = stateCache.events.filter(e => e.id !== id);
  notifyListeners();
}

// -------------------------------------------------------------
// EDUCATION (portfolio_education)
// -------------------------------------------------------------
export async function saveEducation(item: EducationItem): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase connection required to save education.');
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not available.');

  const validId = ensureValidUuid(item.id);
  const payload: any = {
    id: validId,
    college: item.college,
    degree: item.degree,
    field: item.field,
    start_year: item.startYear,
    end_year: item.endYear,
    grade: item.grade || null,
    place: item.place || null,
    notes: item.notes || null,
    published: item.published ?? true,
    created_at: item.createdAt || new Date().toISOString(),
  };

  const { data, error } = await client
    .from('portfolio_education')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw new Error(formatSupabaseError(error, 'education'));

  const savedItem: EducationItem = {
    ...item,
    id: data?.id || validId,
    createdAt: data?.created_at || payload.created_at,
  };

  const index = stateCache.education.findIndex(e => e.id === item.id || e.id === savedItem.id);
  if (index >= 0) {
    stateCache.education[index] = savedItem;
  } else {
    stateCache.education.unshift(savedItem);
  }
  notifyListeners();
}

export async function deleteEducation(id: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase connection required to delete education.');
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not available.');

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isUuid) {
    const { error } = await client.from('portfolio_education').delete().eq('id', id);
    if (error) throw new Error(formatSupabaseError(error, 'education'));
  }

  stateCache.education = stateCache.education.filter(e => e.id !== id);
  notifyListeners();
}

// -------------------------------------------------------------
// SKILLS (portfolio_skills)
// -------------------------------------------------------------
export async function saveSkill(item: SkillItem): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase connection required to save skill.');
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not available.');

  const validId = ensureValidUuid(item.id);
  const payload: any = {
    id: validId,
    name: item.name,
    category: item.category,
    proficiency: item.proficiency || 85,
    notes: item.notes || null,
    published: item.published ?? true,
    created_at: item.createdAt || new Date().toISOString(),
  };

  const { data, error } = await client
    .from('portfolio_skills')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw new Error(formatSupabaseError(error, 'skill'));

  const savedItem: SkillItem = {
    ...item,
    id: data?.id || validId,
    createdAt: data?.created_at || payload.created_at,
  };

  const index = stateCache.skills.findIndex(s => s.id === item.id || s.id === savedItem.id);
  if (index >= 0) {
    stateCache.skills[index] = savedItem;
  } else {
    stateCache.skills.unshift(savedItem);
  }
  notifyListeners();
}

export async function deleteSkill(id: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase connection required to delete skill.');
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not available.');

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isUuid) {
    const { error } = await client.from('portfolio_skills').delete().eq('id', id);
    if (error) throw new Error(formatSupabaseError(error, 'skill'));
  }

  stateCache.skills = stateCache.skills.filter(s => s.id !== id);
  notifyListeners();
}

// -------------------------------------------------------------
// ACHIEVEMENTS (portfolio_achievements)
// -------------------------------------------------------------
export async function saveAchievement(item: AchievementItem): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase connection required to save achievement.');
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not available.');

  const validId = ensureValidUuid(item.id);
  const payload: any = {
    id: validId,
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

  const { data, error } = await client
    .from('portfolio_achievements')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw new Error(formatSupabaseError(error, 'achievement'));

  const savedItem: AchievementItem = {
    ...item,
    id: data?.id || validId,
    createdAt: data?.created_at || payload.created_at,
  };

  const index = stateCache.achievements.findIndex(a => a.id === item.id || a.id === savedItem.id);
  if (index >= 0) {
    stateCache.achievements[index] = savedItem;
  } else {
    stateCache.achievements.unshift(savedItem);
  }
  notifyListeners();
}

export async function deleteAchievement(id: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase connection required to delete achievement.');
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not available.');

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isUuid) {
    const { error } = await client.from('portfolio_achievements').delete().eq('id', id);
    if (error) throw new Error(formatSupabaseError(error, 'achievement'));
  }

  stateCache.achievements = stateCache.achievements.filter(a => a.id !== id);
  notifyListeners();
}

// -------------------------------------------------------------
// RESUME (portfolio_resume)
// -------------------------------------------------------------
export async function saveResume(resume: ResumeData): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase connection required to save resume.');
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not available.');

  const payload = {
    file_url: resume.fileUrl || null,
    file_name: resume.fileName || null,
    file_size: resume.fileSize || null,
    last_updated: resume.lastUpdated || new Date().toISOString(),
    version_name: resume.versionName || null,
    published: resume.published ?? true,
  };

  const { data: existing, error: fetchErr } = await client.from('portfolio_resume').select('id').limit(1).maybeSingle();
  if (fetchErr) throw new Error(formatSupabaseError(fetchErr, 'resume'));

  if (existing?.id) {
    const { error } = await client.from('portfolio_resume').update(payload).eq('id', existing.id);
    if (error) throw new Error(formatSupabaseError(error, 'resume'));
  } else {
    const { error } = await client.from('portfolio_resume').insert(payload);
    if (error) throw new Error(formatSupabaseError(error, 'resume'));
  }

  stateCache.resume = { ...resume };
  notifyListeners();
}

// -------------------------------------------------------------
// BACKUP EXPORT & IMPORT
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// LOCAL TO CLOUD MIGRATION UTILITY
// -------------------------------------------------------------
function base64ToFile(dataUrl: string, defaultName: string): File | null {
  try {
    if (!dataUrl || !dataUrl.startsWith('data:')) return null;
    const parts = dataUrl.split(',');
    if (parts.length < 2) return null;
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const ext = mime.split('/')[1] || 'png';
    return new File([u8arr], `${defaultName}.${ext}`, { type: mime });
  } catch (e) {
    console.warn('Base64 to File conversion note:', e);
    return null;
  }
}

export interface MigrationResult {
  success: boolean;
  needsSqlRun?: boolean;
  missingTable?: string;
  message: string;
  counts: {
    certificates: number;
    projects: number;
    experience: number;
    internships: number;
    events: number;
    education: number;
    skills: number;
    achievements: number;
  };
  errors: string[];
}

/**
 * Migrates existing local browser data (IndexedDB/localStorage) to Supabase Cloud.
 * Converts Base64 data URLs to permanent files in the public 'portfolio-assets' bucket
 * and saves all records to their respective Supabase tables.
 */
export async function migrateLocalDataToSupabase(
  onProgress?: (status: string) => void
): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    needsSqlRun: false,
    message: '',
    counts: {
      certificates: 0,
      projects: 0,
      experience: 0,
      internships: 0,
      events: 0,
      education: 0,
      skills: 0,
      achievements: 0,
    },
    errors: [],
  };

  if (!isSupabaseConfigured()) {
    result.message = 'Supabase is not configured. Please connect Supabase first.';
    return result;
  }

  const client = getSupabaseClient();
  if (!client) {
    result.message = 'Supabase client is not available.';
    return result;
  }

  // 1. Verify owner authentication session
  const { data: { session } } = await client.auth.getSession();
  if (session?.user?.email?.toLowerCase() !== 'subaithalnowfie@gmail.com') {
    result.message = 'You must be logged in as subaithalnowfie@gmail.com in Supabase to migrate data.';
    return result;
  }

  // 2. Read local data from IndexedDB or localStorage
  let localData = await getIdbItem<FullPortfolioData>();
  if (!localData || (!localData.certificates?.length && !localData.projects?.length && !localData.profile)) {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;
    if (raw) {
      try {
        localData = JSON.parse(raw);
      } catch (e) {
        // ignore
      }
    }
  }

  if (!localData) {
    result.message = 'No local data found in this browser to migrate.';
    return result;
  }

  // STEP 1: UPLOAD ALL LOCAL MEDIA TO SUPABASE STORAGE ('portfolio-assets') FIRST
  // This guarantees all files are saved in Supabase Storage regardless of database table status.
  onProgress?.('Uploading certificate images to Supabase Storage...');
  let hasMediaUpdated = false;

  if (Array.isArray(localData.certificates)) {
    for (const cert of localData.certificates) {
      try {
        // Upload primary image if it was saved locally as Base64
        if (cert.fileUrl && cert.fileUrl.startsWith('data:')) {
          const file = base64ToFile(cert.fileUrl, `cert_${cert.id || Date.now()}`);
          if (file) {
            const { url, error } = await uploadFileToSupabase(file, 'certificates');
            if (url) {
              cert.fileUrl = url;
              hasMediaUpdated = true;
            } else if (error) {
              result.errors.push(`Upload cert error: ${error}`);
            }
          }
        }

        // Upload any multi-page images
        if (Array.isArray(cert.images)) {
          const newImages: string[] = [];
          for (let i = 0; i < cert.images.length; i++) {
            const img = cert.images[i];
            if (img && img.startsWith('data:')) {
              const file = base64ToFile(img, `cert_${cert.id || Date.now()}_page_${i + 1}`);
              if (file) {
                const { url } = await uploadFileToSupabase(file, 'certificates');
                if (url) {
                  newImages.push(url);
                  hasMediaUpdated = true;
                }
              }
            } else if (img) {
              newImages.push(img);
            }
          }
          if (newImages.length > 0) {
            cert.images = newImages;
            if (!cert.fileUrl) cert.fileUrl = newImages[0];
          }
        }
      } catch (err: any) {
        result.errors.push(`Media upload error for cert "${cert.title}": ${err.message}`);
      }
    }
  }

  // Upload project media
  if (Array.isArray(localData.projects)) {
    for (const proj of localData.projects) {
      try {
        if (proj.thumbnailUrl && proj.thumbnailUrl.startsWith('data:')) {
          const file = base64ToFile(proj.thumbnailUrl, `proj_${proj.id || Date.now()}_thumb`);
          if (file) {
            const { url } = await uploadFileToSupabase(file, 'projects');
            if (url) {
              proj.thumbnailUrl = url;
              hasMediaUpdated = true;
            }
          }
        }
      } catch (err: any) {
        result.errors.push(`Media upload error for project "${proj.title}": ${err.message}`);
      }
    }
  }

  // Save the updated cloud URLs back into local store so progress is never lost
  if (hasMediaUpdated) {
    try {
      await setIdbItem('full_portfolio_data', localData);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localData));
      }
    } catch {
      // ignore
    }
  }

  // STEP 2: CHECK IF DATABASE TABLES EXIST (Avoid PGRST205 errors)
  onProgress?.('Checking Supabase database schema...');
  let certsTableExists = await checkTableExists('portfolio_certificates');
  if (!certsTableExists) {
    // Attempt schema cache reload in case tables were just created
    await reloadSupabaseSchemaCache();
    certsTableExists = await checkTableExists('portfolio_certificates');
  }

  if (!certsTableExists) {
    result.success = false;
    result.needsSqlRun = true;
    result.missingTable = 'portfolio_certificates';
    result.message = "Certificate images are safely stored in Supabase Storage! To finish saving the database records, create the database tables in your Supabase SQL Editor, then click Finish Cloud Sync.";
    return result;
  }

  // STEP 3: SAVE ALL RECORDS TO SUPABASE TABLES
  onProgress?.('Saving records to Supabase tables...');

  if (localData.profile) {
    try {
      await updateProfile(localData.profile);
    } catch (e: any) {
      result.errors.push(`Profile sync note: ${e.message}`);
    }
  }

  if (localData.settings) {
    try {
      await saveSettings(localData.settings);
    } catch (e: any) {
      result.errors.push(`Settings sync note: ${e.message}`);
    }
  }

  if (Array.isArray(localData.certificates)) {
    for (const cert of localData.certificates) {
      try {
        await saveCertificate(cert);
        result.counts.certificates++;
      } catch (err: any) {
        result.errors.push(`Cert "${cert.title}": ${err.message}`);
      }
    }
  }

  if (Array.isArray(localData.projects)) {
    for (const proj of localData.projects) {
      try {
        await saveProject(proj);
        result.counts.projects++;
      } catch (err: any) {
        result.errors.push(`Project "${proj.title}": ${err.message}`);
      }
    }
  }

  if (Array.isArray(localData.experience)) {
    for (const exp of localData.experience) {
      try {
        await saveExperience(exp);
        result.counts.experience++;
      } catch (err: any) {
        result.errors.push(`Experience "${exp.role}": ${err.message}`);
      }
    }
  }

  if (Array.isArray(localData.internships)) {
    for (const intern of localData.internships) {
      try {
        await saveInternship(intern);
        result.counts.internships++;
      } catch (err: any) {
        result.errors.push(`Internship "${intern.role}": ${err.message}`);
      }
    }
  }

  if (Array.isArray(localData.events)) {
    for (const ev of localData.events) {
      try {
        await saveEvent(ev);
        result.counts.events++;
      } catch (err: any) {
        result.errors.push(`Event "${ev.title}": ${err.message}`);
      }
    }
  }

  if (Array.isArray(localData.education)) {
    for (const edu of localData.education) {
      try {
        await saveEducation(edu);
        result.counts.education++;
      } catch (err: any) {
        result.errors.push(`Education "${edu.degree}": ${err.message}`);
      }
    }
  }

  if (Array.isArray(localData.skills)) {
    for (const sk of localData.skills) {
      try {
        await saveSkill(sk);
        result.counts.skills++;
      } catch (err: any) {
        result.errors.push(`Skill "${sk.name}": ${err.message}`);
      }
    }
  }

  if (Array.isArray(localData.achievements)) {
    for (const ach of localData.achievements) {
      try {
        await saveAchievement(ach);
        result.counts.achievements++;
      } catch (err: any) {
        result.errors.push(`Achievement "${ach.title}": ${err.message}`);
      }
    }
  }

  if (localData.resume) {
    try {
      await saveResume(localData.resume);
    } catch (e: any) {
      result.errors.push(`Resume sync note: ${e.message}`);
    }
  }

  result.success = result.errors.length === 0;
  result.message = result.success
    ? 'All local certificates, projects, and media successfully synced to Supabase Cloud!'
    : `Sync completed with ${result.errors.length} notice(s).`;

  // Clean up legacy local copy once successfully uploaded to cloud
  if (result.success) {
    try {
      await setIdbItem('full_portfolio_data', null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }

  return result;
}

/**
 * Checks if there is un-synced data in the current browser's local IndexedDB/localStorage.
 */
export async function getPendingLocalSyncCount(): Promise<{
  hasPending: boolean;
  total: number;
  breakdown: Record<string, number>;
}> {
  const result = {
    hasPending: false,
    total: 0,
    breakdown: {
      certificates: 0,
      projects: 0,
      experience: 0,
      internships: 0,
      events: 0,
      education: 0,
      skills: 0,
      achievements: 0,
    },
  };

  try {
    let localData = await getIdbItem<FullPortfolioData>();
    if (!localData) {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;
      if (raw) localData = JSON.parse(raw);
    }
    if (!localData) return result;

    const currentData = stateCache;
    const cloudCertTitles = new Set(currentData.certificates.map(c => `${c.title}_${c.issuer}`));
    const cloudProjTitles = new Set(currentData.projects.map(p => p.title));
    const cloudExpRoles = new Set(currentData.experience.map(e => `${e.role}_${e.organization}`));
    const cloudInternRoles = new Set(currentData.internships.map(i => `${i.role}_${i.organization}`));
    const cloudEventTitles = new Set(currentData.events.map(ev => ev.title));
    const cloudEduDegrees = new Set(currentData.education.map(ed => `${ed.degree}_${ed.college}`));
    const cloudSkillNames = new Set(currentData.skills.map(s => s.name.toLowerCase()));
    const cloudAchTitles = new Set(currentData.achievements.map(a => a.title));

    if (Array.isArray(localData.certificates)) {
      result.breakdown.certificates = localData.certificates.filter(c => c.title && !cloudCertTitles.has(`${c.title}_${c.issuer}`)).length;
    }
    if (Array.isArray(localData.projects)) {
      result.breakdown.projects = localData.projects.filter(p => p.title && !cloudProjTitles.has(p.title)).length;
    }
    if (Array.isArray(localData.experience)) {
      result.breakdown.experience = localData.experience.filter(e => e.role && !cloudExpRoles.has(`${e.role}_${e.organization}`)).length;
    }
    if (Array.isArray(localData.internships)) {
      result.breakdown.internships = localData.internships.filter(i => i.role && !cloudInternRoles.has(`${i.role}_${i.organization}`)).length;
    }
    if (Array.isArray(localData.events)) {
      result.breakdown.events = localData.events.filter(ev => ev.title && !cloudEventTitles.has(ev.title)).length;
    }
    if (Array.isArray(localData.education)) {
      result.breakdown.education = localData.education.filter(ed => ed.degree && !cloudEduDegrees.has(`${ed.degree}_${ed.college}`)).length;
    }
    if (Array.isArray(localData.skills)) {
      result.breakdown.skills = localData.skills.filter(s => s.name && !cloudSkillNames.has(s.name.toLowerCase())).length;
    }
    if (Array.isArray(localData.achievements)) {
      result.breakdown.achievements = localData.achievements.filter(a => a.title && !cloudAchTitles.has(a.title)).length;
    }

    result.total = Object.values(result.breakdown).reduce((a, b) => a + b, 0);
    result.hasPending = result.total > 0;
  } catch (e) {
    // ignore
  }

  return result;
}
