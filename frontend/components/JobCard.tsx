import React from 'react';
import { Job } from '../types';
import { motion } from 'framer-motion';
import { cardHover, buttonClick } from '../utils/animations';

interface JobCardProps {
  job: Job;
  onApply: (id: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply }) => {
  const isNew = (new Date().getTime() - new Date(job.postedAt).getTime()) < (7 * 24 * 60 * 60 * 1000);

  return (
    <motion.div 
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      whileTap="rest" // Don't lift on tap
      className={`group relative bg-white rounded-2xl p-6 transition-colors border ${job.isFeatured ? 'border-indigo-100 shadow-indigo-100/50' : 'border-slate-100 shadow-sm'}`}
    >
      {job.isFeatured && (
        <div className="absolute -top-3 -right-3">
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.2 }}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider"
          >
            Featured
          </motion.span>
        </div>
      )}
      
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${job.isFeatured ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                {job.companyName.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-sm text-slate-500 font-medium">{job.companyName}</p>
              </div>
            </div>
            {isNew && !job.isFeatured && (
              <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full border border-green-100">
                NEW
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
              <svg className="mr-1.5 h-3 w-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {job.location || 'Remote'}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
              <svg className="mr-1.5 h-3 w-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              {job.jobType || 'Full-time'}
            </span>
          </div>

          <p className="text-sm text-slate-600 line-clamp-2 mb-6 h-10">
            {job.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <span className="text-xs text-slate-400 font-medium">
             {new Date(job.postedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
          <motion.button 
            variants={buttonClick}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onClick={(e) => { e.stopPropagation(); onApply(job.id); }}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
          >
            Apply Now 
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default JobCard;