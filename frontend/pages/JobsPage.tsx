
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import JobCard from '../components/JobCard';
import { Job } from '../types';
import { api } from '../services/api';
import { staggerContainer, staggerItem } from '../utils/animations';
import { UGANDA_DISTRICTS, JOB_TYPES } from '../utils/constants';

interface JobsPageProps {
  onJobClick: (id: string) => void;
}

const SkeletonCard = () => (
  <div className="h-64 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm overflow-hidden relative">
    <motion.div 
      className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50 to-transparent"
      animate={{ x: ['-100%', '100%'] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
    />
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 bg-slate-100 rounded-xl" />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-slate-100 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
      </div>
    </div>
    <div className="flex gap-2 mb-6">
      <div className="h-6 w-20 bg-slate-100 rounded-md" />
      <div className="h-6 w-20 bg-slate-100 rounded-md" />
    </div>
    <div className="space-y-2 mb-6">
       <div className="h-3 bg-slate-100 rounded w-full" />
       <div className="h-3 bg-slate-100 rounded w-5/6" />
    </div>
  </div>
);

const JobsPage: React.FC<JobsPageProps> = ({ onJobClick }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await api.getJobs();
        setJobs(data);
      } catch (err) {
        console.error("Failed to load jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          j.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || j.categoryId === selectedCategory;
    const matchesType = selectedType === 'all' || j.jobType === selectedType;
    // Flexible location matching
    const matchesLocation = selectedLocation === 'all' || j.location.toLowerCase().includes(selectedLocation.toLowerCase());

    return matchesSearch && matchesCategory && matchesType && matchesLocation;
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4"
          >
            Find Your Dream Job <span className="text-indigo-600">In Uganda</span>
          </motion.h1>
          
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.1, duration: 0.4 }}
             className="max-w-2xl mx-auto relative mt-6"
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              type="text" 
              placeholder="Search by job title, company, or keywords..." 
              className="block w-full pl-11 pr-4 py-4 border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters (Desktop) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:w-1/4 space-y-8"
          >
            <div>
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Locations</h3>
               <div className="relative">
                  <select 
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 transition-all cursor-pointer text-sm font-medium"
                  >
                    <option value="all">All Districts</option>
                    {UGANDA_DISTRICTS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
               </div>
            </div>

            <div>
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Job Type</h3>
               <div className="relative">
                  <select 
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 transition-all cursor-pointer text-sm font-medium"
                  >
                    <option value="all">All Job Types</option>
                    {JOB_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
               </div>
            </div>
            
            {/* Banner Ad Area */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 text-center"
            >
                <h4 className="font-bold text-indigo-800 mb-2">Need a CV Review?</h4>
                <p className="text-xs text-indigo-600 mb-3">Get hired 3x faster with a professional CV rewrite.</p>
                <button className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors">Check Services</button>
            </motion.div>
          </motion.div>

          {/* Results */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Job Listings</h2>
                  <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">{filteredJobs.length} found</span>
                </div>
                
                {filteredJobs.length > 0 ? (
                  <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    key={selectedLocation + selectedType + searchTerm} // Re-animate on filter change
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {filteredJobs.map(job => (
                      <motion.div 
                        key={job.id} 
                        variants={staggerItem}
                        onClick={() => onJobClick(job.id)} 
                        className="cursor-pointer"
                        layout
                      >
                         <JobCard job={job} onApply={() => onJobClick(job.id)} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed"
                  >
                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No jobs found matching filters</h3>
                    <button onClick={() => {setSearchTerm(''); setSelectedLocation('all'); setSelectedType('all');}} className="mt-2 text-indigo-600 text-sm font-medium hover:underline">Clear all filters</button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
