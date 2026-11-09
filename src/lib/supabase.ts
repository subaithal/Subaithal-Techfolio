import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'subaithal_sb_url';
const STORAGE_KEY_ANON = 'subaithal_sb_anon';

// Default Supabase project URL for Subaithal Techfolio
export const DEFAULT_SUPABASE_URL = 'https://lopobdesxnqynmlpkppn.supabase.co';

// Default to env vars if provided (Vercel / Vite), otherwise check stored config or default
export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envAnon = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) || '' : '';
  const storedAnon = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON) || '' : '';

  const clean = (val: string) => (val ? val.replace(/^["']|["']$/g, '').trim() : '');

  // Environment variables from Vercel take precedence, followed by saved admin config, and project default
  const url = clean(envUrl) || clean(storedUrl) || DEFAULT_SUPABASE_URL;
  const anonKey = clean(envAnon) || clean(storedAnon);

  return {
    url,
    anonKey,
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

/**
 * Upload a file directly to Supabase Storage 'portfolio-assets' bucket
 * and return the permanent public HTTPS URL.
 */
export async function uploadFileToSupabase(
  file: File,
  folder: string = 'uploads'
): Promise<{ url: string | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return {
      url: null,
      error: 'Supabase is not connected. Please connect Supabase in the Admin Dashboard or configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.',
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { url: null, error: 'Could not connect to Supabase.' };
  }

  try {
    const fileExt = file.name.split('.').pop() || 'png';
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${cleanFileName}`;

    const { error: uploadError } = await client.storage
      .from('portfolio-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      if (uploadError.message.toLowerCase().includes('bucket not found')) {
        return {
          url: null,
          error: "Storage bucket 'portfolio-assets' not found in your Supabase project. In Supabase Dashboard, go to Storage -> New Bucket -> name it 'portfolio-assets' and toggle 'Public bucket' ON.",
        };
      }
      return { url: null, error: `Supabase Storage upload error: ${uploadError.message}` };
    }

    const { data: publicData } = client.storage
      .from('portfolio-assets')
      .getPublicUrl(filePath);

    if (!publicData?.publicUrl) {
      return { url: null, error: 'Failed to retrieve public URL from Supabase Storage.' };
    }

    return { url: publicData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err?.message || 'Storage upload failed.' };
  }
}

export const SUPABASE_SQL_SCRIPT = `-- ============================================================
-- SUBAITHAL S. PORTFOLIO - COMPLETE SUPABASE DATABASE & RLS POLICIES
-- ============================================================
-- 1. Create tables with IF NOT EXISTS (non-destructive)
-- 2. Add columns with IF NOT EXISTS
-- 3. Grant schema & table permissions to anon and authenticated roles
-- 4. Enable Row Level Security (RLS) on all 11 tables
-- 5. Drop any legacy or conflicting policies
-- 6. Public visitors have read-only SELECT access to published records
-- 7. Strictly restrict INSERT, UPDATE, DELETE to subaithalnowfie@gmail.com
-- 8. Configure public 'portfolio-assets' storage bucket with admin-only write
-- ============================================================

-- 1. TABLES CREATION (Non-destructive)
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

CREATE TABLE IF NOT EXISTS public.portfolio_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  expiry_date TEXT,
  credential_id TEXT,
  verify_link TEXT,
  file_url TEXT,
  images TEXT[] DEFAULT '{}',
  file_type TEXT DEFAULT 'image',
  description TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

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

CREATE TABLE IF NOT EXISTS public.portfolio_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  proficiency INT DEFAULT 85,
  notes TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.portfolio_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  issuer_or_event TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  rank_or_award TEXT,
  proof_url TEXT,
  proof_images TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.portfolio_resume (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_url TEXT,
  file_name TEXT,
  file_size TEXT,
  last_updated TEXT,
  version_name TEXT,
  published BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.portfolio_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hidden_sections JSONB DEFAULT '{}'::jsonb,
  contact_email TEXT,
  contact_note TEXT,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Ensure multi-image support columns exist if tables were created earlier
ALTER TABLE public.portfolio_certificates ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE public.portfolio_achievements ADD COLUMN IF NOT EXISTS proof_images TEXT[] DEFAULT '{}';
ALTER TABLE public.portfolio_events ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';
ALTER TABLE public.portfolio_projects ADD COLUMN IF NOT EXISTS screenshots TEXT[] DEFAULT '{}';

-- ============================================================
-- 2. TABLE & SCHEMA GRANTS (Ensures PostgREST roles have permissions)
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT, UPDATE, DELETE ON TABLES TO authenticated;

-- ============================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
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

-- Clean up any prior, legacy, or conflicting policies
DO $$
DECLARE
  t text;
  pol text;
  tables text[] := ARRAY[
    'portfolio_profile',
    'portfolio_projects',
    'portfolio_certificates',
    'portfolio_experience',
    'portfolio_internships',
    'portfolio_events',
    'portfolio_education',
    'portfolio_skills',
    'portfolio_achievements',
    'portfolio_resume',
    'portfolio_settings'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = t AND schemaname = 'public') LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol, t);
    END LOOP;
  END LOOP;
END $$;

-- 4. PUBLIC READ POLICIES
-- Profile and Settings: Public visitors can view profile and site settings
CREATE POLICY "Public profile read" ON public.portfolio_profile
  FOR SELECT USING (true);

CREATE POLICY "Public settings read" ON public.portfolio_settings
  FOR SELECT USING (true);

-- Published items are public; unpublished drafts are only visible to subaithalnowfie@gmail.com
CREATE POLICY "Public projects read" ON public.portfolio_projects
  FOR SELECT USING (published = true OR (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com'));

CREATE POLICY "Public certs read" ON public.portfolio_certificates
  FOR SELECT USING (published = true OR (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com'));

CREATE POLICY "Public exp read" ON public.portfolio_experience
  FOR SELECT USING (published = true OR (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com'));

CREATE POLICY "Public interns read" ON public.portfolio_internships
  FOR SELECT USING (published = true OR (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com'));

CREATE POLICY "Public events read" ON public.portfolio_events
  FOR SELECT USING (published = true OR (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com'));

CREATE POLICY "Public edu read" ON public.portfolio_education
  FOR SELECT USING (published = true OR (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com'));

CREATE POLICY "Public skills read" ON public.portfolio_skills
  FOR SELECT USING (published = true OR (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com'));

CREATE POLICY "Public achievements read" ON public.portfolio_achievements
  FOR SELECT USING (published = true OR (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com'));

CREATE POLICY "Public resume read" ON public.portfolio_resume
  FOR SELECT USING (published = true OR (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com'));

-- 5. OWNER-ONLY WRITE POLICIES (Strictly subaithalnowfie@gmail.com)
CREATE POLICY "Only subaithalnowfie can manage profile" ON public.portfolio_profile
  FOR ALL TO authenticated
  USING (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com')
  WITH CHECK (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com');

CREATE POLICY "Only subaithalnowfie can manage settings" ON public.portfolio_settings
  FOR ALL TO authenticated
  USING (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com')
  WITH CHECK (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com');

CREATE POLICY "Only subaithalnowfie can manage projects" ON public.portfolio_projects
  FOR ALL TO authenticated
  USING (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com')
  WITH CHECK (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com');

CREATE POLICY "Only subaithalnowfie can manage certificates" ON public.portfolio_certificates
  FOR ALL TO authenticated
  USING (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com')
  WITH CHECK (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com');

CREATE POLICY "Only subaithalnowfie can manage experience" ON public.portfolio_experience
  FOR ALL TO authenticated
  USING (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com')
  WITH CHECK (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com');

CREATE POLICY "Only subaithalnowfie can manage internships" ON public.portfolio_internships
  FOR ALL TO authenticated
  USING (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com')
  WITH CHECK (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com');

CREATE POLICY "Only subaithalnowfie can manage events" ON public.portfolio_events
  FOR ALL TO authenticated
  USING (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com')
  WITH CHECK (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com');

CREATE POLICY "Only subaithalnowfie can manage education" ON public.portfolio_education
  FOR ALL TO authenticated
  USING (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com')
  WITH CHECK (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com');

CREATE POLICY "Only subaithalnowfie can manage skills" ON public.portfolio_skills
  FOR ALL TO authenticated
  USING (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com')
  WITH CHECK (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com');

CREATE POLICY "Only subaithalnowfie can manage achievements" ON public.portfolio_achievements
  FOR ALL TO authenticated
  USING (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com')
  WITH CHECK (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com');

CREATE POLICY "Only subaithalnowfie can manage resume" ON public.portfolio_resume
  FOR ALL TO authenticated
  USING (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com')
  WITH CHECK (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com');

-- ============================================================
-- 6. STORAGE BUCKET POLICIES (portfolio-assets)
-- ============================================================
-- Ensure bucket exists and is public without dropping existing files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-assets', 'portfolio-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Clean up storage policies on storage.objects
DO $$
DECLARE
  pol text;
BEGIN
  FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage') LOOP
    IF pol ILIKE '%portfolio%' OR pol ILIKE '%subaithal%' OR pol ILIKE '%Public%' THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol);
    END IF;
  END LOOP;
END $$;

-- 1. Public visitors can view / download assets
CREATE POLICY "Public can view portfolio assets" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'portfolio-assets');

-- 2. ONLY subaithalnowfie@gmail.com can upload
CREATE POLICY "Only subaithalnowfie can upload portfolio assets" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio-assets'
    AND (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com')
  );

-- 3. ONLY subaithalnowfie@gmail.com can update
CREATE POLICY "Only subaithalnowfie can update portfolio assets" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'portfolio-assets'
    AND (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com')
  )
  WITH CHECK (
    bucket_id = 'portfolio-assets'
    AND (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com')
  );

-- 4. ONLY subaithalnowfie@gmail.com can delete
CREATE POLICY "Only subaithalnowfie can delete portfolio assets" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'portfolio-assets'
    AND (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'subaithalnowfie@gmail.com')
  );
`;

