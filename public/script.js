/* =========================
   GLOBAL CACHE
========================= */
let fullDataCache = {};

/* =========================
   MODAL CONTROLS
========================= */
function openModal() {
  document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

/* =========================
   DASHBOARD LOADER
========================= */
async function loadDashboard() {
  const dashboard = document.getElementById('dashboard');
  dashboard.innerHTML = 'Loading...';

  try {
    const res = await fetch('/api/representatives');
    const data = await res.json();

    fullDataCache = data;

    if (!Object.keys(data).length) {
      dashboard.innerHTML =
        '<p>No representatives added yet. Click <strong>Manage</strong> to get started.</p>';
      updateStats(0, 0, 0, 0);
      return;
    }

    applyFilters();
    calculateStats(data);
  } catch (err) {
    console.error(err);
    dashboard.innerHTML = 'Error loading dashboard';
  }
}

/* =========================
   APPLY FILTERS
========================= */
function applyFilters() {
  const dashboard = document.getElementById('dashboard');
  const searchText = document
    .getElementById('searchLocality')
    .value
    .toLowerCase();

  const selectedDesignations = Array.from(
    document.getElementById('designationFilter').selectedOptions
  ).map(opt => opt.value);

  let filteredData = {};

  for (const locality in fullDataCache) {
    if (!locality.toLowerCase().includes(searchText)) continue;

    const reps = fullDataCache[locality].filter(rep => {
      if (selectedDesignations.length === 0) return true;
      return selectedDesignations.includes(rep.designation);
    });

    if (reps.length > 0) {
      filteredData[locality] = reps;
    }
  }

  if (Object.keys(filteredData).length === 0) {
    dashboard.innerHTML = '<p>No matching results found.</p>';
    return;
  }

  renderDashboard(filteredData);
}

/* =========================
   RENDER DASHBOARD
========================= */
function renderDashboard(data) {
  const dashboard = document.getElementById('dashboard');
  let html = '';

  for (const locality in data) {
    html += `
      <div class="locality-card">
        <h3>${locality.toUpperCase()}</h3>
    `;

    data[locality].forEach(rep => {
      html += `
        <div class="rep-item">
          <strong>${formatName(rep.name)}</strong>
          <span class="badge">${rep.designation}</span><br>
          📞 ${rep.phone}<br>
          ✉️ ${rep.email}
        </div>
      `;
    });

    html += `</div>`;
  }

  dashboard.innerHTML = html;
}

/* =========================
   STATS CALCULATION
========================= */
function calculateStats(data) {
  let total = 0;
  let mla = 0;
  let mp = 0;

  for (const locality in data) {
    data[locality].forEach(rep => {
      total++;
      if (rep.designation === 'MLA') mla++;
      if (rep.designation === 'MP') mp++;
    });
  }

  updateStats(
    total,
    Object.keys(data).length,
    mla,
    mp
  );
}

function updateStats(total, localities, mla, mp) {
  document.getElementById('totalReps').innerText = total;
  document.getElementById('totalLocalities').innerText = localities;
  document.getElementById('totalMLA').innerText = mla;
  document.getElementById('totalMP').innerText = mp;
}

/* =========================
   ADD REPRESENTATIVE
========================= */
async function addRepresentative() {
  const body = {
    locality: document.getElementById('locality').value.trim(),
    name: document.getElementById('name').value.trim(),
    designation: document.getElementById('designation').value,
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim()
  };

  const addMsg = document.getElementById('addMsg');

  if (!body.locality || !body.name || !body.designation || !body.phone || !body.email) {
    addMsg.innerHTML = '<div class="error">All fields are required</div>';
    return;
  }

  try {
    const res = await fetch('/api/representatives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    addMsg.innerHTML = `<div class="${res.ok ? 'success' : 'error'}">${data.message}</div>`;

    if (res.ok) {
      document.getElementById('locality').value = '';
      document.getElementById('name').value = '';
      document.getElementById('designation').value = '';
      document.getElementById('phone').value = '';
      document.getElementById('email').value = '';
      loadDashboard();
    }
  } catch (err) {
    console.error(err);
    addMsg.innerHTML = '<div class="error">Server error</div>';
  }
}

/* =========================
   DELETE REPRESENTATIVE
========================= */
async function deleteRepresentative() {
  const body = {
    locality: document.getElementById('deleteLocality').value.trim(),
    name: document.getElementById('deleteName').value.trim()
  };

  const deleteMsg = document.getElementById('deleteMsg');

  if (!body.locality || !body.name) {
    deleteMsg.innerHTML = '<div class="error">Locality and name are required</div>';
    return;
  }

  try {
    const res = await fetch('/api/representatives', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    deleteMsg.innerHTML = `<div class="${res.ok ? 'success' : 'error'}">${data.message}</div>`;

    if (res.ok) {
      document.getElementById('deleteLocality').value = '';
      document.getElementById('deleteName').value = '';
      loadDashboard();
    }
  } catch (err) {
    console.error(err);
    deleteMsg.innerHTML = '<div class="error">Server error</div>';
  }
}

/* =========================
   HELPERS
========================= */
function formatName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/* =========================
   INITIAL LOAD
========================= */
window.onload = () => {
  loadDashboard();
};
