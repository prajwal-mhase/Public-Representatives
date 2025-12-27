/* =========================
   GLOBAL DATA CACHE
========================= */
let fullDataCache = {};
let editTarget = null;
let deleteTarget = null;

/* =========================
   MODAL CONTROLS
========================= */
function openModal() {
  document.getElementById("modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

/* =========================
   LOAD DASHBOARD DATA
========================= */
async function loadDashboard() {
  const dashboard = document.getElementById("dashboard");
  if (!dashboard) return;

  dashboard.innerHTML = "Loading...";

  try {
    const res = await fetch("/api/representatives");
    const data = await res.json();

    fullDataCache = data;

    if (!Object.keys(data).length) {
      dashboard.innerHTML =
        "<p>No representatives added yet. Click <strong>Manage</strong> to get started.</p>";
      updateStats(0, 0, 0, 0);
      return;
    }

    applyFilters();
    calculateStats(data);
  } catch (err) {
    console.error(err);
    dashboard.innerHTML = "Error loading dashboard";
  }
}

/* =========================
   APPLY FILTERS
========================= */
function applyFilters() {
  const dashboard = document.getElementById("dashboard");
  if (!dashboard) return;

  const searchText =
    document.getElementById("searchLocality")?.value.toLowerCase() || "";

  const selectedDesignations = Array.from(
    document.querySelectorAll(".dropdown-list input:checked")
  ).map(cb => cb.value);

  let filteredData = {};

  for (const locality in fullDataCache) {
    if (!locality.toLowerCase().includes(searchText)) continue;

    const reps = fullDataCache[locality].filter(rep => {
      if (selectedDesignations.length === 0) return true;
      return selectedDesignations.includes(rep.designation);
    });

    if (reps.length) filteredData[locality] = reps;
  }

  if (!Object.keys(filteredData).length) {
    dashboard.innerHTML = "<p>No matching results found.</p>";
    return;
  }

  renderDashboard(filteredData);
}

/* =========================
   RENDER DASHBOARD
========================= */
function renderDashboard(data) {
  const dashboard = document.getElementById("dashboard");
  if (!dashboard) return;

  let html = "";

  for (const locality in data) {
    html += `<div class="locality-card">
      <h3>${locality.toUpperCase()}</h3>`;

    data[locality].forEach(rep => {
      html += `<div class="rep-item">
        <strong>${formatName(rep.name)}</strong>
        <span class="badge">${rep.designation}</span><br>
        ${rep.phone ? `📞 ${rep.phone}<br>` : ""}
        ${rep.email ? `✉️ ${rep.email}` : ""}
      </div>`;
    });

    html += "</div>";
  }

  dashboard.innerHTML = html;
}

/* =========================
   DASHBOARD STATS
========================= */
function calculateStats(data) {
  let total = 0,
    mla = 0,
    mp = 0;

  for (const locality in data) {
    data[locality].forEach(rep => {
      total++;
      if (rep.designation === "MLA") mla++;
      if (rep.designation === "MP") mp++;
    });
  }

  updateStats(total, Object.keys(data).length, mla, mp);
}

function updateStats(total, localities, mla, mp) {
  document.getElementById("totalReps").innerText = total;
  document.getElementById("totalLocalities").innerText = localities;
  document.getElementById("totalMLA").innerText = mla;
  document.getElementById("totalMP").innerText = mp;
}

/* =========================
   ADD REPRESENTATIVE
========================= */
async function addRepresentative() {
  const body = {
    locality: document.getElementById("locality").value.trim(),
    name: document.getElementById("name").value.trim(),
    designation: document.getElementById("designation").value,
    phone: document.getElementById("phone").value.trim(),
    email: document.getElementById("email").value.trim()
  };

  const addMsg = document.getElementById("addMsg");

  if (!body.locality || !body.name || !body.designation) {
    addMsg.innerHTML =
      "<div class='error'>Locality, name, and designation are required</div>";
    return;
  }

  try {
    const res = await fetch("/api/representatives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    addMsg.innerHTML = `<div class="${res.ok ? "success" : "error"}">${data.message}</div>`;

    if (res.ok) {
      ["locality", "name", "designation", "phone", "email"].forEach(
        id => (document.getElementById(id).value = "")
      );
      loadDashboard();
    }
  } catch {
    addMsg.innerHTML = "<div class='error'>Server error</div>";
  }
}

/* =========================
   MANAGE MODAL FORM CONTROL
========================= */
function showForm(type) {
  ["addForm", "editForm", "deleteForm"].forEach(id =>
    document.getElementById(id)?.classList.add("hidden")
  );

  document.getElementById("addMsg").innerHTML = "";
  document.getElementById("editMsg").innerHTML = "";
  document.getElementById("deleteMsg").innerHTML = "";

  if (type === "add") document.getElementById("addForm").classList.remove("hidden");
  if (type === "edit") document.getElementById("editForm").classList.remove("hidden");
  if (type === "delete") document.getElementById("deleteForm").classList.remove("hidden");
}

/* =========================
   EDIT REPRESENTATIVE
========================= */
function showEditSuggestions() {
  const query = document.getElementById("editSearch").value.toLowerCase();
  const box = document.getElementById("editSuggestions");
  box.innerHTML = "";

  if (!query) return;

  getAllRepresentatives()
    .filter(r => r.name.toLowerCase().includes(query))
    .forEach(r => {
      const div = document.createElement("div");
      div.textContent = `${r.name} (${r.locality})`;
      div.onclick = () => selectEditRepresentative(r);
      box.appendChild(div);
    });
}

function selectEditRepresentative(rep) {
  editTarget = rep;

  document.getElementById("editSearch").value = rep.name;
  document.getElementById("editLocality").value = rep.locality;
  document.getElementById("editName").value = rep.name;
  document.getElementById("editDesignation").value = rep.designation;
  document.getElementById("editPhone").value = rep.phone || "";
  document.getElementById("editEmail").value = rep.email || "";

  document.getElementById("editSuggestions").innerHTML = "";
}

async function updateRepresentative() {
  if (!editTarget) return;

  const body = {
    locality: editTarget.locality,
    originalName: editTarget.name,
    name: document.getElementById("editName").value.trim(),
    designation: document.getElementById("editDesignation").value,
    phone: document.getElementById("editPhone").value.trim(),
    email: document.getElementById("editEmail").value.trim()
  };

  const msg = document.getElementById("editMsg");

  try {
    const res = await fetch("/api/representatives", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    msg.innerHTML = `<div class="${res.ok ? "success" : "error"}">${data.message}</div>`;

    if (res.ok) {
      editTarget = null;
      loadDashboard();
    }
  } catch {
    msg.innerHTML = "<div class='error'>Server error</div>";
  }
}

/* =========================
   DELETE REPRESENTATIVE
========================= */
function showDeleteSuggestions() {
  const query = document.getElementById("deleteSearch").value.toLowerCase();
  const box = document.getElementById("deleteSuggestions");
  box.innerHTML = "";

  if (!query) return;

  getAllRepresentatives()
    .filter(r => r.name.toLowerCase().includes(query))
    .forEach(r => {
      const div = document.createElement("div");
      div.textContent = `${r.name} (${r.locality})`;
      div.onclick = () => {
        deleteTarget = r;
        document.getElementById("deleteSearch").value = r.name;
        box.innerHTML = "";
      };
      box.appendChild(div);
    });
}

async function deleteRepresentative() {
  if (!deleteTarget) return;

  const msg = document.getElementById("deleteMsg");

  try {
    const res = await fetch("/api/representatives", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locality: deleteTarget.locality,
        name: deleteTarget.name
      })
    });

    const data = await res.json();
    msg.innerHTML = `<div class="${res.ok ? "success" : "error"}">${data.message}</div>`;

    if (res.ok) {
      deleteTarget = null;
      loadDashboard();
    }
  } catch {
    msg.innerHTML = "<div class='error'>Server error</div>";
  }
}

/* =========================
   HELPERS
========================= */
function formatName(name) {
  return name
    .toLowerCase()
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getAllRepresentatives() {
  const list = [];
  for (const locality in fullDataCache) {
    fullDataCache[locality].forEach(rep =>
      list.push({ locality, ...rep })
    );
  }
  return list;
}

/* =========================
   INITIAL LOAD
========================= */
window.onload = loadDashboard;
