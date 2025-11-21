export const PRIMARY_EXTRACTION_PROMPT = `
You are a JSON extractor. Input is a raw WhatsApp message text containing one or more job listings. 
Output a JSON array "jobs" where each job contains: 
- title (string, required)
- company (string, best effort)
- location (string, optional)
- salary (string, optional)
- job_type (one of: full-time, part-time, contract, internship, freelance, unknown)
- application_link (valid URL if present)
- contact (phone or email if present)
- deadline (date in ISO YYYY-MM-DD if present)
- description (short summary, 100-300 chars)
- confidence (0.0-1.0 float for how confident you are)

Only output valid JSON. If you cannot find jobs, output {"jobs": []}.
`;

export const FALLBACK_PROMPT = `
Analyze the following text. Does it contain a job opportunity? 
If yes, extract the Job Title and Application Method (Link or Phone).
Return JSON: {"is_job": boolean, "title": string, "method": string}
`;
