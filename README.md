# 🧾 Smart Expense Splitter

A complete **MERN-style (React + Node.js)** Smart Expense Splitter that lets users manage groups, add members, create expenses, and automatically split amounts using Equal, Percentage, or Custom modes.

---

# ⚡ Project Overview

| Part | Technology |
|------|------------|
| **Frontend** | React (Vite), Axios, Bootstrap, React Router v6 |
| **Backend** | Node.js, Express.js, MongoDB, JWT Auth, Mongoose |
| **Notifications** | React Toastify |
| **Deployment** | Render / Vercel |

---

# 🚀 Features

### 🔐 Authentication
- Register, Login
- JWT-based protected routes
- Auto-token injection from frontend

### 👥 Group Management
- Create groups
- Add members by email
- View group details

### 💸 Expense Splitting
Supports three modes:

| Mode | Description |
|------|-------------|
| **Equal Split** | Amount divided equally among participants (payer included) |
| **Percentage Split** | Each member gets a % share (auto-calculates payer %) |
| **Custom Amount Split** | Manual amounts for each participant |

### 🎨 UI/UX
- Bootstrap components  
- Toast notifications  
- Loading spinners  
- Clean responsive design  

---

# 📁 Folder Structure

```
smart-expense-splitter/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── README.md
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    ├── index.html
    ├── package.json
    └── README.md
```

---

# 🛠 Backend Setup

## 1️⃣ Install Dependencies
```bash
cd backend
npm install
```

## 2️⃣ Environment Variables  
Create a `.env` file:

```
MONGO_URI=mongodb+srv://your-db-url
JWT_SECRET=your-secret
```

## 3️⃣ Run Backend
```bash
npm start
```

---

# 🌐 Backend API Endpoints

## **Auth**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/auth/me` | Get current user info |

## **Groups**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groups` | List user’s groups |
| POST | `/api/groups` | Create group |
| GET | `/api/groups/:id` | Get group details |
| POST | `/api/groups/:id/members` | Add member by email |

## **Expenses**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/expenses` | Add expense |
| GET | `/api/expenses?groupId=` | List expenses for a group |

---

# 🎨 Frontend Setup

## 1️⃣ Install Dependencies
```bash
cd frontend
npm install
```

## 2️⃣ Create `.env`
```
VITE_API_BASE_URL=http://localhost:3000/api
```

## 3️⃣ Run Frontend
```bash
npm run dev
```

---

# 🔌 API Client (frontend)

The frontend uses Axios with auto-token injection.

```js
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })

api.interceptors.request.use(config => {
  const token = localStorage.getItem("ses_token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

---

# 📦 Build Commands

## Frontend:
```
npm run build
npm run preview
```

## Backend:
```
npm start
```

---

# ☁ Deployment Guide

## Frontend (Vercel / Netlify)
- Set environment variable: `VITE_API_BASE_URL`
- Publish directory: **dist**

## Backend (Render / Railway)
- Add environment variables from `.env`
- Expose port
- MongoDB Atlas recommended

---

# 🧪 Testing Flow
1. Register  
2. Login  
3. Create group  
4. Add member using email  
5. Add expense  
6. Verify totals and splits in Group Details  

---

# 🙌 Author  
**Vavilala Krishna Murthi**  
GitHub: https://github.com/krishna111809  

---

# 📝 License  
MIT License © 2025
