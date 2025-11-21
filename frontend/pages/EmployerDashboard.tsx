
import React, { useEffect, useState } from 'react';
import { Job } from '../types';
import { api } from '../services/api';

const EmployerDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const load = async () => {
        // In a real app, fetch only my jobs. Here filtering by MANUAL source for demo.
        const all = await api.getJobs();
        setJobs(all.filter(j => j.sourceType === 'MANUAL'));
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-end mb-8">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Employer Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your listings and view applicants.</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
            Edit Company Profile
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Jobs</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{jobs.length}</p>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Views</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{jobs.reduce((acc, j) => acc + (j.views || 0), 0)}</p>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Applicants</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{jobs.reduce((acc, j) => acc + (j.applicantsCount || 0), 0)}</p>
         </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-900">Your Job Listings</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                    <tr>
                        <th className="px-6 py-3">Title</th>
                        <th className="px-6 py-3">Posted</th>
                        <th className="px-6 py-3">Views</th>
                        <th className="px-6 py-3">Applicants</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {jobs.map(job => (
                        <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900">{job.title}</td>
                            <td className="px-6 py-4 text-slate-500 text-sm">{new Date(job.postedAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-slate-500 text-sm">{job.views || 0}</td>
                            <td className="px-6 py-4">
                                <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                                    {job.applicantsCount || 0}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                                    Active
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-3">Edit</button>
                                <button className="text-slate-400 hover:text-slate-600 text-sm">Close</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
