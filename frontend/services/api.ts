import { Job, IngestLog, JobInput, User, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

// --- MOCK DATA (Fallback) ---
const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    companyName: 'Tech Corp Uganda',
    location: 'Kampala',
    jobType: 'Full-time',
    description: 'We are looking for an experienced React developer to join our dynamic team. You will be responsible for building high-quality user interfaces.',
    requirements: ['3+ years React experience', 'TypeScript proficiency', 'Tailwind CSS mastery'],
    responsibilities: ['Develop new features', 'Code reviews', 'Mentor junior devs'],
    salaryRange: 'UGX 3M - 5M',
    deadline: '2024-12-31',
    categoryId: 'IT & Software',
    postedAt: new Date().toISOString(),
    applicationLink: 'https://example.com/apply',
    isFeatured: true,
    sourceType: 'MANUAL',
    views: 154,
    applicantsCount: 12
  },
  {
    id: '2',
    title: 'Logistics Coordinator',
    companyName: 'Swift Transporters',
    location: 'Entebbe',
    jobType: 'Contract',
    description: 'Manage fleet operations and coordinate deliveries across the central region.',
    requirements: ['Valid Driving Permit', 'Logistics experience', 'Good communication'],
    responsibilities: ['Fleet tracking', 'Driver scheduling'],
    salaryRange: 'UGX 800k - 1.2M',
    deadline: '2024-11-20',
    categoryId: 'Driving',
    postedAt: new Date(Date.now() - 86400000).toISOString(),
    applicationLink: 'mailto:jobs@swift.ug',
    isFeatured: false,
    sourceType: 'MANUAL',
    views: 45,
    applicantsCount: 3
  },
  {
    id: '3',
    title: 'Accountant',
    companyName: 'Global NGO',
    location: 'Gulu',
    jobType: 'Full-time',
    description: 'NGO looking for a certified accountant to handle grant reporting and audits.',
    requirements: ['CPA Level 2', 'QuickBooks', 'NGO experience'],
    responsibilities: ['Financial reporting', 'Budgeting'],
    salaryRange: 'UGX 2.5M',
    deadline: '2024-11-30',
    categoryId: 'NGO',
    postedAt: new Date(Date.now() - 172800000).toISOString(),
    applicationLink: 'https://ngo.org/careers',
    isFeatured: false,
    sourceType: 'MANUAL',
    views: 89,
    applicantsCount: 25
  }
];

const MOCK_LOGS: IngestLog[] = [
    {
        id: 'log-1',
        rawText: 'Hiring Driver urgently. Call 0772123456. Loc: Kampala. Pay 500k.',
        status: 'parsed',
        createdAt: new Date().toISOString(),
        parsedJson: {
            jobs: [{
                title: 'Driver',
                company: 'Unknown',
                location: 'Kampala',
                salary: '500k',
                contact: '0772123456'
            }]
        }
    },
    {
        id: 'log-2',
        rawText: 'Beware of scammers asking for money.',
        status: 'rejected',
        reason: 'No jobs found',
        createdAt: new Date(Date.now() - 3600000).toISOString()
    }
];

// --- MAPPERS (DB Snake_case -> Frontend CamelCase) ---
const mapJobFromDB = (dbJob: any): Job => ({
  id: dbJob.id,
  title: dbJob.title || 'Untitled',
  companyName: dbJob.company_name || 'Unknown Company',
  location: dbJob.location || 'Remote',
  jobType: dbJob.job_type || 'Unknown',
  description: dbJob.description || '',
  requirements: dbJob.requirements || [],
  responsibilities: dbJob.responsibilities || [],
  salaryRange: dbJob.salary_range,
  deadline: dbJob.deadline,
  categoryId: dbJob.category_id,
  postedAt: dbJob.created_at || new Date().toISOString(),
  applicationLink: dbJob.application_link,
  isFeatured: dbJob.is_featured || false,
  sourceType: dbJob.source_type || 'MANUAL',
  views: dbJob.views || 0,
  applicantsCount: dbJob.applicants_count || 0
});

const mapLogFromDB = (dbLog: any): IngestLog => ({
  id: dbLog.id,
  rawText: dbLog.raw_text,
  status: dbLog.status,
  parsedJson: dbLog.parsed_json,
  reason: dbLog.reason,
  createdAt: dbLog.created_at
});

// Helper to create a mock job
const createMockJob = (input: JobInput): Job => ({
    id: Math.random().toString(36).substr(2, 9),
    ...input,
    requirements: [],
    responsibilities: [],
    postedAt: new Date().toISOString(),
    isFeatured: false,
    sourceType: 'MANUAL',
    views: 0,
    applicantsCount: 0,
    jobType: input.jobType as any
});

