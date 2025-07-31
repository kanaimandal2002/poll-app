# 🗳️ Real-Time Poll-App

A full-stack MERN application for creating and voting on polls with real-time results updates.

## ✨ Features

- 📝 Create polls with custom questions and multiple options
- ✅ Single-choice voting system
- 📊 Real-time results visualization
- 📱 Responsive design for all devices
- 🔒 Simple IP-based duplicate vote prevention
- 📈 Interactive charts to display results

## 🛠️ Tech Stack

**Frontend:**
- React.js
- React Router
- Chart.js
- Socket.io Client
- Tailwind CSS

**Backend:**
- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.io

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- Git

### Installation

1. Clone the repo:
```bash
git clone https://github.com/kanaimandal2002/poll-app.git
cd poll-app
```

2. Set up the backend:

```bash
cd server
npm install
touch .env
```

Add the following to your .env file:

```bash
MONGODB_URI=mongodb://localhost:27017/poll-app
PORT=5000
CLIENT_URL=http://localhost:3000
```
3. Set up the frontend:

```bash
cd ../client
npm install
touch .env
```

Add the following to your .env file:

```bash
REACT_APP_API_URL=http://localhost:5000
```
4. Start the development servers:

# In one terminal (backend)
```bash
cd server
npm run dev
```
# In another terminal (frontend)
```bash
cd client
npm start
```
The app should now be running at http://localhost:3000

