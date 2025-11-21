
import React, { useEffect, useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { IngestLog, Job } from '../types';
import { api } from '../services/api';
import { PRIMARY_EXTRACTION_PROMPT } from '../utils/prompts';

const AdminIngestPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'manual'>('whatsapp');
  
  const [logs, setLogs] = useState<IngestLog[]>([]);
  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  // Simulation State
  const [simMessage, setSimMessage] = useState('');
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    if (activeTab === 'whatsapp') {
        const data = await api.getIngestQueue();
        setLogs(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } else {
        const jobs = await api.getPendingJobs();
        setPendingJobs(jobs);
    }
    setLoading(false);
  };

  const handleIngestAction = async (id: string, action: 'approve' | 'reject') => {
    if (action === 'approve') await api.publishIngest(id);
    else await api.rejectIngest(id);
    loadData();
  };

  const handleJobAction = async (id: string, action: 'approve' | 'reject') => {
      const confirm = window.confirm(`Are you sure you want to ${action} this job?`);
      if (!confirm) return;

      if (action === 'approve') {
          await api.approveJob(id);
      } else {
          await api.rejectJob(id);
      }
      loadData();
  };

  const handleSimulateWebhook = async () => {
    if (!simMessage.trim()) return;
    setSimulating(true);

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            alert('API_KEY is missing!');
            setSimulating(false);
            return;
        }

        const ai = new GoogleGenAI({ apiKey });
        const contents = `${PRIMARY_EXTRACTION_PROMPT}\n\nInput Message:\n"${simMessage}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        jobs: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    company: { type: Type.STRING },
                                    location: { type: Type.STRING },
                                    salary: { type: Type.STRING },
                                    job_type: { type: Type.STRING },
                                    application_link: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    confidence: { type: Type.NUMBER },
                                    contact: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });

        const rawText = response.text || '{"jobs": []}';
        // Robust cleanup for markdown
        let jsonString = rawText.trim();
        if (jsonString.startsWith('```json')) {
          jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonString.startsWith('```')) {
          jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        const parsedJson = JSON.parse(jsonString);
        
        await api.addIngestLog(simMessage, parsedJson);
        setSimMessage('');
        await loadData();

    } catch (error) {
        console.error("Simulation failed:", error);
        alert("Failed to simulate. See console.");
    } finally {
        setSimulating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Console</h1>
        <p className="text-slate-500 text-sm mt-1">Manage ingestions and moderate user submissions.</p>
      </div>

      {/* Tab Switcher */}
      <div className="bg-white rounded-xl border border-slate-200 p-1 inline-flex mb-6 shadow-sm">
         <button 
           onClick={() => setActiveTab('whatsapp')}
           className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'whatsapp' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
         >
            WhatsApp Ingestion
         </button>
         <button 
           onClick={() => setActiveTab('manual')}
           className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'manual' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
         >
            Pending User Jobs
            {pendingJobs.length > 0 && activeTab !== 'manual' && (
                <span className="ml-2 bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingJobs.length}</span>
            )}
         </button>
      </div>

      {activeTab === 'whatsapp' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Controls */}
            <div className="space-y-6">
              {/* WhatsApp Status Panel */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                 <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                    Automation Status
                 </h3>
                 <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Connection</span>
                        <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">Active</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Last Sync</span>
                        <span className="text-slate-900 font-medium">2 mins ago</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Target Group</span>
                        <span className="text-slate-900 font-medium">Jobs Uganda (Main)</span>
                    </div>
                 </div>
              </div>

              {/* Simulation Tool */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">
                    Manual Import Simulation
                  </h2>
                </div>
                <div className="p-6">
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all mb-4 font-mono text-slate-700 resize-none"
                    rows={6}
                    placeholder="Paste raw message text here..."
                    value={simMessage}
                    onChange={(e) => setSimMessage(e.target.value)}
                  />
                  <button 
                    onClick={handleSimulateWebhook}
                    disabled={simulating || !simMessage}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2"
                  >
                    {simulating ? 'Processing...' : 'Extract & Queue'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Queue */}
            <div className="lg:w-2/3">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-slate-900">Ingestion Queue</h2>
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">{logs.filter(l => l.status === 'parsed').length} Needs Review</span>
               </div>
               
               <div className="space-y-4">
                {loading ? <p className="text-slate-500 text-center py-10">Loading queue...</p> : logs.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                     <p className="text-slate-400 text-sm">No activity logs found.</p>
                  </div>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md group">
                      <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          <div className={`h-2.5 w-2.5 rounded-full ${
                            log.status === 'pending' ? 'bg-yellow-400' :
                            log.status === 'parsed' ? 'bg-blue-500 animate-pulse' :
                            log.status === 'published' ? 'bg-green-500' :
                            'bg-red-500'
                          }`} />
                          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{log.status}</span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{new Date(log.createdAt).toLocaleString()}</span>
                      </div>

                      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Raw Message</h4>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-600 font-mono h-32 overflow-y-auto whitespace-pre-wrap">
                                {log.rawText}
                            </div>
                         </div>
                         <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gemini Parsed</h4>
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs text-green-400 font-mono h-32 overflow-y-auto">
                                {log.parsedJson ? JSON.stringify(log.parsedJson, null, 2) : <span className="text-slate-600">// Pending extraction...</span>}
                            </div>
                         </div>
                      </div>

                      {log.status === 'parsed' && (
                        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end gap-3">
                          <button onClick={() => handleIngestAction(log.id, 'reject')} className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            Reject
                          </button>
                          <button onClick={() => handleIngestAction(log.id, 'approve')} className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all">
                            Publish as Job
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
               </div>
            </div>
          </div>
      ) : (
          // Manual Jobs Tab
          <div className="max-w-4xl mx-auto">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-slate-900">User Job Submissions</h2>
                  <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">{pendingJobs.length} Pending</span>
               </div>

               <div className="space-y-4">
                {loading ? <p className="text-slate-500 text-center py-10">Loading pending jobs...</p> : pendingJobs.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                     <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     <p className="text-slate-500 text-sm">All jobs have been moderated.</p>
                  </div>
                ) : (
                  pendingJobs.map(job => (
                    <div key={job.id} className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <div className="flex items-center gap-3">
                             <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Pending Review</span>
                             <span className="text-xs text-slate-500">Submitted {new Date(job.postedAt).toLocaleString()}</span>
                        </div>
                        <span className="text-xs text-slate-400">ID: {job.id.substring(0,8)}</span>
                      </div>
                      
                      <div className="p-6">
                         <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                                <p className="text-sm text-indigo-600 font-medium">{job.companyName} &bull; {job.location}</p>
                            </div>
                         </div>
                         
                         <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700 mb-4 whitespace-pre-wrap">
                            {job.description}
                         </div>

                         <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 mb-6">
                            <div><span className="font-semibold">Type:</span> {job.jobType}</div>
                            <div><span className="font-semibold">Contact/Link:</span> {job.applicationLink}</div>
                            <div><span className="font-semibold">Posted By User ID:</span> {job.postedBy || 'Unknown'}</div>
                         </div>

                         <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                             <button onClick={() => handleJobAction(job.id, 'reject')} className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                Reject as Scam/Spam
                             </button>
                             <button onClick={() => handleJobAction(job.id, 'approve')} className="px-4 py-2 text-sm font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm hover:shadow-md transition-colors">
                                Approve & Publish
                             </button>
                         </div>
                      </div>
                    </div>
                  ))
                )}
               </div>
          </div>
      )}
    </div>
  );
};

export default AdminIngestPage;
