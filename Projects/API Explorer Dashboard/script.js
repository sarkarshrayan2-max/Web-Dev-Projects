/**
 * API Explorer Dashboard - Main Script
 */

// --- 1. State & Configurations ---

const PREDEFINED_APIS = [
  {
    id: 'placeholder-users',
    name: 'JSONPlaceholder Users',
    url: 'https://jsonplaceholder.typicode.com/users',
    category: 'Mock Data',
    description: 'Fetches a list of 10 mock users. Great for prototyping.',
    auth: 'None',
    cors: 'Yes'
  },
  {
    id: 'placeholder-posts',
    name: 'JSONPlaceholder Posts',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    category: 'Mock Data',
    description: 'Fetches a single mock post.',
    auth: 'None',
    cors: 'Yes'
  },
  {
    id: 'random-user',
    name: 'Random User Generator',
    url: 'https://randomuser.me/api/',
    category: 'Utility',
    description: 'Generates a random user profile including name, address, email, and picture.',
    auth: 'None',
    cors: 'Yes'
  },
  {
    id: 'joke-api',
    name: 'Official Joke API',
    url: 'https://official-joke-api.appspot.com/random_joke',
    category: 'Entertainment',
    description: 'Fetches a random programming or general joke.',
    auth: 'None',
    cors: 'Yes'
  },
  {
    id: 'dog-api',
    name: 'Dog CEO API',
    url: 'https://dog.ceo/api/breeds/image/random',
    category: 'Entertainment',
    description: 'Fetches a random image URL of a dog.',
    auth: 'None',
    cors: 'Yes'
  },
  {
    id: 'cat-fact',
    name: 'Cat Facts',
    url: 'https://catfact.ninja/fact',
    category: 'Entertainment',
    description: 'Returns a random, interesting fact about cats.',
    auth: 'None',
    cors: 'Yes'
  },
  {
    id: 'nationalize',
    name: 'Nationalize.io',
    url: 'https://api.nationalize.io?name=michael',
    category: 'Utility',
    description: 'Predicts the nationality of a person based on their name.',
    auth: 'None',
    cors: 'Yes'
  }
];

let appState = {
  theme: localStorage.getItem('api-explorer-theme') || 'dark',
  history: JSON.parse(localStorage.getItem('api-explorer-history')) || [],
  lastResponseData: null,
  activeApiId: null
};

// --- 2. DOM Elements ---

