
import React, { useEffect, useState } from 'react';
import { Job } from '../types';
import { api } from '../services/api';
import { motion } from 'framer-motion';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const EmployerDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
        if (!user) return;

        // Fetch jobs specific to this employer, regardless of status
        const employerJobs = await api.getEmployerJobs(user.id);
        
        // If no jobs found (or no backend), use some dummy data for the visualization demo
        if (employerJobs.length === 0 && !isSupabaseConfigured()) {
           const mockJobs: Job[] = [
             { 
               id: '1', 
               title: 'Senior React Dev', 
               companyName: 'Tech Corp',
               location: 'Kampala',
               jobType: 'Full-time',
               description: 'Mock description',
               views: 1240, 
               applicantsCount: 45, 
               postedAt: new Date().toISOString(), 
               status: 'PUBLISHED',
               isFeatured: false,
               requirements: ['React', 'TypeScript'],
               responsibilities: ['Build UI'],
               applicationLink: 'https://example.com'
             },
             { 
               id: '2', 
               title: 'UI Designer', 
               companyName: 'Design Studio',
               location: 'Entebbe',
               jobType: 'Contract',
               description: 'Mock description',
               views: 850, 
               applicantsCount: 28, 
               postedAt: new Date().toISOString(), 
               status: 'PENDING_APPROVAL',
               isFeatured: false,
               requirements: ['Figma'],
               responsibilities: ['Design UI'],
               applicationLink: 'https://example.com'
             },
             { 
               id: '3', 
               title: 'Product Manager', 
               companyName: 'Innovate Ltd',
               location: 'Remote',
               jobType: 'Full-time',
               description: 'Mock description',
               views: 2100, 
               applicantsCount: 150, 
               postedAt: new Date().toISOString(), 
               status: 'PUBLISHED',
               isFeatured: true,
               requirements: ['Agile'],
               responsibilities: ['Manage Product'],
               applicationLink: 'https://example.com'
             },
           ];
           setJobs(mockJobs);
        } else {
           setJobs(employerJobs);
        }
        setLoading(false);
    }
    load();
  }, [user]);

  // Stats Calculation
  const totalViews = jobs.reduce((acc, j) => acc + (j.views || 0), 0);
  const totalApplicants = jobs.reduce((acc, j) => acc + (j.applicantsCount || 0), 0);
  const conversionRate = totalViews > 0 ? Math.round((totalApplicants / totalViews) * 100) : 0;

  // Mock Data Generation for Visuals (Simulating 7-day trends)
  const viewsTrend = [45, 52, 38, 65, 48, 55, 70].map(v => v * (totalViews > 0 ? totalViews / 400 : 1));
  const applicantsTrend = [12, 15, 8, 20, 14, 18, 25].map(v => v * (totalApplicants > 0 ? totalApplicants / 120 : 1));

  const getStatusBadge = (status?: string) => {
      switch(status) {
          case 'PUBLISHED':
              return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Active</span>;
          case 'PENDING_APPROVAL':
              return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">Pending Review</span>;
          case 'REJECTED':
              return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Rejected</span>;
          default:
              return <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-bold">{status || 'Unknown'}</span>;
      }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-end mb-8">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Employer Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your listings and track performance.</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all">
            Edit Company Profile
        </button>
      </div>

      {/* Visual Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         
         {/* 1. Views Chart (Area Chart) */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden"
         >
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Views</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">{totalViews.toLocaleString()}</h3>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-2 inline-block">
                        +12% this week
                    </span>
                </div>
                <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </div>
            </div>
            {/* SVG Area Chart Background */}
            <div className="absolute bottom-0 left-0 right-0 h-24 opacity-10 pointer-events-none">
                <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full">
                    <path d="M0,40 L0,25 Q15,15 30,30 T60,20 T100,10 L100,40 Z" fill="#4f46e5" />
                </svg>
            </div>
         </motion.div>

         {/* 2. Applicants Chart (Bar Chart) */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
         >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Applicants</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">{totalApplicants.toLocaleString()}</h3>
                </div>
                <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
            </div>
            {/* CSS Bar Chart */}
            <div className="flex items-end justify-between h-16 gap-2">
                {applicantsTrend.map((val, i) => (
                    <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${(val / (Math.max(...applicantsTrend) || 1)) * 100}%` }}
                        transition={{ duration: 0.5, delay: 0.2 + (i * 0.1) }}
                        className="w-full bg-purple-200 rounded-t-md hover:bg-purple-400 transition-colors"
                        title={`Day ${i+1}: ${Math.round(val)}`}
                    />
                ))}
            </div>
         </motion.div>

         {/* 3. Conversion Rate (Radial Chart) */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
         >
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversion</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{conversionRate}%</h3>
                <p className="text-xs text-slate-500 mt-2">Views to Applicants</p>
            </div>
            <div className="relative w-20 h-20">
                {/* Simple SVG Radial Progress */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    {/* Background Circle */}
                    <path
                        className="text-slate-100"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    {/* Progress Circle */}
                    <motion.path
                        className="text-indigo-600"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: conversionRate / 100 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray="100, 100"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-900">
                    {conversionRate}%
                </div>
            </div>
         </motion.div>

      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-900">Your Job Listings</h3>
        </div>
        {loading ? (
            <div className="p-8 text-center text-slate-500">Loading jobs...</div>
        ) : (
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
                        {jobs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm">
                                    You haven't posted any jobs yet.
                                </td>
                            </tr>
                        ) : (
                            jobs.map(job => (
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
                                        {getStatusBadge(job.status as string)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-3">Edit</button>
                                        <button className="text-slate-400 hover:text-slate-600 text-sm">Close</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
