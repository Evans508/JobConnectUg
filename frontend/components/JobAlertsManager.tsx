
import React, { useEffect, useState } from 'react';
import { JobAlert } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { UGANDA_DISTRICTS, JOB_TYPES } from '../utils/constants';

const JobAlertsManager: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form State
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('All');
  const [jobType, setJobType] = useState('All');

  useEffect(() => {
    if (user) loadAlerts();
  }, [user]);

  const loadAlerts = async () => {
    if (!user) return;
    setLoading(true);
    const data = await api.getJobAlerts(user.id);
    setAlerts(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    try {
      const newAlert = await api.createJobAlert(user.id, {
        keywords,
        location: location === 'All' ? '' : location,
        jobType: jobType === 'All' ? '' : jobType
      });
      if (newAlert) {
        setAlerts([newAlert, ...alerts]);
        setKeywords('');
        setLocation('All');
        setJobType('All');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this alert?");
    if (confirm) {
      await api.deleteJobAlert(id);
      setAlerts(alerts.filter(a => a.id !== id));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div>
            <h3 className="font-bold text-slate-900">Job Alerts</h3>
            <p className="text-xs text-slate-500 mt-0.5">Get notified when new jobs match your criteria.</p>
        </div>
        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
            {alerts.length} Active
        </span>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Create New Alert</h4>
            <form onSubmit={handleCreate} className="space-y-3">
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Keywords</label>
                    <input 
                        type="text" 
                        placeholder="e.g. React, Driver, Sales" 
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={keywords}
                        onChange={e => setKeywords(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Location</label>
                    <select 
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                    >
                        <option value="All">Anywhere in Uganda</option>
                        {UGANDA_DISTRICTS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Job Type</label>
                    <select 
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        value={jobType}
                        onChange={e => setJobType(e.target.value)}
                    >
                        <option value="All">Any Job Type</option>
                        {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <button 
                    disabled={creating}
                    type="submit" 
                    className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50"
                >
                    {creating ? 'Saving...' : 'Create Alert'}
                </button>
            </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
            {loading ? (
                <div className="text-center py-10 text-slate-400 text-sm">Loading alerts...</div>
            ) : alerts.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-500 text-sm">No alerts set up yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {alerts.map(alert => (
                            <motion.div 
                                key={alert.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900 text-sm">{alert.keywords || 'Any Keywords'}</span>
                                    </div>
                                    <div className="flex gap-2 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {alert.location || 'Anywhere'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            {alert.jobType || 'Any Type'}
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDelete(alert.id)}
                                    className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                                    title="Delete Alert"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default JobAlertsManager;