const elements = {
  body: document.documentElement,
  themeToggle: document.getElementById('themeToggle'),
  mobileMenuBtn: document.getElementById('mobileMenuBtn'),
  mobileMenuClose: document.getElementById('mobileMenuClose'),
  sidebar: document.getElementById('sidebar'),
  apiList: document.getElementById('apiList'),
  historyList: document.getElementById('historyList'),
  apiSearch: document.getElementById('apiSearch'),
  
  // Form
  apiForm: document.getElementById('apiForm'),
  apiUrlInput: document.getElementById('apiUrlInput'),
  methodSelect: document.getElementById('methodSelect'),
  
  // Params
  toggleParamsBtn: document.getElementById('toggleParamsBtn'),
  paramsContainer: document.getElementById('paramsContainer'),
  addParamBtn: document.getElementById('addParamBtn'),
  
  // Info Panel
  infoTitle: document.getElementById('infoTitle'),
  infoDescription: document.getElementById('infoDescription'),
  apiCategoryBadge: document.getElementById('apiCategoryBadge'),
  infoAuth: document.getElementById('infoAuth'),
  infoCors: document.getElementById('infoCors'),
  infoLink: document.getElementById('infoLink'),
  
  // Response UI
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabContents: document.querySelectorAll('.tab-content'),
  statusBadge: document.getElementById('statusBadge'),
  timeBadge: document.getElementById('timeBadge'),
  timeText: document.getElementById('timeText'),
  copyBtn: document.getElementById('copyBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  toast: document.getElementById('toast'),
  
  // States
  emptyState: document.getElementById('emptyState'),
  loadingState: document.getElementById('loadingState'),
  dataState: document.getElementById('dataState'),
  errorState: document.getElementById('errorState'),
  errorMessage: document.getElementById('errorMessage'),
  
  // Outputs
  jsonOutput: document.getElementById('jsonOutput'),
  headersOutput: document.getElementById('headersOutput'),
};


// --- 3. Initialization ---

function init() {
  applyTheme(appState.theme);
  renderApiList();
  renderHistory();
  setupEventListeners();
}

function setupEventListeners() {
  // Theme Toggle
  elements.themeToggle.addEventListener('click', () => {
    appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
    applyTheme(appState.theme);
    localStorage.setItem('api-explorer-theme', appState.theme);
  });

  // Mobile Menu
  elements.mobileMenuBtn.addEventListener('click', () => elements.sidebar.classList.add('open'));
  elements.mobileMenuClose.addEventListener('click', () => elements.sidebar.classList.remove('open'));

  // Search APIs
  elements.apiSearch.addEventListener('input', (e) => {
    renderApiList(e.target.value.toLowerCase());
  });

  // Query Params Toggle
  elements.toggleParamsBtn.addEventListener('click', () => {
    elements.paramsContainer.classList.toggle('open');
    const icon = elements.toggleParamsBtn.querySelector('i');
    if (elements.paramsContainer.classList.contains('open')) {
      icon.classList.replace('ph-caret-down', 'ph-caret-up');
    } else {
      icon.classList.replace('ph-caret-up', 'ph-caret-down');
    }
  });

  // Add Param Row
  elements.addParamBtn.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'param-row';
    row.innerHTML = `
      <input type="text" class="param-key" placeholder="Key">
      <input type="text" class="param-value" placeholder="Value">
      <button type="button" class="icon-btn remove-param text-danger"><i class="ph ph-trash"></i></button>
    `;
    elements.paramsContainer.insertBefore(row, elements.addParamBtn);
    
    // Setup remove event for new button
    row.querySelector('.remove-param').addEventListener('click', () => {
      row.remove();
      updateUrlFromParams();
    });

    // Setup auto-update URL
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('input', updateUrlFromParams);
    });
  });

  // Setup initial remove buttons
  document.querySelectorAll('.remove-param').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.currentTarget.closest('.param-row').remove();
      updateUrlFromParams();
    });
  });
  
  // Bind input events to existing params to update URL
  document.querySelectorAll('.param-key, .param-value').forEach(input => {
    input.addEventListener('input', updateUrlFromParams);
  });

  // When URL is manually typed, try to parse it and populate params
  elements.apiUrlInput.addEventListener('input', (e) => {
    parseUrlToParams(e.target.value);
    
    // Clear active selection if user types a custom URL
    document.querySelectorAll('.api-item').forEach(el => el.classList.remove('active'));
    setInfoPanelCustom();
  });

  // Form Submit
  elements.apiForm.addEventListener('submit', (e) => {
    e.preventDefault();
    executeRequest();
  });

  // Tabs
  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      elements.tabBtns.forEach(b => b.classList.remove('active'));
      elements.tabContents.forEach(c => c.classList.remove('active'));
      
      e.target.classList.add('active');
      document.getElementById(`tab-${e.target.dataset.tab}`).classList.add('active');
    });
  });

  // Utilities
  elements.copyBtn.addEventListener('click', () => {
    if (appState.lastResponseData) {
      navigator.clipboard.writeText(JSON.stringify(appState.lastResponseData, null, 2))
        .then(() => showToast('Copied to clipboard!'))
        .catch(() => showToast('Failed to copy.'));
    }
  });

  elements.downloadBtn.addEventListener('click', () => {
    if (appState.lastResponseData) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState.lastResponseData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "api-response.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      showToast('Download started');
    }
  });
}

// --- 4. Render UI ---

function applyTheme(theme) {
  elements.body.setAttribute('data-theme', theme);
  const icon = elements.themeToggle.querySelector('i');
  const text = elements.themeToggle.querySelector('span');
  
  if (theme === 'dark') {
    icon.className = 'ph ph-sun';
    text.textContent = 'Light Mode';
  } else {
    icon.className = 'ph ph-moon';
    text.textContent = 'Dark Mode';
  }
}

