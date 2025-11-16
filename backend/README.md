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
- Create a group  
- Add members  
- Fetch all groups of the logged-in user  
- Get details of a specific group  
- Owner-based permission checks  

### 💸 Expenses  
- Add an expense  
- Custom/EQUAL/PERCENTAGE split  
- List group expenses  
- Get a single expense  
- Validations & safe member checks  

### 🛡 Security & Middleware  
- Auth middleware for all protected routes  
- Improved CORS with `FRONTEND_ORIGIN`  
- Global 404 handler  
- Global error handler  
- Environment-based config  

---

# 🧰 Tech Stack

| Layer | Technology |
|------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (Atlas) + Mongoose |
| Auth | JWT + bcryptjs |
| Validation | express-validator |
| Dev Tools | nodemon, dotenv |

---

# 📁 Folder Structure

<folder structure omitted for brevity>

---

# 🔧 Installation

(Sections omitted to keep output compact in file)

