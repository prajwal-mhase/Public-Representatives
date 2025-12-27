# 🏛 Public Representatives Dashboard

A community-driven web application to view public representatives and their contact details across national, state, urban, and rural governance levels in India.

---

## 🌐 Live Demo

🔗 https://public-representatives-data.onrender.com

---

## 🎯 Project Purpose

Public representative information is often scattered across multiple sources.  
This project centralizes that data into a single, easy-to-use dashboard to improve accessibility, transparency, and civic awareness.

---

## ⭐ Core Features

- **Centralized Public Representatives Data**  
  View representatives across national, state, urban, and rural governance levels, organized by locality.

- **Contact Details Access**  
  Phone numbers and email addresses (where available) for easier communication and verification.

- **Search & Filter**  
  Search representatives by locality and filter by designation using a multi-select dropdown.

- **Responsive Interface**  
  Optimized for desktop and mobile devices for easy access anywhere.

- **Data Management (Support Feature)**  
  Add, update, and delete representative records to keep information relevant and accurate.

### 📂 Representatives Directory
- Organized by locality  
- Supports multiple governance levels:
  - Member of Parliament (MP)
  - Member of Legislative Assembly (MLA)
  - Mayor
  - Nagar Sevak
  - Sarpanch
  - Up-Sarpanch
  - Gram Panchayat Member
  - Panchayat Samiti Member
  - Zila Parishad Member

---

## ⚙️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js
- REST API

---

## 📂 Project Structure

Public-Representatives/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── data.json
├── app.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md

---

## 🚀 Getting Started (Local Setup)

### 1️⃣ Clone the repository
```git clone https://github.com/prajwal-mhase/Public-Representatives.git```

```cd Public-Representatives```

### 2️⃣ Install dependencies
```npm install```

### 3️⃣ Start the server
```npm start```

### 4️⃣ Open in browser
```http://localhost:3000```

---

## 🔌 API Endpoints

| Method | Endpoint               | Description               |
|-------:|------------------------|---------------------------|
| GET    | /api/health            | API health check          |
| GET    | /api/representatives   | Fetch all representatives|
| POST   | /api/representatives   | Add a representative      |
| PUT    | /api/representatives   | Update a representative   |
| DELETE | /api/representatives   | Delete a representative   |

---

⚠️ Disclaimer

This dashboard is an informational, community-driven platform.
Data is collected from public sources and user inputs and may not be 100% accurate or up to date.

This platform is not an official authority, and no responsibility is assumed for errors, omissions, or actions taken based on this information.
Users are encouraged to independently verify details and contribute corrections using the Manage option.


---

👤 Author

Prajwal Mhase
GitHub: https://github.com/prajwal-mhase

---
