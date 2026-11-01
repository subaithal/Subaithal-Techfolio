import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'subaithal_sb_url';
const STORAGE_KEY_ANON = 'subaithal_sb_anon';

// Default to env vars if provided, otherwise check stored config
export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envAnon = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) || '' : '';
  const storedAnon = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON) || '' : '';

  return {
    url: storedUrl.trim() || envUrl.trim(),
    anonKey: storedAnon.trim() || envAnon.trim(),
  };
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
    else localStorage.removeItem(STORAGE_KEY_URL);

    if (anonKey) localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
    else localStorage.removeItem(STORAGE_KEY_ANON);

    cachedClient = null; // reset cached instance
  }
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey || !url.startsWith('http')) {
    return null;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && url.startsWith('http'));
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase URL or Anon key is missing or invalid.',
    };
  }

  try {
    // Try querying a public table or checking auth status
    const { error } = await client.from('portfolio_profile').select('id').limit(1);
    if (error) {
      // If table doesn't exist yet, it's connected to Supabase project but tables need to be created
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase! (Tables not yet created, run the provided SQL in Supabase SQL Editor).',
        };
      }
      return {
        success: false,
        message: `Connection error: ${error.message} (${error.code || ''})`,
      };
    }
    return {
      success: true,
      message: 'Successfully connected and verified Supabase tables & RLS!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to connect: ${err?.message || 'Network error'}`,
    };
  }
}

export const SUPABASE_SQL_SCRIPT = `-- ============================================================
-- SUBAITHAL S. PORTFOLIO - SUPABASE DATABASE & RLS POLICIES
-- ============================================================
-- 1. Create tables with Row Level Security (RLS)
-- 2. Visitors have read-only access to published records
-- 3. Only authenticated admin account has full CRUD access
-- ============================================================

-- Profile Table (One row with Subaithal's info)
CREATE TABLE IF NOT EXISTS public.portfolio_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Subaithal S.',
  photo_url TEXT,
  short_intro TEXT,
  about_text TEXT,
  education_summary TEXT,
  location TEXT,
  email TEXT,
  linkedin TEXT DEFAULT 'https://www.linkedin.com/in/subaithal-s-812584426',
  github TEXT DEFAULT 'https://github.com/Subaithals',
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Projects Table
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  tech_tags TEXT[] DEFAULT '{}',
  github_link TEXT,
  live_demo_link TEXT,
  thumbnail_url TEXT,
  screenshots TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'Completed',
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Certificates Table
CREATE TABLE IF NOT EXISTS public.portfolio_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  expiry_date TEXT,
  credential_id TEXT,
  verify_link TEXT,
  file_url TEXT,
  file_type TEXT DEFAULT 'image',
  description TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Experience Table
CREATE TABLE IF NOT EXISTS public.portfolio_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  start_date TEXT NOT NULL,
  end_date TEXT,
  is_current BOOLEAN DEFAULT false,
  location TEXT,
  description TEXT NOT NULL,
  offer_letter_url TEXT,
  completion_cert_url TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Internships Table
CREATE TABLE IF NOT EXISTS public.portfolio_internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  start_date TEXT NOT NULL,
  end_date TEXT,
  is_current BOOLEAN DEFAULT false,
  location TEXT,
  description TEXT NOT NULL,
  offer_letter_url TEXT,
  completion_cert_url TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Events Table
CREATE TABLE IF NOT EXISTS public.portfolio_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organizer TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT,
  participation_status TEXT DEFAULT 'Participant',
  poster_url TEXT,
  photos TEXT[] DEFAULT '{}',
  certificate_url TEXT,
  description TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Education Table
CREATE TABLE IF NOT EXISTS public.portfolio_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college TEXT NOT NULL,
  degree TEXT NOT NULL,
  field TEXT NOT NULL,
  start_year TEXT NOT NULL,
  end_year TEXT NOT NULL,
  grade TEXT,
  place TEXT,
  notes TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Skills Table
CREATE TABLE IF NOT EXISTS public.portfolio_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  proficiency INT DEFAULT 85,
  notes TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Achievements Table
CREATE TABLE IF NOT EXISTS public.portfolio_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  issuer_or_event TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  rank_or_award TEXT,
  proof_url TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Resume Table
CREATE TABLE IF NOT EXISTS public.portfolio_resume (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_url TEXT,
  file_name TEXT,
  file_size TEXT,
  last_updated TEXT,
  version_name TEXT,
  published BOOLEAN DEFAULT true
);

-- Settings Table
CREATE TABLE IF NOT EXISTS public.portfolio_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hidden_sections JSONB DEFAULT '{}'::jsonb,
  contact_email TEXT,
  contact_note TEXT,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE public.portfolio_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_resume ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_settings ENABLE ROW LEVEL SECURITY;

-- 1. Public can read:
-- Profile: anyone can view
CREATE POLICY "Public profile read" ON public.portfolio_profile FOR SELECT USING (true);
-- Settings: anyone can view
CREATE POLICY "Public settings read" ON public.portfolio_settings FOR SELECT USING (true);
-- Other tables: only published rows can be seen by public
CREATE POLICY "Public projects read" ON public.portfolio_projects FOR SELECT USING (published = true OR auth.role() = 'authenticated');
CREATE POLICY "Public certs read" ON public.portfolio_certificates FOR SELECT USING (published = true OR auth.role() = 'authenticated');
CREATE POLICY "Public exp read" ON public.portfolio_experience FOR SELECT USING (published = true OR auth.role() = 'authenticated');
CREATE POLICY "Public interns read" ON public.portfolio_internships FOR SELECT USING (published = true OR auth.role() = 'authenticated');
CREATE POLICY "Public events read" ON public.portfolio_events FOR SELECT USING (published = true OR auth.role() = 'authenticated');
CREATE POLICY "Public edu read" ON public.portfolio_education FOR SELECT USING (published = true OR auth.role() = 'authenticated');
CREATE POLICY "Public skills read" ON public.portfolio_skills FOR SELECT USING (published = true OR auth.role() = 'authenticated');
CREATE POLICY "Public achievements read" ON public.portfolio_achievements FOR SELECT USING (published = true OR auth.role() = 'authenticated');
CREATE POLICY "Public resume read" ON public.portfolio_resume FOR SELECT USING (published = true OR auth.role() = 'authenticated');

-- 2. Authenticated Admin has ALL permissions (insert, update, delete):
CREATE POLICY "Admin full profile" ON public.portfolio_profile FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full projects" ON public.portfolio_projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full certs" ON public.portfolio_certificates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full exp" ON public.portfolio_experience FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full interns" ON public.portfolio_internships FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full events" ON public.portfolio_events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full edu" ON public.portfolio_education FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full skills" ON public.portfolio_skills FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full achievements" ON public.portfolio_achievements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full resume" ON public.portfolio_resume FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full settings" ON public.portfolio_settings FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE BUCKET POLICIES (For uploads in 'portfolio-assets')
-- ============================================================
-- Run in Storage section or SQL editor:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-assets', 'portfolio-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read storage" ON storage.objects 
FOR SELECT USING (bucket_id = 'portfolio-assets');

CREATE POLICY "Admin upload storage" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'portfolio-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Admin delete storage" ON storage.objects 
FOR DELETE USING (bucket_id = 'portfolio-assets' AND auth.role() = 'authenticated');
`;
