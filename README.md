# 🏥 MediTrack

> A AI healthcare assistant. Can help you track symptoms, schedule appointments, manage medications, and answer health-related questions

---

## 🔒 Overview

**MediTrack+** is a full-stack web application built to securely authenticate and manage users in a healthcare system. It provides distinct login workflows for **patients** and **admins**, ensuring protected access to medical services and records.

---

## ✨ Features

- 🔐 **User Authentication** with hashed passwords (bcrypt)
- 🧾 **JWT-based token generation** for secure sessions
- 🧑‍⚕️ Separate dashboards for **Admin** and **Patient**
- 📁 Organized frontend served via Express (HTML, CSS, JS)
- 🍪 Cookie support (optional extension)
- 📦 Backend built using **Node.js**, **Express**, and **MongoDB**
- 🛡️ Secure password handling and input validation

---

## 🛠️ Tech Stack

| Category         | Technology Used                 |
|------------------|---------------------------------|
| Frontend         | HTML, CSS, JavaScript           |
| Backend          | Node.js, Express.js             |
| Database         | MongoDB + Mongoose              |
| Authentication   | bcrypt, JWT                     |
| Tools            | Postman, Git, GitHub, nodemon   |

---

## 🚀 Getting Started

### 🔧 Prerequisites

- Node.js and npm
- MongoDB installed locally or MongoDB Atlas URI
- Git

### 📦 Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/MediTrack-Hackathon_Project.git
cd MediTrack-Hackathon_Project

# Install dependencies
npm install

# Run the server
npm run dev
