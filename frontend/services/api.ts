
import { Job, IngestLog, JobInput, User, UserRole, JobAlert } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

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
  applicantsCount: dbJob.applicants_count || 0,
  postedBy: dbJob.posted_by,
  status: dbJob.status
});

const mapLogFromDB = (dbLog: any): IngestLog => ({
  id: dbLog.id,
  rawText: dbLog.raw_text,
  status: dbLog.status,
  parsedJson: dbLog.parsed_json,
  reason: dbLog.reason,
  createdAt: dbLog.created_at
});

const mapAlertFromDB = (dbAlert: any): JobAlert => ({
  id: dbAlert.id,
  userId: dbAlert.user_id,
  keywords: dbAlert.keywords,
  location: dbAlert.location,
  jobType: dbAlert.job_type,
  createdAt: dbAlert.created_at
});

export const api = {
  // --- JOBS ---
  getJobs: async (): Promise<Job[]> => {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'PUBLISHED')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(mapJobFromDB);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  },

  // Fetch jobs specifically for the logged-in employer (includes pending/rejected)
  getEmployerJobs: async (userId: string): Promise<Job[]> => {
    if (!isSupabaseConfigured()) return [];
    try {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('posted_by', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapJobFromDB);
    } catch (error) {
        console.error('Error fetching employer jobs:', error);
        return [];
    }
  },

  getJobById: async (id: string): Promise<Job | undefined> => {
    if (!isSupabaseConfigured()) return undefined;

    try {
        const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

        if (error) throw error;
        return mapJobFromDB(data);
    } catch (error) {
        console.error('Error fetching job details:', error);
        return undefined;
    }
  },

  createJob: async (input: JobInput): Promise<Job | null> => {
    if (!isSupabaseConfigured()) return null;

    try {
      // Get current user for posted_by
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("User not authenticated");

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
        posted_by: user.id,
        // SECURITY CHANGE: Manual jobs now default to PENDING_APPROVAL for moderation
        status: 'PENDING_APPROVAL'
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert(dbPayload)
        .select()
        .single();

      if (error) throw error;

      return mapJobFromDB(data);
    } catch (e) {
        console.error("Create job failed", e);
        return null;
    }
  },

  incrementViews: async (id: string) => {
    if (!isSupabaseConfigured()) return;
    try {
        const { data } = await supabase.from('jobs').select('views').eq('id', id).single();
        if (data) {
            await supabase.from('jobs').update({ views: (data.views || 0) + 1 }).eq('id', id);
        }
    } catch (e) { /* ignore */ }
  },

  // --- JOB ALERTS ---
  getJobAlerts: async (userId: string): Promise<JobAlert[]> => {
    if (!isSupabaseConfigured()) return [];
    try {
      const { data, error } = await supabase
        .from('job_alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapAlertFromDB);
    } catch (error) {
      console.error("Error getting job alerts", error);
      return [];
    }
  },

  createJobAlert: async (userId: string, alert: Partial<JobAlert>): Promise<JobAlert | null> => {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('job_alerts')
        .insert({
          user_id: userId,
          keywords: alert.keywords,
          location: alert.location,
          job_type: alert.jobType
        })
        .select()
        .single();

      if (error) throw error;
      return mapAlertFromDB(data);
    } catch (error) {
      console.error("Error creating job alert", error);
      return null;
    }
  },

  deleteJobAlert: async (alertId: string) => {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.from('job_alerts').delete().eq('id', alertId);
    } catch (error) {
      console.error("Error deleting job alert", error);
    }
  },

  // Simulated backend process
  processJobAlerts: async (job: Job) => {
    if (!isSupabaseConfigured()) return;
    try {
        const { data: alerts } = await supabase.from('job_alerts').select('*');
        
        if (!alerts) return;

        const mappedAlerts = alerts.map(mapAlertFromDB);

        const matches = mappedAlerts.filter((alert: JobAlert) => {
             const locationMatch = !alert.location || alert.location === 'All' || job.location.includes(alert.location);
             const typeMatch = !alert.jobType || alert.jobType === 'All' || job.jobType === alert.jobType;
             const keywordMatch = !alert.keywords || 
                                  job.title.toLowerCase().includes(alert.keywords.toLowerCase()) ||
                                  job.description.toLowerCase().includes(alert.keywords.toLowerCase());
             return locationMatch && typeMatch && keywordMatch;
        });

        matches.forEach((match: JobAlert) => {
            console.log(`[SIMULATION] 📧 Notification sent to User ${match.userId} for Job "${job.title}" based on Alert #${match.id}`);
        });

    } catch (e) {
        console.error("Error processing alerts", e);
    }
  },

  // --- SAVED JOBS ---
  toggleSaveJob: async (jobId: string, userId: string) => {
    if (!isSupabaseConfigured()) return;
    
    try {
      const { data } = await supabase
          .from('saved_jobs')
          .select('id')
          .eq('user_id', userId)
          .eq('job_id', jobId)
          .maybeSingle();

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
            .maybeSingle();
        return !!data;
    } catch (e) { return false; }
  },

  getSavedJobs: async (userId: string): Promise<Job[]> => {
    if (!isSupabaseConfigured()) return [];

    try {
        const { data, error } = await supabase
        .from('saved_jobs')
        .select('job_id, jobs(*)')
        .eq('user_id', userId);

        if (error) throw error;
        
        return (data || [])
           .map((item: any) => item.jobs)
           .filter((j: any) => j !== null)
           .map(mapJobFromDB);
    } catch (error) {
        console.error("Error getting saved jobs", error);
        return [];
    }
  },

  // --- ADMIN APIs ---
  
  getIngestQueue: async (): Promise<IngestLog[]> => {
    if (!isSupabaseConfigured()) return [];
    try {
        const { data, error } = await supabase
            .from('ingest_logs')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return (data || []).map(mapLogFromDB);
    } catch (error) {
        console.error("Error getting ingest queue", error);
        return [];
    }
  },

  // Fetch Manual jobs waiting for approval
  getPendingJobs: async (): Promise<Job[]> => {
    if (!isSupabaseConfigured()) return [];
    try {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('status', 'PENDING_APPROVAL')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return (data || []).map(mapJobFromDB);
    } catch (error) {
        console.error("Error getting pending jobs", error);
        return [];
    }
  },

  approveJob: async (id: string) => {
      if (!isSupabaseConfigured()) return;
      try {
          const { data, error } = await supabase
            .from('jobs')
            .update({ status: 'PUBLISHED' })
            .eq('id', id)
            .select()
            .single();
          
          if (error) throw error;
          
          // Trigger alerts now that it is published
          if (data) {
              api.processJobAlerts(mapJobFromDB(data));
          }
      } catch (e) { console.error("Error approving job", e); }
  },

  rejectJob: async (id: string) => {
      if (!isSupabaseConfigured()) return;
      try {
          // We can either delete or set to REJECTED. Setting to REJECTED allows the user to see why.
          await supabase.from('jobs').update({ status: 'REJECTED' }).eq('id', id);
      } catch (e) { console.error("Error rejecting job", e); }
  },

  publishIngest: async (id: string) => {
      if (!isSupabaseConfigured()) return;
      try {
          const { data: log } = await supabase.from('ingest_logs').select('*').eq('id', id).single();
          if (!log || !log.parsed_json) return;

          const jobs = log.parsed_json.jobs || [];
          const { data: { user } } = await supabase.auth.getUser();
          
          for (const j of jobs) {
             const { data: newJob } = await supabase.from('jobs').insert({
                 title: j.title,
                 company_name: j.company || "Unknown",
                 location: j.location || "Uganda",
                 job_type: j.job_type || "Full-time",
                 description: j.description,
                 application_link: j.application_link,
                 salary_range: j.salary,
                 source_type: 'WHATSAPP',
                 source_message_id: id,
                 status: 'PUBLISHED',
                 posted_by: user?.id
             }).select().single();
             
             if (newJob) {
                api.processJobAlerts(mapJobFromDB(newJob));
             }
          }

          await supabase.from('ingest_logs').update({ status: 'published' }).eq('id', id);
      } catch (e) { console.error(e); }
  },

  rejectIngest: async (id: string) => {
      if (!isSupabaseConfigured()) return;
      try {
          await supabase.from('ingest_logs').update({ status: 'rejected' }).eq('id', id);
      } catch (e) { console.error(e); }
  },

  addIngestLog: async (rawText: string, parsedJson: any) => {
      if (!isSupabaseConfigured()) return;
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
