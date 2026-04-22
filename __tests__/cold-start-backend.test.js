const request = require('supertest');

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
  award: '1st Place'
};

describe('/api/warmup', () => {
  let app;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, GEMINI_API_KEY: 'test-key-123' };

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

  test('returns 200 with { ok: true } when API key is present', async () => {
    const res = await request(app).get('/api/warmup');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  test('returns 200 (never errors to client) when API key is missing', async () => {
    delete process.env.GEMINI_API_KEY;
    const res = await request(app).get('/api/warmup');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok');
  });

  test('does not call generateContent (warmup is lightweight)', async () => {
    mockGenerateContent.mockReset();
    await request(app).get('/api/warmup');
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });
});

describe('/api/ask error message on transient failure', () => {
  let app;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, GEMINI_API_KEY: 'test-key-123' };
    mockGenerateContent.mockReset();

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

  test('error message does NOT blame the API key when model throws', async () => {
    mockGenerateContent.mockRejectedValue(new Error('Timeout'));

    const res = await request(app)
      .post('/api/ask')
      .send({ question: 'Hello', project: SAMPLE_PROJECT });

    expect(res.status).toBe(500);
    expect(res.body.answer).not.toMatch(/api key/i);
  });

  test('error message tells user to try again', async () => {
    mockGenerateContent.mockRejectedValue(new Error('Timeout'));

    const res = await request(app)
      .post('/api/ask')
      .send({ question: 'Hello', project: SAMPLE_PROJECT });

    expect(res.body.answer).toMatch(/try again/i);
  });

  test('returns 200 with answer on success', async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => 'Great question!' }
    });

    const res = await request(app)
      .post('/api/ask')
      .send({ question: 'What is this?', project: SAMPLE_PROJECT });

    expect(res.status).toBe(200);
    expect(res.body.answer).toBe('Great question!');
  });
});
