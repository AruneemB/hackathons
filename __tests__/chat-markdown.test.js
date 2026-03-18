/**
 * @jest-environment jsdom
 */

var MOCK_PROJECT = {
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

/**
 * Lightweight marked mock that converts common markdown to HTML,
 * matching the subset of features we care about in chat messages.
 */
var markedMock = {
  parse: jest.fn(function (text) {
    return text
      // Code blocks (before inline rules)
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Unordered lists
      .replace(/(?:^|\n)((?:- .+\n?)+)/g, function (_, items) {
        var lis = items.trim().split('\n').map(function (line) {
          return '<li>' + line.replace(/^- /, '') + '</li>';
        }).join('');
        return '<ul>' + lis + '</ul>';
      })
      // Ordered lists
      .replace(/(?:^|\n)((?:\d+\. .+\n?)+)/g, function (_, items) {
        var lis = items.trim().split('\n').map(function (line) {
          return '<li>' + line.replace(/^\d+\. /, '') + '</li>';
        }).join('');
        return '<ol>' + lis + '</ol>';
      });
  })
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

function flush() {
  return new Promise(function (resolve) { setTimeout(resolve, 200); });
}

function lastBotMessage() {
  var msgs = document.querySelectorAll('.chat-message--bot:not(.chat-message--typing)');
  return msgs[msgs.length - 1];
}

function lastUserMessage() {
  var msgs = document.querySelectorAll('.chat-message--user');
  return msgs[msgs.length - 1];
}

/**
 * Sets the /api/ask fetch response, opens the chat, submits a question,
 * and waits for the async handler to complete.
 */
async function askWithAnswer(question, aiAnswer) {
  // Replace fetch so the next /api/ask call returns aiAnswer
  global.fetch = jest.fn(function (url) {
    if (url === '/api/ask') {
      return Promise.resolve({
        ok: true,
        json: function () { return Promise.resolve({ answer: aiAnswer }); }
      });
    }
    return Promise.resolve({ ok: true, json: function () { return Promise.resolve({}); } });
  });

  var askBtn = document.querySelector('.timeline__link--ask');
  askBtn.click();

  var input = document.getElementById('chat-input');
  var form = document.getElementById('chat-form');
  input.value = question;
  form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

  await flush();
}

describe('Chat markdown rendering', function () {
  // Load the app ONCE so DOMContentLoaded handlers don't accumulate
  beforeAll(async function () {
    buildDOM();

    global.IntersectionObserver = jest.fn(function () {
      return { observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() };
    });

    global.marked = markedMock;

    // Initial fetch mock to serve project data on app boot
    global.fetch = jest.fn(function (url) {
      if (url === 'data/projects.json') {
        return Promise.resolve({
          ok: true,
          json: function () { return Promise.resolve({ projects: [MOCK_PROJECT] }); }
        });
      }
      if (typeof url === 'string' && url.includes('api.github.com')) {
        return Promise.resolve({
          ok: true,
          json: function () {
            return Promise.resolve({
              login: 'testuser', name: 'Test User',
              avatar_url: 'https://example.com/avatar.png',
              html_url: 'https://github.com/testuser'
            });
          }
        });
      }
      return Promise.resolve({ ok: true, json: function () { return Promise.resolve({}); } });
    });

    require('../js/app.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flush();
  });

  beforeEach(function () {
    markedMock.parse.mockClear();
  });

  afterAll(function () {
    delete global.marked;
    delete global.IntersectionObserver;
    delete global.fetch;
  });

  // --- Formatting tests ---

  test('renders **bold** as <strong> in bot messages', async function () {
    await askWithAnswer('Tell me something', 'This is **bold** text');

    var msg = lastBotMessage();
    expect(msg.innerHTML).toContain('<strong>bold</strong>');
    expect(msg.textContent).not.toContain('**');
  });

  test('renders *italic* as <em> in bot messages', async function () {
    await askWithAnswer('Tell me something', 'This is *italic* text');

    var msg = lastBotMessage();
    expect(msg.innerHTML).toContain('<em>italic</em>');
  });

  test('renders inline `code` in bot messages', async function () {
    await askWithAnswer('How to debug?', 'Use `console.log()` for debugging');

    var msg = lastBotMessage();
    expect(msg.innerHTML).toContain('<code>console.log()</code>');
  });

  test('renders unordered lists in bot messages', async function () {
    await askWithAnswer('Features?', 'Features:\n- Fast\n- Reliable\n- Simple');

    var msg = lastBotMessage();
    expect(msg.innerHTML).toContain('<ul>');
    expect(msg.innerHTML).toContain('<li>');
  });

  test('renders ordered lists in bot messages', async function () {
    await askWithAnswer('Steps?', 'Steps:\n1. Install\n2. Configure\n3. Run');

    var msg = lastBotMessage();
    expect(msg.innerHTML).toContain('<ol>');
    expect(msg.innerHTML).toContain('<li>');
  });

  test('renders combined markdown (bold, italic, code) in bot messages', async function () {
    await askWithAnswer('Show formatting', 'Has **bold** and *italic* and `code`');

    var msg = lastBotMessage();
    expect(msg.innerHTML).toContain('<strong>bold</strong>');
    expect(msg.innerHTML).toContain('<em>italic</em>');
    expect(msg.innerHTML).toContain('<code>code</code>');
  });

  // --- Control flow tests ---

  test('user messages are NOT parsed as markdown', async function () {
    await askWithAnswer('What about **this**?', 'Here is the answer.');

    var msg = lastUserMessage();
    expect(msg.innerHTML).toContain('**this**');
    expect(msg.innerHTML).not.toContain('<strong>');
  });

  test('marked.parse is called for bot responses', async function () {
    markedMock.parse.mockClear();
    await askWithAnswer('Test', 'Hello world');

    var calls = markedMock.parse.mock.calls.map(function (c) { return c[0]; });
    expect(calls).toContain('Hello world');
  });

  test('marked.parse is not called with the user question text', async function () {
    markedMock.parse.mockClear();
    await askWithAnswer('My unique question', 'The answer');

    var calls = markedMock.parse.mock.calls.map(function (c) { return c[0]; });
    expect(calls).not.toContain('My unique question');
  });

  test('typing indicator is removed after response arrives', async function () {
    await askWithAnswer('Hello', 'Response text');

    var typingMsgs = document.querySelectorAll('.chat-message--typing');
    expect(typingMsgs.length).toBe(0);
  });

  test('bot messages render as plain text when marked is unavailable', async function () {
    var saved = global.marked;
    delete global.marked;

    await askWithAnswer('Tell me something', 'This is **bold** text');

    var msg = lastBotMessage();
    expect(msg.innerHTML).toContain('**bold**');

    global.marked = saved;
  });
});
