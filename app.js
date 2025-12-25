const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

// Example dynamic data structure to hold representatives
let representativesData = {};

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Endpoint to get representatives for a locality
app.get('/representatives/:locality', (req, res) => {
  const locality = req.params.locality.toLowerCase();

  // Check if locality exists
  if (representativesData[locality] && representativesData[locality].length > 0) {
    res.json({ [locality]: representativesData[locality] });
  } else {
    res.status(404).json({ message: `No representatives found for ${locality}.` });
  }
});

// Endpoint to update representative information
app.post('/update-representative', (req, res) => {
  const { locality, name, designation, phone, email } = req.body;

  // Validate required fields
  if (!locality || !name || !designation || !phone || !email) {
    return res.status(400).json({ message: 'Incomplete data. Please provide locality, name, designation, phone, and email.' });
  }

  // Validate designation
  const validDesignations = ['Nagarsevak', 'Geramsevak', 'MLA', 'MP'];
  if (!validDesignations.includes(designation)) {
    return res.status(400).json({ message: 'Invalid designation. Valid options are: Nagarsevak, Geramsevak, MLA, MP.' });
  }

  // Validate phone number format (basic validation)
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ message: 'Invalid phone number format. Ensure it has 10 digits.' });
  }

  // Validate email format (basic validation)
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  // If locality does not exist, create it
  if (!representativesData[locality]) {
    representativesData[locality] = [];
  }

  // Check if representative already exists
  const existingRepresentative = representativesData[locality].find(rep => rep.name === name);
  if (existingRepresentative) {
    return res.status(400).json({ message: `${name} already exists as a representative in ${locality}.` });
  }

  // Add the new representative to the locality
  representativesData[locality].push({ name, designation, phone, email });
  res.status(200).json({ message: 'Representative added successfully' });
});

// Endpoint to delete a representative
app.delete('/delete-representative', (req, res) => {
  const { locality, name } = req.body;

  if (!locality || !name) {
    return res.status(400).json({ message: 'Incomplete data. Please provide locality and name.' });
  }

  // Check if locality exists
  if (!representativesData[locality]) {
    return res.status(404).json({ message: `Locality ${locality} not found.` });
  }

  // Find representative and remove
  const representativeIndex = representativesData[locality].findIndex(rep => rep.name === name);
  if (representativeIndex === -1) {
    return res.status(404).json({ message: `${name} not found in ${locality}.` });
  }

  representativesData[locality].splice(representativeIndex, 1);
  res.status(200).json({ message: `${name} removed from representatives in ${locality}.` });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
