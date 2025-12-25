const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

/* =========================
   IN-MEMORY DATA STORE
========================= */
let representativesData = {};

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

/* =========================
   API ROUTES
========================= */

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

// Get ALL representatives (Dashboard)
app.get('/api/representatives', (req, res) => {
  res.json(representativesData);
});

// Get representatives by locality
app.get('/api/representatives/:locality', (req, res) => {
  const locality = req.params.locality.toLowerCase();

  if (representativesData[locality]?.length) {
    res.json(representativesData[locality]);
  } else {
    res.status(404).json({ message: 'No representatives found for this locality' });
  }
});

// Add representative
app.post('/api/representatives', (req, res) => {
  let { locality, name, designation, phone, email } = req.body;

  /* -------- Validation -------- */
  if (!locality || !name || !designation || !phone || !email) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  locality = locality.toLowerCase();

  const validDesignations = [
    'MP',
    'MLA',
    'Mayor',
    'Nagar Sevak',
    'Sarpanch',
    'Up-Sarpanch',
    'Gram Panchayat Member',
    'Panchayat Samiti Member',
    'Zila Parishad Member'
  ];

  if (!validDesignations.includes(designation)) {
    return res.status(400).json({ message: 'Invalid designation selected' });
  }

  if (!/^[0-9]{10}$/.test(phone)) {
    return res.status(400).json({ message: 'Phone number must be 10 digits' });
  }

  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  /* -------- Storage -------- */
  if (!representativesData[locality]) {
    representativesData[locality] = [];
  }

  const exists = representativesData[locality].some(
    rep => rep.name.toLowerCase() === name.toLowerCase()
  );

  if (exists) {
    return res.status(400).json({
      message: 'Representative with this name already exists in this locality'
    });
  }

  representativesData[locality].push({
    name,
    designation,
    phone,
    email
  });

  res.json({ message: 'Representative added successfully' });
});

// Delete representative
app.delete('/api/representatives', (req, res) => {
  let { locality, name } = req.body;

  if (!locality || !name) {
    return res.status(400).json({ message: 'Locality and name are required' });
  }

  locality = locality.toLowerCase();

  if (!representativesData[locality]) {
    return res.status(404).json({ message: 'Locality not found' });
  }

  const index = representativesData[locality].findIndex(
    rep => rep.name.toLowerCase() === name.toLowerCase()
  );

  if (index === -1) {
    return res.status(404).json({ message: 'Representative not found' });
  }

  representativesData[locality].splice(index, 1);

  // Clean up empty locality
  if (representativesData[locality].length === 0) {
    delete representativesData[locality];
  }

  res.json({ message: 'Representative deleted successfully' });
});

/* =========================
   FRONTEND FALLBACK
========================= */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* =========================
   START SERVER
========================= */
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
