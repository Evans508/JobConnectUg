import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import JobsPage from './pages/JobsPage';
import AdminIngestPage from './pages/AdminIngestPage';
import PostJobModal from './components/PostJobModal';
import JobDetailsPage from './pages/JobDetailsPage';
import EmployerDashboard from './pages/EmployerDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import ServicesPage from './pages/ServicesPage';
import AuthModal from './components/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole } from './types';
import { pageVariants } from './utils/animations';

type View = 'jobs' | 'admin' | 'employer' | 'candidate' | 'services' | 'details';

const MainLayout: React.FC = () => {
  const [view, setView] = useState<View>('jobs');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { user, logout } = useAuth();

  const refreshData = () => setRefreshKey(prev => prev + 1);

  const navigateToJob = (id: string) => {
    setSelectedJobId(id);
    setView('details');
    window.scrollTo(0,0);
  };

  const handleBack = () => {
    setView('jobs');
    setSelectedJobId(null);
  };

  const handlePostJobClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else if (user.role === UserRole.SEEKER) {
      alert("Please sign in as an Employer to post jobs.");
    } else {
      setIsPostJobModalOpen(true);
    }
  };

  const handleProtectedNav = (target: View) => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setView(target);
    }
  };

  // Nav Item Component for clean animation
  const NavItem = ({ targetView, label, protectedRoute = false }: { targetView: View, label: string, protectedRoute?: boolean }) => (
    <button 
      onClick={() => protectedRoute ? handleProtectedNav(targetView) : setView(targetView)}
      className={`relative px-3 py-2 rounded-full text-sm font-medium transition-colors ${view === targetView ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
    >
      {view === targetView && (
        <motion.div
          layoutId="nav-pill"
          className="absolute inset-0 bg-slate-100 rounded-full"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('jobs')}>
              <motion.div 
                whileHover={{ rotate: 10 }}
                className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-md"
              >
                JC
              </motion.div>
              <span className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">
                JobConnect<span className="text-indigo-600">UG</span>
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <NavItem targetView="jobs" label="Jobs" />
              <NavItem targetView="services" label="CV Services" />
              
              <div className="hidden md:flex items-center space-x-1">
                  {user?.role === UserRole.EMPLOYER && <NavItem targetView="employer" label="Dashboard" />}
                  {(!user || user.role === UserRole.SEEKER) && <NavItem targetView="candidate" label="My Account" protectedRoute />}
                  {user?.role === UserRole.ADMIN && <NavItem targetView="admin" label="Admin" />}
              </div>

              <div className="w-px h-6 bg-slate-200 mx-2"></div>
              
              {!user ? (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors px-3"
                >
                  Sign In
                </button>
              ) : (
                <div className="flex items-center gap-3 pl-2">
                  <img src={user.avatarUrl} alt="User" className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300" />
                  <button onClick={logout} className="text-xs font-medium text-slate-400 hover:text-red-500">Logout</button>
                </div>
              )}

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePostJobClick}
                className="ml-2 bg-indigo-600 text-white px-4 sm:px-5 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 whitespace-nowrap"
              >
                Post Job
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={view === 'details' ? `details-${selectedJobId}` : view}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            className="w-full"
          >
            {view === 'jobs' && <JobsPage key={refreshKey} onJobClick={navigateToJob} />}
            {view === 'details' && selectedJobId && <JobDetailsPage jobId={selectedJobId} onBack={handleBack} />}
            {view === 'admin' && <AdminIngestPage />}
            {view === 'employer' && <EmployerDashboard />}
            {view === 'candidate' && <CandidateDashboard onJobClick={navigateToJob} />}
            {view === 'services' && <ServicesPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-20">
        <div className="max-w-7xl mx-auto py-12 px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-xs">JC</div>
            <span className="font-bold text-slate-900">JobConnect Uganda</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-indigo-600">Privacy</a>
            <a href="#" className="hover:text-indigo-600">Terms</a>
            <a href="#" className="hover:text-indigo-600">Contact</a>
          </div>
          <p className="text-slate-400 text-xs mt-4 md:mt-0">
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </footer>

      <PostJobModal 
        isOpen={isPostJobModalOpen} 
        onClose={() => setIsPostJobModalOpen(false)} 
        onSuccess={refreshData}
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <MainLayout />
  </AuthProvider>
);

export default App;