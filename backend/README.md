
# 🚀 Smart Expense Splitter – Backend (MERN)  
A complete backend system for **group expense management**, with secure authentication, group and member handling, flexible expense splitting, and a full API test suite.

---

# ✨ Key Features

## 🔐 Authentication & Security
- JWT‑based secure authentication
- Register & Login with validation
- Password hashing using bcrypt
- Protected routes using middleware
- `/api/auth/me` to fetch logged-in user info
- Email uniqueness enforcement

## 👥 Groups & Members
- Create groups with metadata
- Owner‑based permission system
- Add members using emailId's
- Fetch all groups the user belongs to
- Detailed group info with populated user data

## 💸 Expense Management
Supports 3 split mechanisms:
- **EQUAL** — amount split equally
- **CUSTOM** — shares must sum to total amount
- **PERCENTAGE** — percentages must sum to 100%

## 🧍 User Lookup
- Get user details by email  
- Useful for frontend search before adding members

## 🧰 Technology Stack
| Layer | Technology |
|-------|------------|
| Language | Node.js (Express) |
| Database | MongoDB + Mongoose |
| Auth | JWT & bcrypt |
| Validation | express-validator |
| Utils | Custom auth middleware |
| Testing | axios-based smoke test |

---

# 📁 Folder Structure

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
│   ├── Expense.js
│   └── index.js
│
├── routes/
│   ├── authRoutes.js
│   ├── groupRoutes.js
│   ├── expenseRoutes.js
│   └── userLookup.js
│
├── utils/
│   ├── auth.js
│   └── authMiddleware.js
│
├── smokeTest.js
├── server.js
├── package.json
├── .env.example
└── README.md
```

---

# ⚙️ Installation & Setup

## 1. Clone repository
```bash
git clone https://github.com/krishna111809/Smart-Expense-Splitter.git
cd Smart-Expense-Splitter/backend
```

## 2. Install dependencies
```bash
npm install
```

## 3. Environment variables  
Create `.env` file using:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
```

## 4. Start server
```bash
npm run dev
```

---

# 📌 API Endpoints Overview

## 🔐 Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login & receive JWT |
| GET | `/me` | Fetch current user info |

---

## 👥 Groups (`/api/groups`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create a new group |
| GET | `/` | List groups current user belongs to |
| POST | `/:groupId/members` | Add a member (owner-only) |
| GET | `/:groupId` | Get full group details |

---

## 💸 Expenses (`/api/expenses`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Add new expense |
| GET | `/?groupId=ID` | List group expenses |
| GET | `/:id` | Get single expense details |

---

## 🔎 USER LOOKUP — `/api/users`

| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/by-email?email=ID` | Fetch user info by email |

---

# 🧪 Comprehensive Smoke Test

A fully automated script that verifies:
- Register/Login functionality
- Duplicate registration error handling
- Protected route checks (`/me`)
- Group create & permission tests
- Member addition (owner-only)
- Expense validation errors (CUSTOM/PERCENTAGE)
- Legitimate expense creation
- Listing expenses
- Unauthorized access handling

### Run smoke test:
```bash
npm install axios
node smokeTest.js
```

Clear PASS message:
```
ALL TESTS PASSED ✅
```

---

# ☁ Deployment Guide

### Render/Any Cloud:
| Setting | Value |
|--------|--------|
| Root Directory | `/backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Environment | NODE, MONGODB |

Ensure environment variables are added in dashboard.

---

# 🔮 Future Enhancements
- Update/Delete expenses
- Update/Delete groups
- Admin roles for groups
- Soft delete with audit logs
- Per-member balance settlement engine
- Notifications for group activity
- Scheduled reporting

---

# 🙌 Contributing
Pull requests and suggestions are always welcome!

**Author:** *Vavilala Krishna Murthi*  
**GitHub:** https://github.com/krishna111809  

---

# 📄 License
MIT License © 2025  
