# 🚀 Smart Expense Splitter — Frontend (React + Vite)

Frontend for **Smart Expense Splitter**, a clean and responsive expense‑sharing web app built with **React (Vite)**, **Bootstrap**, **Axios**, and **React Router v6**.

---

## ✨ Features

### 🔐 Authentication
- User Registration & Login  
- JWT stored in `localStorage`  
- Auto‑attach token to every request  

### 👥 Groups
- Create groups  
- View joined groups  
- Add members to a group using email  

### 💸 Expenses
- Add expenses with **Equal**, **Percentage**, or **Custom amount** splits  
- Auto‑calculate payer share  
- Universal member/ID parsing

### 🎨 UI/UX
- Clean Bootstrap UI  
- Toast notifications  
- Loading spinners  
- Protected routes  

---

## 🧰 Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React (Vite) |
| Styling | Bootstrap 5 |
| Routing | React Router v6 |
| API Client | Axios |
| Notifications | React Toastify |

---

## 📁 Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Spinner.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── AddMemberForm.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── CreateGroup.jsx
│   │   ├── GroupDetails.jsx
│   │   └── AddExpense.jsx
│   ├── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
└── README.md
```

---

## ⚙️ Getting Started

### 1️⃣ Install dependencies
```bash
npm install
```

### 2️⃣ Set environment variables

Create a `.env` file:

```
VITE_API_BASE_URL=https://your-backend-url.com/api
```

Local backend example:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3️⃣ Run Dev Server
```bash
npm run dev
```

### 4️⃣ Build for Production
```bash
npm run build
```

### 5️⃣ Preview Build
```bash
npm run preview
```

---

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Generate production build |
| `npm run preview` | Preview built output |

---

## ☁️ Deployment

Supported platforms: **Vercel**, **Netlify**, **Render**

- Build command: `npm run build`  
- Output folder: `dist`  
- Set environment variable: `VITE_API_BASE_URL`

---

## 🙌 Author  
**Vavilala Krishna Murthi**

GitHub: https://github.com/krishna111809  

---

## 📝 License  
MIT License © 2025
