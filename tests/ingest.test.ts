import { processIngestJob } from '../backend/src/workers/ingest.worker';

// Fix: Declare Jest globals explicitly to resolve "Cannot find name" errors 
// since the test environment types might not be loaded globally.
declare var jest: any;
declare var describe: any;
declare var it: any;
declare var expect: any;

// Mock the database and Gemini API calls
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({
        text: JSON.stringify({
          jobs: [{ title: "Mock Job", confidence: 0.9 }]
        })
      })
    }
  })),
  Type: { OBJECT: 'OBJECT', ARRAY: 'ARRAY', STRING: 'STRING', NUMBER: 'NUMBER' }
}));

describe('Ingestion Worker', () => {
  it('should parse a job and call create', async () => {
    // Fix: Mock console.log to capture output
    console.log = jest.fn();
    
    // Fix: Set API_KEY to prevent early exit in worker
    process.env.API_KEY = 'test-key';
    
    // Simulate processing
    await processIngestJob({ id: 'test-log-id' });
    
    // Verify that the job was created via the console log in the mock db
    expect(console.log).toHaveBeenCalledWith('Job Created:', expect.objectContaining({
        title: 'Mock Job',
        status: 'PUBLISHED'
    }));
  });
});