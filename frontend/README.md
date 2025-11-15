📘 Smart Expense Splitter – Frontend (Vite + React)

This is the frontend application for the Smart Expense Splitter project, built using React, Vite, Bootstrap, and React Router.
It consumes the backend APIs to manage authentication, groups, and expenses.

⭐ Features
🎨 UI & UX

Clean, simple, responsive interface (Bootstrap)

Interactive components with loading spinners

Toast notifications for success/error feedback

Protected routes for authenticated pages

👥 Groups

View all groups user is part of

Create a new group

View group details

Add expenses to a group

💸 Expenses

Create expenses with:

Title

Amount

Paid By

Participants

Automatic handling of multiple backend member formats

🔐 Authentication

Login / Register

JWT token stored in localStorage

Auto-attach token to every API request

🧰 Tech Stack
Layer	Technology
Frontend	React (Vite)
UI	Bootstrap 5
Notifications	React Toastify
API Client	Axios
Routing	React Router v6
📁 Project Structure
frontend/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Spinner.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── CreateGroup.jsx
│   │   ├── GroupDetails.jsx
│   │   └── AddExpense.jsx
│   │
│   ├── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
│
├── index.html
├── package.json
└── README.md

🚀 Getting Started
1️⃣ Install dependencies
cd frontend
npm install

2️⃣ Run the development server
npm run dev


Vite will show a local URL (usually http://localhost:5173).

3️⃣ Build for production
npm run build

4️⃣ Preview production build
npm run preview

🔗 API Configuration

All API requests go through:

src/api.js


The default API base is the deployed backend:

const API_BASE = 'https://smart-expense-splitter-backend-2lne.onrender.com/api'

🔄 If you're running backend locally:

Change it to:

const API_BASE = 'http://localhost:3000/api'

🔒 Authentication

When a user logs in, a JWT token is saved in localStorage under ses_token.

api.js automatically adds Authorization: Bearer <token> to each API call.

Protected pages use ProtectedRoute.jsx to block unauthenticated access.

🧪 Troubleshooting
🔸 Members showing as “Unknown”

Your backend returns nested member structure like:

{
  "userId": { "_id": "...", "name": "Krishna" },
  "displayName": "You"
}


The UI includes universal member extractors (getId() / getLabel()) inside:

GroupDetails.jsx

AddExpense.jsx

So no backend changes are required.

🔸 Authentication not working

Clear stored tokens:

localStorage.removeItem('ses_token')
localStorage.removeItem('user_name')

🔸 API errors

Check DevTools → Network tab → open the failed request → Response tab.

📄 Environment Notes
✔ Keep .gitignore

Do NOT delete it.
Make sure it includes:

node_modules/
dist/
.env

❌ Do NOT commit:

node_modules

dist

.env files

🤝 Contributing

Follow component structure under src/.

Use small, clean components.

Keep all API logic inside api.js.

📜 License

MIT License © Krishna Murthi