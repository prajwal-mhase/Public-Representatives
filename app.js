const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

/* =========================
   DATA FILE SETUP
========================= */
const DATA_FILE = path.join(__dirname, "data.json");

function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (err) {
    console.error("Error loading data:", err);
    return {};
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

/* =========================
   DATA STORE (PERSISTENT)
========================= */
let representativesData = loadData();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* =========================
   API ROUTES
========================= */

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "API is running" });
});

// Get ALL representatives
app.get("/api/representatives", (req, res) => {
  res.json(representativesData);
});

// =========================
// ADD REPRESENTATIVE
// =========================
app.post("/api/representatives", (req, res) => {
  let { locality, name, designation, phone, email } = req.body;

  if (!locality || !name || !designation) {
    return res.status(400).json({
      message: "Locality, name, and designation are required"
    });
  }

  const loc = locality.trim().toLowerCase();

  const validDesignations = [
    "MP",
    "MLA",
    "Mayor",
    "Nagar Sevak",
    "Sarpanch",
    "Up-Sarpanch",
    "Gram Panchayat Member",
    "Panchayat Samiti Member",
    "Zila Parishad Member"
  ];

  if (!validDesignations.includes(designation)) {
    return res.status(400).json({
      message: "Invalid designation selected"
    });
  }

  if (phone && !/^[0-9]{10}$/.test(phone)) {
    return res.status(400).json({
      message: "Phone number must be exactly 10 digits"
    });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      message: "Invalid email format"
    });
  }

  if (!representativesData[loc]) {
    representativesData[loc] = [];
  }

  const exists = representativesData[loc].some(
    r => r.name.toLowerCase() === name.toLowerCase()
  );

  if (exists) {
    return res.status(400).json({
      message: "Representative already exists in this locality"
    });
  }

  representativesData[loc].push({
    name,
    designation,
    phone: phone || "",
    email: email || ""
  });

  saveData(representativesData);

  res.json({ message: "Representative added successfully" });
});

// =========================
// UPDATE REPRESENTATIVE (GLOBAL SEARCH)
// =========================
app.put("/api/representatives", (req, res) => {
  const { originalName, name, designation, phone, email } = req.body;

  if (!originalName || !name || !designation) {
    return res.status(400).json({
      message: "Original name, new name, and designation are required"
    });
  }

  let found = null;

  for (const loc in representativesData) {
    const rep = representativesData[loc].find(
      r => r.name.toLowerCase() === originalName.toLowerCase()
    );
    if (rep) {
      found = rep;
      break;
    }
  }

  if (!found) {
    return res.status(404).json({
      message: "Representative not found"
    });
  }

  if (phone && !/^[0-9]{10}$/.test(phone)) {
    return res.status(400).json({
      message: "Phone number must be exactly 10 digits"
    });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      message: "Invalid email format"
    });
  }

  found.name = name;
  found.designation = designation;
  found.phone = phone || "";
  found.email = email || "";

  saveData(representativesData);

  res.json({ message: "Representative updated successfully" });
});

// =========================
// DELETE REPRESENTATIVE (GLOBAL SEARCH)
// =========================
app.delete("/api/representatives", (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "Name is required"
    });
  }

  let deleted = false;

  for (const loc in representativesData) {
    const index = representativesData[loc].findIndex(
      r => r.name.toLowerCase() === name.toLowerCase()
    );

    if (index !== -1) {
      representativesData[loc].splice(index, 1);

      if (representativesData[loc].length === 0) {
        delete representativesData[loc];
      }

      deleted = true;
      break;
    }
  }

  if (!deleted) {
    return res.status(404).json({
      message: "Representative not found"
    });
  }

  saveData(representativesData);

  res.json({ message: "Representative deleted successfully" });
});

/* =========================
   FRONTEND FALLBACK
========================= */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* =========================
   START SERVER
========================= */
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
