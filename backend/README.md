# Smart Expense Splitter – Backend (Node.js + Express + MongoDB)

The **Smart Expense Splitter Backend** provides secure REST APIs for managing  
**users, groups, members, and expenses**.  
It is built using **Node.js**, **Express**, **MongoDB**, and **JWT Authentication**.

---

# ⭐ Features

### 🔐 Authentication
- Register & Login users
- JWT-based protected routes
- Password hashing with bcrypt
- `/me` to fetch logged-in user details

### 👥 Groups
- Create groups
- Add members
- Fetch user groups
- Get group details
- Owner-only permissions

### 💸 Expenses
- Add expenses
- Supports EQUAL / CUSTOM / PERCENTAGE splits
- List group expenses
- Get single expense
- Strong validation rules

### 🛡 Security & Middleware
- Auth middleware for all protected routes
- CORS with `FRONTEND_ORIGIN`
- Global error handler
- Global 404 handler

---

# 🧰 Tech Stack

| Layer | Technology |
|------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (Atlas) + Mongoose |
| Auth | JWT, bcrypt.js |
| Validation | express-validator |
| Dev Tools | nodemon, dotenv |

---

# 📁 Project Structure

```
backend/
│
├── controllers/
│   ├── authController.js
│   ├── groupController.js
│   └── expenseController.js
│
├── models/
│   ├── User.js
│   ├── Group.js
│   └── Expense.js
│
├── routes/
│   ├── authRoutes.js
│   ├── groupRoutes.js
│   └── expenseRoutes.js
│
├── utils/
│   ├── auth.js
│   └── authMiddleware.js
│
├── server.js
├── package.json
├── smokeTest.js
└── .env.example
```

---

# 🔧 Installation

## 1. Clone repository
```bash
git clone https://github.com/krishna111809/Smart-Expense-Splitter.git
cd Smart-Expense-Splitter/backend
```

## 2. Install dependencies
```bash
npm install
```

## 3. Create `.env` file
```
PORT=3000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
FRONTEND_ORIGIN=your_frontend_origin_url
```

> ⚠️ Do NOT commit `.env` to GitHub.

## 4. Run server
```bash
npm run dev
```

---

# 📌 API Endpoints

## 🔐 Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login |
| GET | `/me` | Get authenticated user |

## 👥 Groups (`/api/groups`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create group |
| GET | `/` | List user groups |
| POST | `/:groupId/members` | Add member |
| GET | `/:groupId` | Group details |

## 💸 Expenses (`/api/expenses`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Add expense |
| GET | `/?groupId=ID` | List group expenses |
| GET | `/:id` | Get expense details |

---

# 🧪 Smoke Test Script

Run full backend tests:
```bash
npm install axios
node smokeTest.js
```

Expected:
```
ALL TESTS PASSED ✅
```

---

# ☁ Deployment Guide

### Required env vars:
- PORT  
- MONGO_URI  
- JWT_SECRET  
- FRONTEND_ORIGIN  

### Render setup:
```
Root Directory: /backend
Build Command: npm install
Start Command: npm start
```

---

# 🚀 Future Enhancements
- DELETE Group (owner-only)
- DELETE Expense
- Edit expense & edit group
- Soft-delete & audit logs
- Activity timeline
- Expense settlement system

---

# 📄 License
MIT © Vavilala Krishna Murthi

---

# 🙌 Contributing
PRs and issues welcome.

