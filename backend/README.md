# Smart Expense Splitter – Backend (Node.js + Express + MongoDB)

The **Smart Expense Splitter** backend provides secure APIs for managing users, groups, and expenses.  
It is built using **Node.js**, **Express.js**, **MongoDB**, and **JWT authentication**.

---

# ⭐ Features

### 🔐 Authentication
- User registration & login  
- Password hashing with bcrypt  
- JWT-based authentication  
- Protected routes  

### 👥 Groups
- Create new groups  
- Add members to groups  
- Fetch logged-in user's groups  

### 💸 Expenses
- Add expenses  
- List all expenses in a group  
- Get details of a single expense  
- Split amount among participants  

### 🗂 Clean Architecture
- Controllers  
- Routes  
- Models  
- Utility functions  

### ☁️ Deployment Ready
- Fully compatible with **Render**  
- Environment variables supported  

---

# 🧰 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas) + Mongoose |
| Authentication | JWT, bcryptjs |
| Validation | express-validator |
| Dev Tools | Nodemon, dotenv |

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
│   └── auth.js
│
├── server.js
├── package.json
└── .env.example
```

---

# 🔧 Installation & Setup

## 1️⃣ Clone the repository
```bash
git clone https://github.com/krishna111809/Smart-Expense-Splitter.git
cd Smart-Expense-Splitter/backend
```

## 2️⃣ Install dependencies
```bash
npm install
```

## 3️⃣ Create `.env`
Copy `.env.example` → `.env` and add your variables:

```
PORT=3000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
```

## 4️⃣ Run the backend (development)
```bash
npm run dev
```

Backend runs at:
```
http://localhost:3000
```

---

# 📌 API Endpoints

## 🔐 Auth Routes (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | Login user & get JWT token |
| GET | `/me` | Get logged-in user details |

---

## 👥 Group Routes (`/api/groups`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create a group |
| GET | `/` | Fetch all groups of the user |
| POST | `/:groupId/members` | Add a member to a group |

---

## 💸 Expense Routes (`/api/expenses`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Add an expense |
| GET | `/?groupId=ID` | List expenses for a group |
| GET | `/:id` | Get details of one expense |

---

# ☁️ Deployment (Render)

### Render Configuration:
- **Root Directory:** `/backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `MONGO_URI`
  - `JWT_SECRET`

---

# 🧪 Useful Scripts

```bash
npm run dev    # development mode
npm start      # production mode
```

---

# 📄 License
MIT License © Krishna Murthi

---

# 🤝 Contributing
Pull requests are welcome.