export const api = {
  // --- AUTHENTICATION (Mock) ---
  login: async (email: string, role: UserRole = UserRole.SEEKER): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      id: email === 'admin@jobconnect.ug' ? 'admin-1' : `user-${Math.floor(Math.random() * 1000)}`,
      name: email.split('@')[0],
      email: email,
      role: email === 'admin@jobconnect.ug' ? UserRole.ADMIN : role,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    };
  },

  // --- JOBS ---
  getJobs: async (): Promise<Job[]> => {
    if (!isSupabaseConfigured()) {
        return MOCK_JOBS;
    }

    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.warn('Supabase error (using mock data):', error.message);
        return MOCK_JOBS;
      }
      if (!data || data.length === 0) return MOCK_JOBS;
      
      return data.map(mapJobFromDB);
    } catch (error) {
      console.warn('Unexpected error fetching jobs, using mock data:', error);
      return MOCK_JOBS;
    }
  },

  getJobById: async (id: string): Promise<Job | undefined> => {
    if (!isSupabaseConfigured()) {
        return MOCK_JOBS.find(j => j.id === id);
    }

    try {
        const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

        if (error || !data) return MOCK_JOBS.find(j => j.id === id);
        return mapJobFromDB(data);
    } catch (error) {
        return MOCK_JOBS.find(j => j.id === id);
    }
  },

  createJob: async (input: JobInput): Promise<Job> => {
    if (!isSupabaseConfigured()) {
        const newJob = createMockJob(input);
        MOCK_JOBS.unshift(newJob);
        return newJob;
    }

    const dbPayload = {
      title: input.title,
      company_name: input.companyName,
      location: input.location,
      job_type: input.jobType,
      description: input.description,
      application_link: input.applicationLink,
      salary_range: input.salaryRange,
      category_id: input.categoryId || 'general',
      deadline: input.deadline,
      is_featured: false,
      source_type: 'MANUAL',
      views: 0,
      applicants_count: 0
    };

    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert(dbPayload)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST205') {
            console.warn('Jobs table missing. Created local mock job instead.');
            const newJob = createMockJob(input);
            MOCK_JOBS.unshift(newJob);
            return newJob;
        }
        throw new Error(error.message);
      }
      return mapJobFromDB(data);
    } catch (e) {
        console.error("Create job failed", e);
        const newJob = createMockJob(input);
        MOCK_JOBS.unshift(newJob);
        return newJob;
    }
  },

  incrementViews: async (id: string) => {
    if (!isSupabaseConfigured()) return;
    try {
        const { data } = await supabase.from('jobs').select('views').eq('id', id).single();
        if (data) {
            await supabase.from('jobs').update({ views: (data.views || 0) + 1 }).eq('id', id);
        }
    } catch (e) {
        // Ignore view increment errors
    }
  },

  // --- SAVED JOBS ---
  toggleSaveJob: async (jobId: string, userId: string) => {
    if (!isSupabaseConfigured()) return;
    
    try {
      const { data } = await supabase
          .from('saved_jobs')
          .select('*')
          .eq('user_id', userId)
          .eq('job_id', jobId)
          .single();

      if (data) {
          await supabase.from('saved_jobs').delete().eq('id', data.id);
      } else {
          await supabase.from('saved_jobs').insert({ user_id: userId, job_id: jobId });
      }
    } catch (e) {
      console.error("Error toggling save", e);
    }
  },

  isJobSaved: async (jobId: string, userId: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) return false;
    try {
        const { data } = await supabase
            .from('saved_jobs')
            .select('id')
            .eq('user_id', userId)
            .eq('job_id', jobId)
            .single();
        return !!data;
    } catch (e) { return false; }
  },

  getSavedJobs: async (userId: string): Promise<Job[]> => {
    if (!isSupabaseConfigured()) return [MOCK_JOBS[0]];

    try {
        const { data, error } = await supabase
        .from('saved_jobs')
        .select('job_id, jobs(*)')
        .eq('user_id', userId);

        if (error || !data) return [];
        
        return data.map((item: any) => mapJobFromDB(item.jobs));
    } catch (error) {
        return [];
    }
  },

  // --- ADMIN INGESTION API ---
  getIngestQueue: async (): Promise<IngestLog[]> => {
    if (!isSupabaseConfigured()) return MOCK_LOGS;

    try {
        const { data, error } = await supabase
            .from('ingest_logs')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error || !data) {
            return MOCK_LOGS;
        }
        return data.map(mapLogFromDB);
    } catch (error) {
        return MOCK_LOGS;
    }
  },

  publishIngest: async (id: string) => {
      if (!isSupabaseConfigured()) {
          const log = MOCK_LOGS.find(l => l.id === id);
          if (log) log.status = 'published';
          return;
      }
      try {
          await supabase.from('ingest_logs').update({ status: 'published' }).eq('id', id);
      } catch (e) { console.error(e); }
  },

  rejectIngest: async (id: string) => {
      if (!isSupabaseConfigured()) {
          const log = MOCK_LOGS.find(l => l.id === id);
          if (log) log.status = 'rejected';
          return;
      }
      try {
          await supabase.from('ingest_logs').update({ status: 'rejected' }).eq('id', id);
      } catch (e) { console.error(e); }
  },

  addIngestLog: async (rawText: string, parsedJson: any) => {
      if (!isSupabaseConfigured()) {
          MOCK_LOGS.unshift({
              id: `log-${Date.now()}`,
              rawText,
              parsedJson,
              status: 'parsed',
              createdAt: new Date().toISOString()
          });
          return;
      }
      try {
          await supabase.from('ingest_logs').insert({
              raw_text: rawText,
              parsed_json: parsedJson,
              status: 'parsed',
              source_type: 'MANUAL_SIMULATION'
          });
      } catch (e) { console.error(e); }
  }
};