export interface ProfileData {
  name: string;
  photoUrl?: string;
  shortIntro?: string;
  aboutText?: string;
  educationSummary?: string;
  location?: string;
  email?: string;
  linkedIn: string;
  gitHub: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  summary: string;
  techTags: string[];
  gitHubLink?: string;
  liveDemoLink?: string;
  thumbnailUrl?: string;
  screenshots: string[];
  features: string[];
  status: 'Planning' | 'In Progress' | 'Completed' | 'Live';
  published: boolean;
  createdAt: string;
}

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  verifyLink?: string;
  fileUrl?: string;
  fileType?: 'image' | 'pdf';
  description?: string;
  published: boolean;
  createdAt: string;
}

export interface ExperienceItem {
  id: string;
  organization: string;
  role: string;
  status: 'applied' | 'ongoing' | 'completed';
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  location?: string;
  description: string;
  offerLetterUrl?: string;
  completionCertUrl?: string;
  published: boolean;
  createdAt: string;
}

export interface InternshipItem {
  id: string;
  organization: string;
  role: string;
  status: 'applied' | 'ongoing' | 'completed';
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  location?: string;
  description: string;
  offerLetterUrl?: string;
  completionCertUrl?: string;
  published: boolean;
  createdAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  organizer: string;
  date: string;
  location?: string;
  participationStatus: 'Attendee' | 'Participant' | 'Speaker' | 'Volunteer' | 'Organizer' | 'Winner';
  posterUrl?: string;
  photos: string[];
  certificateUrl?: string;
  description?: string;
  published: boolean;
  createdAt: string;
}

export interface EducationItem {
  id: string;
  college: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  grade?: string;
  place?: string;
  notes?: string;
  published: boolean;
  createdAt: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'Technical' | 'Frontend' | 'Backend' | 'Languages' | 'Tools & Frameworks' | 'Soft Skills' | 'Other';
  proficiency?: number; // 1-100 or rating
  notes?: string;
  published: boolean;
  createdAt: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  issuerOrEvent: string;
  date: string;
  description: string;
  rankOrAward?: string;
  proofUrl?: string;
  published: boolean;
  createdAt: string;
}

export interface ResumeData {
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  lastUpdated?: string;
  versionName?: string;
  published: boolean;
}

export interface SiteSettings {
  hiddenSections: {
    projects?: boolean;
    certificates?: boolean;
    experience?: boolean;
    internships?: boolean;
    events?: boolean;
    skills?: boolean;
    education?: boolean;
    achievements?: boolean;
    resume?: boolean;
    contact?: boolean;
  };
  contactEmail?: string;
  contactNote?: string;
  customHeadingNote?: string;
}

export interface FullPortfolioData {
  profile: ProfileData;
  projects: ProjectItem[];
  certificates: CertificateItem[];
  experience: ExperienceItem[];
  internships: InternshipItem[];
  events: EventItem[];
  education: EducationItem[];
  skills: SkillItem[];
  achievements: AchievementItem[];
  resume: ResumeData;
  settings: SiteSettings;
  version: number;
}
