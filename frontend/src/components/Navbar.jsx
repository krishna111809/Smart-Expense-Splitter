import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar(){
  const navigate = useNavigate()
  const logged = !!localStorage.getItem('ses_token')
  const name = localStorage.getItem('user_name')
  function logout(){
    localStorage.removeItem('ses_token')
    localStorage.removeItem('user_name')
    navigate('/login')
  }
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">ExpenseSplitter</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav ms-auto">
            {logged ? (
              <>
                <li className="nav-item nav-link">Hi, {name}</li>
                <li className="nav-item"><button className="btn btn-sm btn-light" onClick={logout}>Logout</button></li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}