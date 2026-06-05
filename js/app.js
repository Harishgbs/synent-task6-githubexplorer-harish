(function () {
  'use strict';

  // ============================================================
  // API Service
  // ============================================================
  const API = {
    BASE: 'https://api.github.com',

    async fetchUser(username) {
      const res = await fetch(`${this.BASE}/users/${encodeURIComponent(username)}`);
      if (res.status === 404) throw new Error('NOT_FOUND');
      if (!res.ok) throw new Error('API_ERROR');
      return res.json();
    },

    async fetchRepos(username) {
      const res = await fetch(
        `${this.BASE}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=10`
      );
      if (!res.ok) throw new Error('API_ERROR');
      return res.json();
    }
  };

  // ============================================================
  // State
  // ============================================================
  let currentUsername = '';

  // ============================================================
  // DOM References
  // ============================================================
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const searchForm = $('#search-form');
  const searchInput = $('#search-input');
  const historyContainer = $('#search-history');
  const results = $('#results');
  const emptyState = $('#empty-state');
  const errorState = $('#error-state');
  const errorTitle = $('#error-title');
  const errorDesc = $('#error-desc');
  const skeleton = $('#skeleton');
  const profile = $('#profile');
  const profileAvatar = $('#profile-avatar');
  const profileName = $('#profile-name');
  const profileUsername = $('#profile-username');
  const profileBio = $('#profile-bio');
  const profileMeta = $('#profile-meta');
  const btnProfile = $('#btn-profile');
  const btnCopy = $('#btn-copy');
  const statRepos = $('#stat-repos');
  const statFollowers = $('#stat-followers');
  const statFollowing = $('#stat-following');
  const statJoined = $('#stat-joined');
  const reposList = $('#repos-list');
  const reposCount = $('#repos-count');
  const themeToggle = $('#theme-toggle');
  const toast = $('#toast');

  // ============================================================
  // Toast
  // ============================================================
  let toastTimer = null;

  function showToast(msg) {
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 2200);
  }

  // ============================================================
  // Theme
  // ============================================================
  const THEME_KEY = 'ghexplorer_theme';

  function getSavedTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch { return null; }
  }

  function saveTheme(theme) {
    try { localStorage.setItem(THEME_KEY, theme); } catch { }
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    saveTheme(theme);
  }

  const savedTheme = getSavedTheme();
  setTheme(savedTheme === 'light' ? 'light' : 'dark');

  themeToggle.addEventListener('click', function () {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'light' ? 'dark' : 'light');
  });

  // ============================================================
  // Search History
  // ============================================================
  const HISTORY_KEY = 'ghexplorer_history';
  const MAX_HISTORY = 8;

  function getHistory() {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  }

  function saveHistoryItem(username) {
    let history = getHistory();
    history = history.filter(h => h.toLowerCase() !== username.toLowerCase());
    history.unshift(username);
    if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch { }
  }

  function removeHistoryItem(username) {
    let history = getHistory();
    history = history.filter(h => h.toLowerCase() !== username.toLowerCase());
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch { }
    renderHistory();
  }

  function clearHistory() {
    try { localStorage.removeItem(HISTORY_KEY); } catch { }
    renderHistory();
  }

  function renderHistory() {
    const history = getHistory();
    if (history.length === 0) {
      historyContainer.innerHTML = '';
      return;
    }

    historyContainer.innerHTML = history.map(h => `
      <span class="history-tag" data-username="${h}">
        ${h}
        <span class="history-tag__remove" data-remove="${h}" role="button" tabindex="0" aria-label="Remove ${h}">&times;</span>
      </span>
    `).join('') + `
      <span class="history-tag history-tag--clear" id="clear-history" role="button" tabindex="0" aria-label="Clear all search history">Clear</span>
    `;
  }

  // ============================================================
  // UI State Management
  // ============================================================
  function showOnly(el) {
    [emptyState, errorState, skeleton, profile].forEach(e => e.hidden = true);
    if (el) el.hidden = false;
  }

  function showError(title, desc) {
    errorTitle.textContent = title;
    errorDesc.textContent = desc;
    showOnly(errorState);
  }

  function showSkeleton() {
    showOnly(skeleton);
  }

  // ============================================================
  // Render Profile
  // ============================================================
  function renderProfile(user) {
    profileAvatar.src = user.avatar_url;
    profileAvatar.alt = `${user.login}'s avatar`;
    profileName.textContent = user.name || user.login;
    profileUsername.textContent = `@${user.login}`;
    profileUsername.href = user.html_url;
    profileBio.textContent = user.bio || 'No bio available.';

    // Meta
    profileMeta.innerHTML = '';
    const metaItems = [
      { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>', text: user.location || 'No location' },
      { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>', text: user.company || 'No company' },
      { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>', text: user.blog || 'No website' }
    ];

    metaItems.forEach(item => {
      const div = document.createElement('div');
      div.className = 'profile__meta-item';
      div.innerHTML = item.icon + `<span>${escapeHtml(item.text)}</span>`;
      profileMeta.appendChild(div);
    });

    // Stats
    statRepos.textContent = user.public_repos;
    statFollowers.textContent = user.followers;
    statFollowing.textContent = user.following;
    statJoined.textContent = formatDateJoined(user.created_at);

    // Profile button
    btnProfile.href = user.html_url;

    // Show
    showOnly(profile);
  }

  // ============================================================
  // Render Repos
  // ============================================================
  function renderRepos(repos) {
    if (repos.length === 0) {
      reposList.innerHTML = '<p style="text-align:center;color:var(--color-text-muted);padding:24px 0;">No repositories found.</p>';
      reposCount.textContent = '0';
      return;
    }

    reposCount.textContent = repos.length;

    reposList.innerHTML = repos.map(repo => `
      <a class="repo-item" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
        <div class="repo-item__info">
          <div class="repo-item__name">${escapeHtml(repo.name)}</div>
          ${repo.description ? `<div class="repo-item__desc">${escapeHtml(repo.description)}</div>` : ''}
        </div>
        <div class="repo-item__tags">
          ${repo.language ? `
            <span class="repo-item__lang">
              <span class="repo-item__lang-dot" style="background:${getLangColor(repo.language)}"></span>
              ${repo.language}
            </span>
          ` : ''}
          <span class="repo-item__tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ${repo.stargazers_count}
          </span>
        </div>
      </a>
    `).join('');
  }

  // ============================================================
  // Helpers
  // ============================================================
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDateJoined(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  function getLangColor(lang) {
    const colors = {
      JavaScript: '#f1e05a',
      TypeScript: '#3178c6',
      Python: '#3572A5',
      Java: '#b07219',
      Go: '#00ADD8',
      Rust: '#dea584',
      Ruby: '#701516',
      'C++': '#f34b7d',
      C: '#555555',
      'C#': '#178600',
      PHP: '#4F5D95',
      Swift: '#ffac45',
      Kotlin: '#A97BFF',
      Dart: '#00B4AB',
      Shell: '#89e051',
      HTML: '#e34c26',
      CSS: '#563d7c',
      Vue: '#41b883',
      Scala: '#c22d40',
      Dart: '#00B4AB',
      Lua: '#000080',
      Perl: '#0298c3',
      Haskell: '#5e5086',
      Julia: '#a270ba',
      Elixir: '#6e4a7e',
      Clojure: '#db5855',
      Erlang: '#B83998'
    };
    return colors[lang] || '#8888a0';
  }

  // ============================================================
  // Main Search
  // ============================================================
  async function searchUser(username) {
    const trimmed = username.trim();
    if (!trimmed) return;

    currentUsername = trimmed;
    showSkeleton();

    try {
      const [user, repos] = await Promise.all([
        API.fetchUser(trimmed),
        API.fetchRepos(trimmed)
      ]);

      renderProfile(user);
      renderRepos(repos);
      saveHistoryItem(trimmed);
      renderHistory();

    } catch (err) {
      if (err.message === 'NOT_FOUND') {
        showError('User not found', `No GitHub account matches "${trimmed}". Please check the username and try again.`);
      } else if (err.message === 'API_ERROR') {
        showError('API error', 'GitHub API returned an error. Please try again later.');
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        showError('Network error', 'Unable to connect to GitHub. Check your internet connection and try again.');
      } else {
        showError('Something went wrong', 'An unexpected error occurred. Please try again.');
      }
    }
  }

  // ============================================================
  // Event Listeners
  // ============================================================
  // Search form
  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    searchUser(searchInput.value);
  });

  // History delegation
  historyContainer.addEventListener('click', function (e) {
    const tag = e.target.closest('.history-tag');
    if (!tag) return;

    if (tag.id === 'clear-history') {
      clearHistory();
      return;
    }

    const removeBtn = e.target.closest('.history-tag__remove');
    if (removeBtn) {
      const username = removeBtn.dataset.remove;
      if (username) {
        e.stopPropagation();
        removeHistoryItem(username);
      }
      return;
    }

    const username = tag.dataset.username;
    if (username) {
      searchInput.value = username;
      searchUser(username);
    }
  });

  // Allow keyboard activation on history remove buttons
  historyContainer.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      const target = e.target.closest('[data-remove], #clear-history');
      if (target) {
        e.preventDefault();
        target.click();
      }
    }
  });

  // Copy profile link
  btnCopy.addEventListener('click', async function () {
    if (!currentUsername) return;
    const url = `https://github.com/${currentUsername}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Profile link copied to clipboard');
    } catch {
      showToast('Failed to copy link');
    }
  });

  // ============================================================
  // Init
  // ============================================================
  renderHistory();

})();
