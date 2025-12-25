const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// In-memory data store
let representativesData = {};

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'Public Representatives API is running' });
});

// Get representatives by locality
app.get('/representatives/:locality', (req, res) => {
  const locality = req.params.locality.toLowerCase();

  if (representativesData[locality] && representativesData[locality].length > 0) {
    res.json({ [locality]: representativesData[locality] });
  } else {
    res.status(404).json({ message: `No representatives found for ${locality}.` });
  }
});

// Add a representative
app.post('/update-representative', (req, res) => {
  let { locality, name, designation, phone, email } = req.body;

  if (!locality || !name || !designation || !phone || !email) {
    return res.status(400).json({
      message: 'Incomplete data. Please provide locality, name, designation, phone, and email.'
    });
  }

  locality = locality.toLowerCase();

  const validDesignations = ['Nagarsevak', 'Geramsevak', 'MLA', 'MP'];
  if (!validDesignations.includes(designation)) {
    return res.status(400).json({
      message: 'Invalid designation. Valid options are: Nagarsevak, Geramsevak, MLA, MP.'
    });
  }

  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      message: 'Invalid phone number format. Ensure it has 10 digits.'
    });
  }

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: 'Invalid email format.'
    });
  }

  if (!representativesData[locality]) {
    representativesData[locality] = [];
  }

  const exists = representativesData[locality].find(
    rep => rep.name.toLowerCase() === name.toLowerCase()
  );

  if (exists) {
    return res.status(400).json({
      message: `${name} already exists as a representative in ${locality}.`
    });
  }

  representativesData[locality].push({ name, designation, phone, email });

  res.status(200).json({ message: 'Representative added successfully' });
});

// Delete a representative
app.delete('/delete-representative', (req, res) => {
  let { locality, name } = req.body;

  if (!locality || !name) {
    return res.status(400).json({
      message: 'Incomplete data. Please provide locality and name.'
    });
  }

  locality = locality.toLowerCase();

  if (!representativesData[locality]) {
    return res.status(404).json({
      message: `Locality ${locality} not found.`
    });
  }

  const index = representativesData[locality].findIndex(
    rep => rep.name.toLowerCase() === name.toLowerCase()
  );

  if (index === -1) {
    return res.status(404).json({
      message: `${name} not found in ${locality}.`
    });
  }

  representativesData[locality].splice(index, 1);

  res.status(200).json({
    message: `${name} removed from representatives in ${locality}.`
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
