import React from 'react';
import CvAnalyzer from '../components/CvAnalyzer';
import { motion } from 'framer-motion';

const ServicesPage: React.FC = () => {
  return (
    <div className="bg-white pb-20">
      <div className="bg-indigo-900 text-white py-20 px-4 text-center relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute right-10 top-10 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl"></div>
            <div className="absolute left-10 bottom-10 w-64 h-64 bg-indigo-500 rounded-full filter blur-3xl"></div>
         </div>
         <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-4">Accelerate Your Career</h1>
            <p className="text-indigo-200 max-w-2xl mx-auto text-lg">
                Professional CV writing, LinkedIn optimization, and AI-powered tools tailored for the Ugandan market.
            </p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        {/* AI Feature Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2">
                <CvAnalyzer />
            </div>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl flex flex-col justify-between">
                <div>
                    <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Pro Service</span>
                    <h3 className="text-2xl font-bold mt-4 mb-2">Need a manual rewrite?</h3>
                    <p className="text-indigo-100 text-sm leading-relaxed">
                        Our AI is great, but nothing beats a human touch. Get a certified HR professional to rewrite your CV for maximum impact.
                    </p>
                </div>
                <div className="mt-8">
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-3xl font-bold">UGX 50,000</span>
                        <span className="text-indigo-200 line-through text-sm">UGX 80,000</span>
                    </div>
                    <button className="w-full py-3 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
                        Book Professional Rewrite
                    </button>
                    <p className="text-xs text-center mt-3 text-indigo-200">100% Satisfaction Guarantee</p>
                </div>
            </div>
        </div>

        <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900">Other Career Services</h2>
        </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 2 */}
            <motion.div whileHover={{ y: -5 }} className="border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-all bg-white">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Career Bundle</h3>
                <p className="text-slate-600 mb-6 h-20 text-sm">Includes CV Rewrite + Cover Letter + LinkedIn Profile Optimization.</p>
                <p className="text-2xl font-bold text-slate-900 mb-6">UGX 120,000</p>
                <button className="w-full py-3 border-2 border-purple-600 text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition-colors">View Details</button>
            </motion.div>

            {/* Service 3 */}
            <motion.div whileHover={{ y: -5 }} className="border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-all bg-white">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-6">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Mock Interview</h3>
                <p className="text-slate-600 mb-6 h-20 text-sm">1-hour session with an HR expert to practice and get feedback.</p>
                <p className="text-2xl font-bold text-slate-900 mb-6">UGX 80,000</p>
                <button className="w-full py-3 border-2 border-teal-600 text-teal-600 font-bold rounded-xl hover:bg-teal-50 transition-colors">Book Session</button>
            </motion.div>

             {/* Service 4 */}
             <motion.div whileHover={{ y: -5 }} className="border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-all bg-white">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">International Job Search</h3>
                <p className="text-slate-600 mb-6 h-20 text-sm">Consultation on applying for jobs in UAE, Qatar, and Europe.</p>
                <p className="text-2xl font-bold text-slate-900 mb-6">UGX 100,000</p>
                <button className="w-full py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors">Learn More</button>
            </motion.div>
         </div>
      </div>
    </div>
  );
};

export default ServicesPage;