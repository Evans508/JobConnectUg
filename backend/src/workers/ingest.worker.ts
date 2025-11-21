
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from '@supabase/supabase-js';
import { PRIMARY_EXTRACTION_PROMPT } from "../parsing/prompts";

// Setup Supabase for Worker (Node environment)
// Ensure these are set in your backend environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || ''; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface IngestJob {
  id: string; // ID of the IngestLog record
}

export async function processIngestJob(jobData: IngestJob) {
  const logId = jobData.id;

  // 1. Fetch from DB
  const { data: logEntry, error } = await supabase
    .from('ingest_logs')
    .select('*')
    .eq('id', logId)
    .single();

  if (error || !logEntry || !process.env.API_KEY) {
    console.error("Missing log entry, supabase error, or API KEY");
    return;
  }

  // 2. Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 3. Prepare Prompt
  const contents = `${PRIMARY_EXTRACTION_PROMPT}\n\nInput Message:\n"${logEntry.raw_text}"`;

  try {
    // 4. Call Gemini
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
                }
              }
            }
          }
        }
      },
    });

    // 5. Parse Response
    const responseText = response.text;
    if (!responseText) throw new Error("Empty response from AI");

    const parsedData = JSON.parse(responseText);
    const jobs = parsedData.jobs || [];

    if (jobs.length === 0) {
      await supabase.from('ingest_logs').update({
        status: 'rejected',
        reason: 'No jobs found',
        parsed_json: parsedData
      }).eq('id', logId);
      return;
    }

    // 6. Deduplication & Persistence
    for (const job of jobs) {
        if (job.confidence < 0.7) {
             await supabase.from('ingest_logs').update({
                status: 'parsed', // Needs review
                parsed_json: parsedData,
                reason: 'Low confidence'
             }).eq('id', logId);
             continue;
        }

        // Check Duplicates
        const { data: existing } = await supabase
            .from('jobs')
            .select('id')
            .eq('title', job.title)
            .eq('company_name', job.company)
            .limit(1);

        if (existing && existing.length > 0) {
             console.log(`Duplicate found for ${job.title}`);
             continue;
        }

        // Create Job
        await supabase.from('jobs').insert({
            title: job.title,
            company_name: job.company || "Unknown",
            location: job.location || "Uganda",
            description: job.description,
            application_link: job.application_link,
            source_type: 'WHATSAPP',
            // Defaulting to Published for high confidence
            // In production, you might set this to 'DRAFT' or 'PENDING_APPROVAL'
            status: 'PUBLISHED', 
            source_message_id: logId,
        });
    }

    // Final Log Update
    await supabase.from('ingest_logs').update({
        status: 'published',
        parsed_json: parsedData
    }).eq('id', logId);

  } catch (error) {
    console.error("Gemini processing failed:", error);
    await supabase.from('ingest_logs').update({
        status: 'rejected',
        reason: 'AI Error'
    }).eq('id', logId);
  }
}
