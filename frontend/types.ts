
export interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string;
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Freelance' | 'Unknown';
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  salaryRange?: string;
  deadline?: string;
  categoryId?: string;
  postedAt: string;
  applicationLink?: string;
  isFeatured: boolean;
  sourceType?: 'MANUAL' | 'WHATSAPP';
  views?: number;
  applicantsCount?: number;
}

export interface JobInput {
  title: string;
  companyName: string;
  location: string;
  jobType: string;
  description: string;
  applicationLink: string;
  salaryRange?: string;
  categoryId?: string;
  deadline?: string;
}

export interface IngestLog {
  id: string;
  rawText: string;
  status: 'pending' | 'parsed' | 'published' | 'rejected';
  parsedJson?: any;
  reason?: string;
  createdAt: string;
}

export enum UserRole {
  SEEKER = 'SEEKER',
  EMPLOYER = 'EMPLOYER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  cvUrl?: string;
}