function renderApiList(searchQuery = '') {
  elements.apiList.innerHTML = '';
  
  const filteredApis = PREDEFINED_APIS.filter(api => 
    api.name.toLowerCase().includes(searchQuery) || 
    api.category.toLowerCase().includes(searchQuery)
  );

  if (filteredApis.length === 0) {
    elements.apiList.innerHTML = `<li style="padding: 0.5rem; color: var(--text-muted); font-size: 0.875rem;">No APIs found</li>`;
    return;
  }

  filteredApis.forEach(api => {
    const li = document.createElement('li');
    li.className = 'api-item';
    if (appState.activeApiId === api.id) li.classList.add('active');
    
    li.innerHTML = `
      <i class="ph ph-link"></i>
      <span>${api.name}</span>
    `;
    
    li.addEventListener('click', () => selectApi(api, li));
    elements.apiList.appendChild(li);
  });
}

function renderHistory() {
  elements.historyList.innerHTML = '';
  
  if (appState.history.length === 0) {
    elements.historyList.innerHTML = `<li style="padding: 0.5rem; color: var(--text-muted); font-size: 0.875rem;">No history yet</li>`;
    return;
  }

  // Show only last 5
  appState.history.slice(0, 5).forEach((url, index) => {
    const li = document.createElement('li');
    li.className = 'api-item';
    li.innerHTML = `
      <i class="ph ph-clock-counter-clockwise"></i>
      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${url}">${url.replace(/^https?:\/\//, '')}</span>
    `;
    
    li.addEventListener('click', () => {
      elements.apiUrlInput.value = url;
      parseUrlToParams(url);
      setInfoPanelCustom();
      document.querySelectorAll('.api-item').forEach(el => el.classList.remove('active'));
    });
    
    elements.historyList.appendChild(li);
  });
}

function selectApi(api, element) {
  appState.activeApiId = api.id;
  
  // UI Update
  document.querySelectorAll('.api-item').forEach(el => el.classList.remove('active'));
  element.classList.add('active');
  
  if (window.innerWidth <= 768) {
    elements.sidebar.classList.remove('open');
  }

  // Form Update
  elements.apiUrlInput.value = api.url;
  parseUrlToParams(api.url);

  // Info Panel Update
  elements.infoTitle.textContent = api.name;
  elements.infoDescription.textContent = api.description;
  elements.apiCategoryBadge.textContent = api.category;
  elements.infoAuth.textContent = api.auth;
  elements.infoCors.textContent = api.cors;
  
  elements.infoLink.classList.add('hidden'); // We don't have docs links stored, but could add them
  
  // Reset Response area
  showState('empty');
}

function setInfoPanelCustom() {
  appState.activeApiId = null;
  elements.infoTitle.textContent = 'Custom Request';
  elements.infoDescription.textContent = 'You are making a request to a custom endpoint. Ensure the API supports CORS if calling directly from the browser.';
  elements.apiCategoryBadge.textContent = 'Custom';
  elements.infoAuth.textContent = 'Unknown';
  elements.infoCors.textContent = 'Unknown';
  elements.infoLink.classList.add('hidden');
}


// --- 5. URL & Params Logic ---

function updateUrlFromParams() {
  try {
    const currentUrl = new URL(elements.apiUrlInput.value || 'https://example.com');
    currentUrl.search = ''; // clear
    
    const rows = elements.paramsContainer.querySelectorAll('.param-row');
    rows.forEach(row => {
      const key = row.querySelector('.param-key').value.trim();
      const value = row.querySelector('.param-value').value.trim();
      if (key) {
        currentUrl.searchParams.append(key, value);
      }
    });

    // Only update if it was a valid URL to begin with
    if (elements.apiUrlInput.value && elements.apiUrlInput.value.includes('http')) {
      // Don't want to replace with example.com
      elements.apiUrlInput.value = currentUrl.toString();
    }
  } catch (e) {
    // Invalid URL typing in progress, ignore
  }
}

