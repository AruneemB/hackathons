(function () {
  'use strict';

  var DATA_URL = 'data/projects.json';
  var INTERSECTION_THRESHOLD = 0.15;
  var STAGGER_DELAY_MS = 80;

  var LINK_TYPES = {
    demo: {
      label: 'Demo',
      icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>'
    },
    repo: {
      label: 'GitHub',
      icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>'
    },
    devpost: {
      label: 'Devpost',
      icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M9 8h4a3 3 0 010 6H9V8z"/></svg>'
    },
    video: {
      label: 'Video',
      icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
    }
  };

  var allProjects = [];

  async function loadProjects() {
    try {
      var res = await fetch(DATA_URL);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var data = await res.json();
      allProjects = data.projects.sort(
        function (a, b) { return new Date(b.date) - new Date(a.date); }
      );
      renderStats(allProjects);
      renderSkillsCarousel(allProjects);
      renderTimeline(allProjects);
    } catch (err) {
      document.getElementById('timeline').innerHTML =
        '<p class="timeline__empty">Failed to load projects. ' + err.message + '</p>';
    }
  }

  function renderStats(projects) {
    var awards = projects.filter(function (p) { return p.award; }).length;
    var techSet = {};
    projects.forEach(function (p) {
      p.techStack.forEach(function (t) { techSet[t] = true; });
    });
    var techs = Object.keys(techSet).length;

    document.getElementById('hero-stats').innerHTML =
      '<div class="stat"><span class="stat__number">' + projects.length + '</span><span class="stat__label">Projects</span></div>' +
      '<div class="stat"><span class="stat__number">' + awards + '</span><span class="stat__label">Awards</span></div>' +
      '<div class="stat"><span class="stat__number">' + techs + '</span><span class="stat__label">Technologies</span></div>';
  }

  function renderSkillsCarousel(projects) {
    var techSet = {};
    projects.forEach(function (p) {
      p.techStack.forEach(function (t) { techSet[t] = true; });
    });
    var skills = Object.keys(techSet).sort();

    var track = document.getElementById('skills-track');
    var items = skills.concat(skills);
    track.innerHTML = items.map(function (skill) {
      return '<span class="skills-carousel__item">' + escapeHTML(skill) + '</span>';
    }).join('');
  }

  function renderTimeline(projects) {
    var container = document.getElementById('timeline');
    var line = container.querySelector('.timeline__line');
    container.innerHTML = '';
    container.appendChild(line);

    if (projects.length === 0) {
      container.insertAdjacentHTML('beforeend',
        '<p class="timeline__empty">No projects to show.</p>');
      return;
    }

    var currentYear = null;
    var entryIndex = 0;

    projects.forEach(function (project) {
      var projectYear = new Date(project.date + 'T00:00:00').getFullYear();

      // Insert year divider when year changes
      if (projectYear !== currentYear) {
        currentYear = projectYear;
        var yearDiv = document.createElement('div');
        yearDiv.className = 'timeline__year';
        yearDiv.innerHTML = '<span class="timeline__year-label">' + currentYear + '</span>';
        container.appendChild(yearDiv);
      }

      var side = entryIndex % 2 === 0 ? 'left' : 'right';
      var article = document.createElement('article');
      article.className = 'timeline__entry timeline__entry--' + side;
      article.id = project.id;
      article.style.setProperty('--delay', (entryIndex * STAGGER_DELAY_MS) + 'ms');

      var dateObj = new Date(project.date + 'T00:00:00');
      var formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      var linksHTML = '';
      if (project.links) {
        linksHTML = Object.entries(project.links)
          .map(function (entry) {
            var type = entry[0];
            var url = entry[1];
            var meta = LINK_TYPES[type] || { label: type, icon: '' };
            return '<a href="' + escapeAttr(url) + '" class="timeline__link" target="_blank" rel="noopener noreferrer">' +
              meta.icon + ' ' + escapeHTML(meta.label) +
              '</a>';
          })
          .join('');
      }

      // Add "Ask" button
      linksHTML += '<button class="timeline__link timeline__link--ask" data-id="' + project.id + '">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg> ' +
        'Ask Question' +
        '</button>';

      var awardHTML = '';
      if (project.award) {
        awardHTML = '<span class="timeline__award">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<circle cx="12" cy="8" r="6"/>' +
          '<path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>' +
          '</svg> ' +
          escapeHTML(project.award) +
          '</span>';
      }

      var thumbHTML = '';
      if (project.thumbnail) {
        thumbHTML = '<img class="timeline__thumb" src="' + escapeAttr(project.thumbnail) + '" alt="' + escapeAttr(project.title) + ' screenshot" loading="lazy" onerror="this.style.display=\'none\'">';
      }

      var hackathonHTML = project.hackathon
        ? '<div class="timeline__hackathon">' + escapeHTML(project.hackathon) + '</div>'
        : '';

      var logoHTML = '<div class="timeline__logo">';
      if (project.logo) {
        logoHTML += '<img src="' + escapeAttr(project.logo) + '" alt="' + escapeAttr(project.hackathon || project.title) + ' logo" loading="lazy">';
      }
      logoHTML += '</div>';

      var tagsHTML = project.techStack.map(function (t) {
        return '<span class="tag">' + escapeHTML(t) + '</span>';
      }).join('');

      article.innerHTML =
        '<div class="timeline__dot" aria-hidden="true"></div>' +
        logoHTML +
        '<div class="timeline__card">' +
          thumbHTML +
          '<div class="timeline__body">' +
            '<div class="timeline__header">' +
              '<div class="timeline__dateline"><time datetime="' + project.date + '">' + formattedDate + '</time></div>' +
              '<h2 class="timeline__title">' + escapeHTML(project.title) + '</h2>' +
              hackathonHTML +
            '</div>' +
            '<p class="timeline__desc">' + escapeHTML(project.description) + '</p>' +
            '<div class="timeline__tags">' + tagsHTML + '</div>' +
            '<div class="timeline__meta">' +
              '<span class="timeline__team">' +
                '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>' +
                '<circle cx="9" cy="7" r="4"/>' +
                '<path d="M23 21v-2a4 4 0 00-3-3.87"/>' +
                '<path d="M16 3.13a4 4 0 010 7.75"/>' +
                '</svg> ' +
                'Team of ' + project.teamSize +
              '</span>' +
              awardHTML +
            '</div>' +
            '<div class="timeline__links">' + linksHTML + '</div>' +
          '</div>' +
        '</div>';

      container.appendChild(article);
      entryIndex++;
    });

    observeEntries();
  }

  function observeEntries() {
    var entries = document.querySelectorAll('.timeline__entry');

    if (!('IntersectionObserver' in window)) {
      entries.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (observed) {
        observed.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: INTERSECTION_THRESHOLD, rootMargin: '0px 0px -50px 0px' }
    );

    entries.forEach(function (el) { observer.observe(el); });
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  async function loadGitHubProfile() {
    try {
      var res = await fetch('https://api.github.com/users/AruneemB');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var user = await res.json();
      var container = document.getElementById('github-profile');
      container.innerHTML =
        '<a class="github-card" href="' + escapeAttr(user.html_url) + '" target="_blank" rel="noopener noreferrer">' +
          '<img class="github-card__avatar" src="' + escapeAttr(user.avatar_url) + '" alt="' + escapeAttr(user.name || user.login) + '" width="40" height="40">' +
          '<div class="github-card__info">' +
            '<span class="github-card__name">' + escapeHTML(user.name || user.login) + '</span>' +
            '<span class="github-card__username">@' + escapeHTML(user.login) + '</span>' +
          '</div>' +
        '</a>';
    } catch (_) {
      // hide card silently on error
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadProjects();
    loadGitHubProfile();
    initChat();
  });

  // --- Chat Logic ---
  var currentProjectId = null;

  function initChat() {
    var widget = document.getElementById('chat-widget');
    var closeBtn = document.getElementById('chat-close');
    var form = document.getElementById('chat-form');
    var input = document.getElementById('chat-input');
    var container = document.getElementById('timeline');

    // Delegate click events for "Ask" buttons
    container.addEventListener('click', function (e) {
      var btn = e.target.closest('.timeline__link--ask');
      if (btn) {
        openChat(btn.getAttribute('data-id'));
      }
    });

    closeBtn.addEventListener('click', function () {
      widget.classList.add('hidden');
    });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var msg = input.value.trim();
      if (!msg) return;

      addMessage(msg, 'user');
      input.value = '';
      
      // Show typing indicator
      var typingId = addMessage('...', 'bot', true);
      
      try {
        var project = allProjects.find(function(p) { return p.id === currentProjectId; });
        var response = await fetch('http://localhost:3000/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: msg,
            project: project
          })
        });

        var data = await response.json();
        removeMessage(typingId);
        addMessage(data.answer || 'Sorry, I encountered an error.', 'bot');
      } catch (err) {
        removeMessage(typingId);
        addMessage('Could not connect to the chat server. Make sure dev-server.js is running!', 'bot');
      }
    });
  }

  function openChat(projectId) {
    currentProjectId = projectId;
    var project = allProjects.find(function(p) { return p.id === projectId; });
    var widget = document.getElementById('chat-widget');
    var projectNameLabel = widget.querySelector('.chat-widget__project-name');
    var messagesContainer = document.getElementById('chat-messages');

    projectNameLabel.textContent = 'Ask about ' + project.title;
    widget.classList.remove('hidden');
    
    // Reset messages
    messagesContainer.innerHTML = '<div class="chat-message chat-message--bot">' +
      'Hi! I\'m ready to answer questions about <strong>' + escapeHTML(project.title) + '</strong>. What would you like to know?' +
      '</div>';
    
    document.getElementById('chat-input').focus();
  }

  function addMessage(text, sender, isTyping) {
    var messagesContainer = document.getElementById('chat-messages');
    var div = document.createElement('div');
    var id = 'msg-' + Date.now();
    div.id = id;
    div.className = 'chat-message chat-message--' + sender;
    if (isTyping) div.classList.add('chat-message--typing');
    div.innerHTML = text; // We trust our own/AI output or escape it in dev-server
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return id;
  }

  function removeMessage(id) {
    var msg = document.getElementById(id);
    if (msg) msg.remove();
  }
})();
