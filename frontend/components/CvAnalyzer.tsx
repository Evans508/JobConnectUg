
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';

const CvAnalyzer: React.FC = () => {
  const [cvText, setCvText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!cvText.trim()) return;
    if (cvText.length < 50) {
        setError("Please paste a valid CV with at least 50 characters.");
        return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key is missing");

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
        You are an expert HR Manager and Resume Critic. 
        Analyze the following CV/Resume text for a job seeker in Uganda.
        
        Provide a critique in the following JSON structure:
        {
            "score": number (0-100),
            "summary": "string (2-3 sentences professional summary)",
            "strengths": ["string", "string", "string"],
            "weaknesses": ["string", "string", "string"],
            "action_items": ["string", "string", "string"]
        }

        Be strict but constructive.
        
        CV TEXT:
        "${cvText}"
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              action_items: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });

      const rawText = response.text || '{}';
      // Cleanup potential markdown wrapping more robustly
      let jsonString = rawText.trim();
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const json = JSON.parse(jsonString);
      setResult(json);

    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-indigo-900 p-6 text-white">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
          Free AI Resume Scan
        </h3>
        <p className="text-indigo-200 text-sm mt-1">Paste your CV text below to get an instant ATS score and feedback.</p>
      </div>
      
      <div className="p-6">
        <textarea
          className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all mb-4"
          placeholder="Paste your full resume content here..."
          value={cvText}
          onChange={(e) => setCvText(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          onClick={handleAnalyze}
          disabled={loading || !cvText}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Analyzing with Gemini...
            </>
          ) : (
            'Scan My CV'
          )}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 bg-slate-50"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                   <p className="text-sm text-slate-500 font-bold uppercase tracking-wide">ATS Score</p>
                   <div className="text-4xl font-extrabold text-slate-900 mt-1">{result.score}<span className="text-lg text-slate-400 font-medium">/100</span></div>
                </div>
                <div className="w-1/2">
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${result.score}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-full rounded-full ${
                        result.score > 75 ? 'bg-green-500' : result.score > 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-right mt-1 text-slate-500 font-medium">
                    {result.score > 75 ? 'Great Job!' : result.score > 50 ? 'Needs Improvement' : 'Critical Issues Found'}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-2">Summary</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{result.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Strengths
                        </h4>
                        <ul className="space-y-2">
                            {result.strengths.map((item: string, i: number) => (
                                <li key={i} className="text-sm text-slate-600 flex gap-2">
                                    <span className="text-green-500">•</span> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            Weaknesses
                        </h4>
                        <ul className="space-y-2">
                            {result.weaknesses.map((item: string, i: number) => (
                                <li key={i} className="text-sm text-slate-600 flex gap-2">
                                    <span className="text-red-500">•</span> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-indigo-700 mb-3">Suggested Improvements</h4>
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                        <ul className="space-y-2">
                            {result.action_items.map((item: string, i: number) => (
                                <li key={i} className="text-sm text-indigo-900 flex gap-2">
                                    <span className="font-bold text-indigo-500">{i + 1}.</span> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CvAnalyzer;
