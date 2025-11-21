
import React, { useEffect, useState } from 'react';
import { Job } from '../types';
import { api } from '../services/api';
import { motion } from 'framer-motion';
import { buttonClick } from '../utils/animations';
import { useAuth } from '../context/AuthContext';

interface JobDetailsPageProps {
  jobId: string;
  onBack: () => void;
}

const JobDetailsPage: React.FC<JobDetailsPageProps> = ({ jobId, onBack }) => {
  const [job, setJob] = useState<Job | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      const data = await api.getJobById(jobId);
      setJob(data);
      if (data && user) {
        api.incrementViews(data.id);
        const savedStatus = await api.isJobSaved(data.id, user.id);
        setIsSaved(savedStatus);
      } else if (data) {
        api.incrementViews(data.id);
      }
      setLoading(false);
    };
    load();
  }, [jobId, user]);

  const handleSave = async () => {
    if (!user) {
      alert("Please sign in to save jobs.");
      return;
    }
    if (job) {
      await api.toggleSaveJob(job.id, user.id);
      setIsSaved(!isSaved);
    }
  };

  const handleApply = () => {
    if (job?.applicationLink) {
        window.open(job.applicationLink, '_blank');
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading job details...</div>;
  if (!job) return <div className="p-10 text-center text-slate-500">Job not found. <button onClick={onBack} className="text-indigo-600 underline">Go Back</button></div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pb-8 pt-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <button onClick={onBack} className="flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors text-sm font-medium group">
            <svg className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Jobs
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                className="w-16 h-16 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl font-bold border border-indigo-100 shadow-sm"
              >
                {job.companyName.charAt(0)}
              </motion.div>
              <div>
                <motion.h1 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="text-2xl md:text-3xl font-bold text-slate-900"
                >
                  {job.title}
                </motion.h1>
                <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.1 }}
                   className="flex items-center gap-2 mt-2 text-slate-500 text-sm"
                >
                  <span className="font-medium text-slate-700">{job.companyName}</span>
                  <span>•</span>
                  <span>{job.location}</span>
                  <span>•</span>
                  <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md text-xs font-bold uppercase">{job.jobType}</span>
                </motion.div>
              </div>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <motion.button 
                variants={buttonClick}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                onClick={handleSave}
                className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl border font-medium text-sm transition-colors flex justify-center items-center gap-2 ${isSaved ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                 <motion.svg 
                   animate={isSaved ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                   className={`w-5 h-5 ${isSaved ? 'fill-current' : 'text-slate-400'}`} 
                   fill="none" 
                   stroke="currentColor" 
                   viewBox="0 0 24 24"
                 >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                 </motion.svg>
                 {isSaved ? 'Saved' : 'Save Job'}
              </motion.button>
              <motion.button 
                variants={buttonClick}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                onClick={handleApply}
                className="flex-1 md:flex-none px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all"
              >
                Apply Now
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Column */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:w-2/3 space-y-8"
          >
            
            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Job Description</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>

            {/* Key Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Key Responsibilities</h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600">
                      <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Requirements</h2>
                <ul className="space-y-3">
                  {job.requirements.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:w-1/3 space-y-6"
          >
            
            {/* Job Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Job Overview</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Salary Range</p>
                  <p className="text-slate-700 font-medium mt-1">{job.salaryRange || 'Not Disclosed'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Posted Date</p>
                  <p className="text-slate-700 font-medium mt-1">{new Date(job.postedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Application Deadline</p>
                  <p className="text-slate-700 font-medium mt-1">{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Open until filled'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Source</p>
                  <p className="text-slate-700 font-medium mt-1 flex items-center gap-1">
                    {job.sourceType === 'WHATSAPP' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                           WhatsApp Group
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                           Verified Employer
                        </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
                 <button className="w-full py-2 text-slate-500 hover:text-red-600 text-sm font-medium transition-colors flex justify-center items-center gap-2">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                   Report this Job
                 </button>
              </div>
            </div>

            {/* Share Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg"
            >
                <h3 className="font-bold mb-2">Share with friends</h3>
                <p className="text-indigo-100 text-sm mb-4">Know someone who would be a great fit for this role?</p>
                <div className="flex gap-3">
                   <button className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg py-2 text-sm font-medium transition-colors">
                      WhatsApp
                   </button>
                   <button className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg py-2 text-sm font-medium transition-colors">
                      Copy Link
                   </button>
                </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
