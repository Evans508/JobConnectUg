
import React, { useEffect, useState } from 'react';
import { Job } from '../types';
import { api } from '../services/api';
import JobCard from '../components/JobCard';
import JobAlertsManager from '../components/JobAlertsManager';
import { useAuth } from '../context/AuthContext';

interface CandidateDashboardProps {
    onJobClick: (id: string) => void;
}

const CandidateDashboard: React.FC<CandidateDashboardProps> = ({ onJobClick }) => {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
        if (user) {
            const saved = await api.getSavedJobs(user.id);
            setSavedJobs(saved);
        }
    }
    load();
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
       <div className="flex flex-col md:flex-row gap-8">
          
          {/* Profile Sidebar */}
          <div className="md:w-1/3 lg:w-1/4 space-y-6">
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                <img src={user.avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full mx-auto mb-4 bg-slate-100" />
                <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                <p className="text-slate-500 text-sm">Software Engineer</p>
                <div className="mt-6 space-y-3">
                    <button className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                        Update Profile
                    </button>
                    <button className="w-full border border-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                        Upload New CV
                    </button>
                </div>
             </div>
          </div>

          {/* Main Content */}
          <div className="md:w-2/3 lg:w-3/4 space-y-8">
             
             {/* Job Alerts Section */}
             <JobAlertsManager />

             {/* Saved Jobs Section */}
             <div>
                 <h2 className="text-xl font-bold text-slate-900 mb-6">Saved Jobs</h2>
                 {savedJobs.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {savedJobs.map(job => (
                            <JobCard key={job.id} job={job} onApply={() => onJobClick(job.id)} />
                        ))}
                     </div>
                 ) : (
                     <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-500">You haven't saved any jobs yet.</p>
                        <button className="mt-2 text-indigo-600 font-medium hover:underline">Browse Jobs</button>
                     </div>
                 )}
             </div>
          </div>
       </div>
    </div>
  );
};

export default CandidateDashboard;