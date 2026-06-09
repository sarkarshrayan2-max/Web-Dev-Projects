const grid = document.getElementById('grid');
const citySelect = document.getElementById('citySelect');
const addBtn = document.getElementById('addBtn');
const formatToggle = document.getElementById('formatToggle');
const status = document.getElementById('status');
const overlay = document.getElementById('overlay');
const overlayDismiss = document.getElementById('overlayDismiss');

const STORAGE_KEY = 'worldclock_data';

const CITIES = [
  { tz: 'America/New_York', label: 'New York', region: 'Eastern US' },
  { tz: 'America/Chicago', label: 'Chicago', region: 'Central US' },
  { tz: 'America/Denver', label: 'Denver', region: 'Mountain US' },
  { tz: 'America/Los_Angeles', label: 'Los Angeles', region: 'Pacific US' },
  { tz: 'Europe/London', label: 'London', region: 'UK' },
  { tz: 'Europe/Paris', label: 'Paris', region: 'France' },
  { tz: 'Europe/Berlin', label: 'Berlin', region: 'Germany' },
  { tz: 'Europe/Moscow', label: 'Moscow', region: 'Russia' },
  { tz: 'Asia/Dubai', label: 'Dubai', region: 'UAE' },
  { tz: 'Asia/Kolkata', label: 'Kolkata', region: 'India' },
  { tz: 'Asia/Singapore', label: 'Singapore', region: 'Singapore' },
  { tz: 'Asia/Tokyo', label: 'Tokyo', region: 'Japan' },
  { tz: 'Australia/Sydney', label: 'Sydney', region: 'Australia' },
  { tz: 'Pacific/Auckland', label: 'Auckland', region: 'New Zealand' },
];

let activeCities = [];
let use24h = false;
let tickId = null;

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (Array.isArray(d.cities)) activeCities = d.cities;
      if (d.use24h !== undefined) use24h = d.use24h;
    }
  } catch {}
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cities: activeCities, use24h }));
  } catch {}
}

function formatTime(date, tz) {
  const h = use24h ? '2-digit' : 'numeric';
  const opts = { hour: h, minute: '2-digit', second: '2-digit', timeZone: tz, hour12: !use24h };
  return new Intl.DateTimeFormat('en-US', opts).format(date);
}

function formatDate(date, tz) {
  const opts = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: tz };
  return new Intl.DateTimeFormat('en-US', opts).format(date);
}

function getHour(date, tz) {
  return parseInt(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: tz }).format(date));
}

function computeOffsetLabel(tz) {
  const now = new Date();
  const localMin = now.getTimezoneOffset();
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' }).formatToParts(now);
  const offPart = parts.find(p => p.type === 'timeZoneName');
  if (!offPart) return '';
  const offStr = offPart.value.replace('GMT', '').trim();
  if (!offStr) return 'same time';
  const neg = offStr.startsWith('-');
  const nums = offStr.replace(/[^0-9:]/g, '');
  const [h, m] = nums.split(':');
  const totalMin = (parseInt(h || '0') * 60 + parseInt(m || '0')) * (neg ? -1 : 1);
  const diff = totalMin + localMin;
  if (diff === 0) return 'same time';
  const ah = Math.floor(Math.abs(diff) / 60);
  const am = Math.abs(diff) % 60;
  const sign = diff > 0 ? 'ahead' : 'behind';
  return am > 0 ? ah + '.' + Math.round(am / 6) + 'h ' + sign : ah + 'h ' + sign;
}

function renderCard(city) {
  const now = new Date();
  const hour = getHour(now, city.tz);
  const isNight = hour >= 18 || hour < 6;
  const card = document.createElement('div');
  card.className = 'card ' + (isNight ? 'night' : 'day');
  card.dataset.tz = city.tz;

  const offsetLabel = computeOffsetLabel(city.tz);

  card.innerHTML = '\
    <button class="card-remove" data-tz="' + city.tz + '" title="Remove">\u2715</button>\
    <div class="card-header">\
      <div>\
        <div class="card-city">' + city.label + '</div>\
        <div class="card-region">' + city.region + ' \u00b7 ' + city.tz + '</div>\
      </div>\
      <div class="card-offset">' + offsetLabel + '</div>\
    </div>\
    <div class="card-time">' + formatTime(now, city.tz) + '</div>\
    <div class="card-date">' + formatDate(now, city.tz) + '</div>\
  ';

  card.querySelector('.card-remove').addEventListener('click', () => removeCity(city.tz));
  return card;
}

function renderAll() {
  grid.innerHTML = '';
  activeCities.forEach(c => {
    const info = CITIES.find(ci => ci.tz === c.tz);
    if (!info) return;
    grid.appendChild(renderCard(info));
  });
  status.textContent = activeCities.length + ' city' + (activeCities.length !== 1 ? 'ies' : 'y') + ' \u00b7 synced to local clock';
}

function tick() { renderAll(); }

function addCity(tz) {
  if (activeCities.find(c => c.tz === tz)) {
    overlay.classList.add('active');
    return;
  }
  const info = CITIES.find(c => c.tz === tz);
  if (!info) return;
  activeCities.push({ tz });
  saveData();
  citySelect.value = '';
  renderAll();
}

function removeCity(tz) {
  activeCities = activeCities.filter(c => c.tz !== tz);
  saveData();
  renderAll();
}

function toggleFormat() {
  use24h = !use24h;
  document.querySelector('.toggle-track').classList.toggle('active', use24h);
  document.querySelector('.toggle-label').textContent = use24h ? '12h' : '24h';
  saveData();
  renderAll();
}

addBtn.addEventListener('click', () => { if (citySelect.value) addCity(citySelect.value); });
citySelect.addEventListener('keydown', (e) => { if (e.key === 'Enter' && citySelect.value) addCity(citySelect.value); });
formatToggle.addEventListener('click', toggleFormat);
overlayDismiss.addEventListener('click', () => overlay.classList.remove('active'));
overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });

document.querySelector('.toggle-track').classList.toggle('active', use24h);
document.querySelector('.toggle-label').textContent = use24h ? '12h' : '24h';

loadData();
renderAll();
tickId = setInterval(tick, 1000);