function parseUrlToParams(urlString) {
  try {
    const url = new URL(urlString);
    
    // Clear existing params
    const existingRows = elements.paramsContainer.querySelectorAll('.param-row');
    existingRows.forEach((row, i) => {
      if (i > 0) row.remove(); // keep first empty row
    });
    
    const firstRow = elements.paramsContainer.querySelector('.param-row');
    if (firstRow) {
      firstRow.querySelector('.param-key').value = '';
      firstRow.querySelector('.param-value').value = '';
    }

    let isFirst = true;
    url.searchParams.forEach((value, key) => {
      if (isFirst && firstRow) {
        firstRow.querySelector('.param-key').value = key;
        firstRow.querySelector('.param-value').value = value;
        isFirst = false;
      } else {
        const row = document.createElement('div');
        row.className = 'param-row';
        row.innerHTML = `
          <input type="text" class="param-key" value="${key}" placeholder="Key">
          <input type="text" class="param-value" value="${value}" placeholder="Value">
          <button type="button" class="icon-btn remove-param text-danger"><i class="ph ph-trash"></i></button>
        `;
        elements.paramsContainer.insertBefore(row, elements.addParamBtn);
        
        row.querySelector('.remove-param').addEventListener('click', () => {
          row.remove();
          updateUrlFromParams();
        });
        
        row.querySelectorAll('input').forEach(input => {
          input.addEventListener('input', updateUrlFromParams);
        });
      }
    });
  } catch (e) {
    // Invalid URL
  }
}


// --- 6. API Execution ---

async function executeRequest() {
  const url = elements.apiUrlInput.value.trim();
  const method = elements.methodSelect.value;

  if (!url) {
    showToast("Please enter a valid URL");
    return;
  }

  // Update history
  if (!appState.history.includes(url)) {
    appState.history.unshift(url);
    if (appState.history.length > 20) appState.history.pop();
    localStorage.setItem('api-explorer-history', JSON.stringify(appState.history));
    renderHistory();
  }

  showState('loading');
  
  const startTime = performance.now();

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Accept': 'application/json'
      }
    });

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    // Extract headers
    const headersObj = {};
    response.headers.forEach((value, key) => {
      headersObj[key] = value;
    });

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = { message: "Response is not JSON format", type: contentType };
    }

    appState.lastResponseData = data;

    // Render Success
    updateBadges(response.status, response.statusText, duration);
    renderJsonOutput(data, elements.jsonOutput);
    renderJsonOutput(headersObj, elements.headersOutput);
    
    showState('data');

  } catch (error) {
    console.error(error);
    appState.lastResponseData = null;
    elements.errorMessage.textContent = error.message || "Failed to fetch. This may be due to CORS restrictions or a network error.";
    showState('error');
    elements.statusBadge.classList.add('hidden');
    elements.timeBadge.classList.add('hidden');
  }
}


// --- 7. UI Helpers ---

function showState(state) {
  elements.emptyState.classList.add('hidden');
  elements.loadingState.classList.add('hidden');
  elements.dataState.classList.add('hidden');
  elements.errorState.classList.add('hidden');

  if (state === 'empty') elements.emptyState.classList.remove('hidden');
  if (state === 'loading') elements.loadingState.classList.remove('hidden');
  if (state === 'data') elements.dataState.classList.remove('hidden');
  if (state === 'error') elements.errorState.classList.remove('hidden');
}

function updateBadges(status, statusText, duration) {
  elements.statusBadge.classList.remove('hidden', 'error');
  elements.statusBadge.textContent = `${status} ${statusText}`;
  
  if (status >= 400) {
    elements.statusBadge.classList.add('error');
  }

  elements.timeBadge.classList.remove('hidden');
  elements.timeText.textContent = `${duration}ms`;
}

function syntaxHighlight(json) {
  if (typeof json != 'string') {
     json = JSON.stringify(json, undefined, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

function renderJsonOutput(data, element) {
  element.innerHTML = syntaxHighlight(data);
}

let toastTimeout;
function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 3000);
}

// Boot
init();
