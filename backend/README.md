# 🚀 Smart Expense Splitter – Backend (MERN)

A fully-featured backend for **group expense management**, supporting secure authentication, group/member operations, flexible expense splitting, and a complete automated smoke test suite for reliability.

---

# ✨ Features

## 🔐 Authentication & Security
- JWT-based authentication  
- Secure password hashing (bcrypt)  
- Input validation with express-validator  
- Auth middleware for protected routes  
- `/api/auth/me` returns authenticated user  
- Helmet + Rate Limiting + CORS enabled  

---

## 👥 Groups & Members
- Create and manage groups  
- Owner-based permission system  
- Add/update/remove members  
- Fetch all groups a user belongs to  
- Detailed group info retrieval  
- Email-based user lookup (before adding members)  

---

## 💸 Expense Management
Supports three split types:

| Split Type | Behavior |
|-----------|-----------|
| **EQUAL** | Auto-calculates equal shares (rounding-safe) |
| **CUSTOM** | Shares must equal total amount |
| **PERCENTAGE** | Shares must sum to 100% |

Additional features:
- Only group members can add expenses  
- Only owner/payer can modify/delete expenses  
- Server-level validation for all split types  

---

## 🔎 User Lookup API
Quick email search:
- `/api/users/by-email?email=`  
Useful for frontend search-add member workflow.

---

## 🧰 Technology Stack

| Layer | Technology |
|-------|------------|
| Language | Node.js (Express) |
| Database | MongoDB + Mongoose |
| Auth | JWT, bcryptjs |
| Validation | express-validator |
| Security | helmet, express-rate-limit, CORS |
| Testing | axios-based smoke test |

---

# 📂 Folder Structure

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

## 1️⃣ Clone Repository
```bash
git clone https://github.com/krishna111809/Smart-Expense-Splitter.git
cd Smart-Expense-Splitter/backend
```

## 2️⃣ Install Dependencies
```bash
npm install
```

## 3️⃣ Environment Variables  
Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
PORT=3000
```

Use `.env.example` for reference.

## 4️⃣ Start Development Server
```bash
npm run dev
```

Start production:
```bash
npm start
```

---

# 📌 API Endpoints

## 🔐 Auth – `/api/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register user |
| POST | `/login` | Login & get JWT |
| GET | `/me` | Get current user |

---

## 👥 Groups – `/api/groups`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create group |
| GET | `/` | List user’s groups |
| GET | `/:groupId` | Get group details |
| POST | `/:groupId/members` | Add member (owner-only) |
| PUT | `/:groupId/members` | Update member (owner-only) |
| DELETE | `/:groupId/members/:memberId` | Remove member |
| DELETE | `/:groupId` | Delete group + all expenses |

---

## 💸 Expenses – `/api/expenses`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Add new expense |
| PUT | `/:id` | Modify expense |
| DELETE | `/:id` | Delete expense |
| GET | `/?groupId=` | List group expenses |
| GET | `/:id` | Get single expense |

---

## 🔎 User Lookup – `/api/users`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/by-email?email=` | Fetch user by email |

---

# 🧪 Automated Smoke Test

Full automated script validates:
- Registration  
- Login  
- Protected route validation  
- Group create/update/delete  
- Member add/update/delete  
- Expense create/list/get/delete  
- Permission checks  
- Split type validation  

### Run it:
```bash
node smokeTest.js
```

Expected output:
```
ALL TESTS PASSED ✅
```

---

# ☁ Deployment Guide

## Render / Railway / VPS

| Setting | Value |
|--------|--------|
| Root Directory | `/backend` |
| Start Command | `npm start` |
| Build Command | `npm install` |
| Environment | NODE + MongoDB URI |

Ensure env vars:
- `MONGO_URI`
- `JWT_SECRET`
- `CORS_ORIGIN` (optional)

---

# 🔮 Future Enhancements
- Admin roles  
- Soft delete & undo  
- Per-member balances engine  
- Group settlement calculations    

---

# 👨‍💻 Author
**Vavilala Krishna Murthi**  
GitHub: https://github.com/krishna111809  

---

# 📄 License
MIT License © 2025
