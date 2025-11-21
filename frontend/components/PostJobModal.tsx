
import React, { useState } from 'react';
import { api } from '../services/api';
import { JobInput } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { modalOverlay, modalPanel } from '../utils/animations';
import { UGANDA_DISTRICTS, JOB_TYPES } from '../utils/constants';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PostJobModal: React.FC<PostJobModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<JobInput>({
    title: '',
    companyName: '',
    location: 'Kampala',
    jobType: 'Full-time',
    description: '',
    applicationLink: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createJob(formData);
      onSuccess();
      onClose();
      // Reset form after slight delay to allow exit animation
      setTimeout(() => {
        setFormData({
          title: '',
          companyName: '',
          location: 'Kampala',
          jobType: 'Full-time',
          description: '',
          applicationLink: ''
        });
      }, 300);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div 
            variants={modalOverlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" 
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div 
            variants={modalPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative z-10"
          >
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-20">
              <h2 className="text-xl font-bold text-slate-900">Post a Job</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-500 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Job Title</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Senior Product Designer"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-slate-400"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Company Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Acme Corp"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-slate-400"
                    value={formData.companyName}
                    onChange={e => setFormData({...formData, companyName: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
                    <div className="relative">
                      <select 
                        required
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                        value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                      >
                        {UGANDA_DISTRICTS.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Job Type</label>
                    <div className="relative">
                      <select 
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                        value={formData.jobType}
                        onChange={e => setFormData({...formData, jobType: e.target.value})}
                      >
                        {JOB_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Describe the role, responsibilities, and requirements..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-slate-400 resize-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Application Link or Email</label>
                  <input 
                    required
                    type="text" 
                    placeholder="https://... or mailto:..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-slate-400"
                    value={formData.applicationLink}
                    onChange={e => setFormData({...formData, applicationLink: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-200 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  {loading ? 'Publishing...' : 'Publish Job Now'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PostJobModal;
