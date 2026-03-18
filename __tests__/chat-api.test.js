const request = require('supertest');

// Mock the Google Generative AI module before requiring the app
const mockGenerateContent = jest.fn();
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: mockGenerateContent
    })
  }))
}));

const SAMPLE_PROJECT = {
  id: 'knkt',
  title: 'knkt',
  date: '2026-03-01',
  hackathon: 'RaikesHacks 2026',
  description: 'A Bluetooth-powered mobile networking app.',
  techStack: ['Flutter', 'Dart', 'Python'],
  teamSize: 3,
  award: '1st Place in FindU Track'
};

describe('/api/ask endpoint', () => {
  let app;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, GEMINI_API_KEY: 'test-key-123' };
    mockGenerateContent.mockReset();

    // Re-mock after resetModules
    jest.mock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: mockGenerateContent
        })
      }))
    }));

    app = require('../dev-server');
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('returns AI-generated answer for a valid question', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'knkt is a Bluetooth networking app built at RaikesHacks 2026.'
      }
    });

    const res = await request(app)
      .post('/api/ask')
      .send({ question: 'What is this project?', project: SAMPLE_PROJECT });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('answer');
    expect(res.body.answer).toBe('knkt is a Bluetooth networking app built at RaikesHacks 2026.');
  });

  test('returns 500 when GEMINI_API_KEY is missing', async () => {
    // Delete the key after module load — the route handler checks at request time
    delete process.env.GEMINI_API_KEY;

    const res = await request(app)
      .post('/api/ask')
      .send({ question: 'Hello?', project: SAMPLE_PROJECT });

    expect(res.status).toBe(500);
    expect(res.body.answer).toMatch(/GEMINI_API_KEY/i);
  });

  test('returns 500 when the AI model throws an error', async () => {
    mockGenerateContent.mockRejectedValue(new Error('Model unavailable'));

    const res = await request(app)
      .post('/api/ask')
      .send({ question: 'Tell me about the tech stack', project: SAMPLE_PROJECT });

    expect(res.status).toBe(500);
    expect(res.body.answer).toMatch(/snag|error/i);
  });

  test('handles project with no award or hackathon gracefully', async () => {
    const projectNoAward = {
      ...SAMPLE_PROJECT,
      award: null,
      hackathon: null
    };

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'This project was built independently.'
      }
    });

    const res = await request(app)
      .post('/api/ask')
      .send({ question: 'Did this win anything?', project: projectNoAward });

    expect(res.status).toBe(200);
    expect(res.body.answer).toBe('This project was built independently.');
  });

  test('passes project context in the prompt to the AI model', async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => 'Response' }
    });

    await request(app)
      .post('/api/ask')
      .send({ question: 'What tech was used?', project: SAMPLE_PROJECT });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const promptArg = mockGenerateContent.mock.calls[0][0];
    expect(promptArg).toContain('knkt');
    expect(promptArg).toContain('Flutter');
    expect(promptArg).toContain('What tech was used?');
  });

  test('serves the root route with HTML', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });
});
