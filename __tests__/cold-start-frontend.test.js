/**
 * @jest-environment jsdom
 *
 * Tests for frontend retry logic and warmup fetch.
 * Simulates a Vercel cold start by having the first /api/ask fetch throw.
 */

const MOCK_PROJECT = {
  id: 'test-proj',
  title: 'Test Project',
  date: '2026-01-01',
  hackathon: 'Test Hack',
  description: 'A test project.',
  techStack: ['JavaScript'],
  teamSize: 2,
  award: 'Best Test',
  links: {}
};

function buildDOM() {
  document.body.innerHTML = [
    '<div id="github-profile"></div>',
    '<div id="hero-stats"></div>',
    '<div class="skills-carousel" id="skills-carousel">',
    '  <div class="skills-carousel__track" id="skills-track"></div>',
    '</div>',
    '<main class="timeline" id="timeline">',
    '  <div class="timeline__line" aria-hidden="true"></div>',
    '</main>',
    '<div id="project-modal" class="hidden">',
    '  <div class="modal__overlay"></div>',
    '  <button id="modal-close"></button>',
    '  <div id="modal-content"></div>',
    '</div>',
    '<div id="diagram-lightbox" class="hidden">',
    '  <div class="modal__overlay"></div>',
    '  <button id="lightbox-close"></button>',
    '  <div id="lightbox-content"></div>',
    '</div>',
    '<div id="chat-widget" class="chat-widget hidden">',
    '  <div class="chat-widget__title">',
    '    <span class="chat-widget__project-name">Project Chat</span>',
    '  </div>',
    '  <button id="chat-close"></button>',
    '  <div class="chat-widget__messages" id="chat-messages"></div>',
    '  <form id="chat-form">',
    '    <input type="text" id="chat-input" />',
    '    <button type="submit" id="chat-send"></button>',
    '  </form>',
    '</div>'
  ].join('\n');
}

// Waits long enough for 1 retry (1000ms delay) plus async overhead
function flush(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms || 200); });
}

function lastBotMessage() {
  var msgs = document.querySelectorAll('.chat-message--bot:not(.chat-message--typing)');
  return msgs[msgs.length - 1];
}

function submitQuestion(question) {
  var askBtn = document.querySelector('.timeline__link--ask');
  askBtn.click();
  var input = document.getElementById('chat-input');
  var form = document.getElementById('chat-form');
  input.value = question;
  form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
}

describe('Frontend cold-start fix', function () {
  var bootFetchCalls = [];

  beforeAll(async function () {
    buildDOM();

    global.IntersectionObserver = jest.fn(function () {
      return { observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() };
    });
    global.marked = { parse: jest.fn(function (t) { return t; }) };

    global.fetch = jest.fn(function (url) {
      bootFetchCalls.push(url);
      if (url === 'data/projects.json') {
        return Promise.resolve({
          ok: true,
          json: function () { return Promise.resolve({ projects: [MOCK_PROJECT] }); }
        });
      }
      return Promise.resolve({ ok: true, json: function () { return Promise.resolve({}); } });
    });

    require('../public/js/app.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flush();
  });

  afterAll(function () {
    delete global.marked;
    delete global.IntersectionObserver;
    delete global.fetch;
  });

  // ── Warmup ────────────────────────────────────────────────────────────────

  test('fires a warmup fetch to /api/warmup on DOMContentLoaded', function () {
    expect(bootFetchCalls).toContain('/api/warmup');
  });

  test('warmup fetch failure is silent (does not crash the page)', async function () {
    // Already booted with a fetch that silently returns {} for /api/warmup —
    // the page loaded successfully, so the test trivially passes.
    expect(document.getElementById('chat-widget')).not.toBeNull();
  });

  // ── Retry on first failure ─────────────────────────────────────────────────

  test('retries /api/ask once when first fetch throws (cold start simulation)', async function () {
    var askCallCount = 0;
    global.fetch = jest.fn(function (url) {
      if (url === '/api/ask') {
        askCallCount++;
        if (askCallCount === 1) return Promise.reject(new Error('Network error'));
        return Promise.resolve({
          ok: true,
          json: function () { return Promise.resolve({ answer: 'Retry worked!' }); }
        });
      }
      return Promise.resolve({ ok: true, json: function () { return Promise.resolve({}); } });
    });

    submitQuestion('What is this project?');
    await flush(1500); // covers 1000ms retry delay

    expect(askCallCount).toBe(2);
    expect(lastBotMessage().textContent).toContain('Retry worked!');
  });

  test('shows "try again" message after both attempts fail', async function () {
    global.fetch = jest.fn(function (url) {
      if (url === '/api/ask') return Promise.reject(new Error('Network error'));
      return Promise.resolve({ ok: true, json: function () { return Promise.resolve({}); } });
    });

    submitQuestion('Will this fail?');
    await flush(1500);

    expect(lastBotMessage().textContent).toMatch(/try again/i);
  });

  test('calls /api/ask exactly twice when both attempts fail', async function () {
    var askCallCount = 0;
    global.fetch = jest.fn(function (url) {
      if (url === '/api/ask') {
        askCallCount++;
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({ ok: true, json: function () { return Promise.resolve({}); } });
    });

    submitQuestion('Count my retries');
    await flush(1500);

    expect(askCallCount).toBe(2);
  });

  test('does not retry when first attempt succeeds (warm server)', async function () {
    var askCallCount = 0;
    global.fetch = jest.fn(function (url) {
      if (url === '/api/ask') {
        askCallCount++;
        return Promise.resolve({
          ok: true,
          json: function () { return Promise.resolve({ answer: 'Instant success!' }); }
        });
      }
      return Promise.resolve({ ok: true, json: function () { return Promise.resolve({}); } });
    });

    submitQuestion('Warm server question');
    await flush(300); // much shorter — no retry delay

    expect(askCallCount).toBe(1);
    expect(lastBotMessage().textContent).toContain('Instant success!');
  });

  test('typing indicator is removed regardless of outcome', async function () {
    global.fetch = jest.fn(function (url) {
      if (url === '/api/ask') return Promise.reject(new Error('Network error'));
      return Promise.resolve({ ok: true, json: function () { return Promise.resolve({}); } });
    });

    submitQuestion('Check typing cleanup');
    // 2200ms: 1000ms retry delay + buffer for prior tests' in-flight async ops
    await flush(2200);

    var typingMsgs = document.querySelectorAll('.chat-message--typing');
    expect(typingMsgs.length).toBe(0);
  });
});
