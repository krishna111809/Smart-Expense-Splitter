import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const [logged, setLogged] = React.useState(!!localStorage.getItem('ses_token'))
  const [name, setName] = React.useState(localStorage.getItem('user_name') || '')

  React.useEffect(() => {
    // update once on mount or when location changes (helps after login redirect)
    const sync = () => {
      setLogged(!!localStorage.getItem('ses_token'))
      setName(localStorage.getItem('user_name') || '')
    }
    sync()
  }, [location]) // run on location change too

  React.useEffect(() => {
    const onStorage = () => {
      setLogged(!!localStorage.getItem('ses_token'))
      setName(localStorage.getItem('user_name') || '')
    }
    const onAuthChange = () => {
      // custom event dispatched from Login/Logout
      setLogged(!!localStorage.getItem('ses_token'))
      setName(localStorage.getItem('user_name') || '')
    }

    window.addEventListener('storage', onStorage)      // other tabs
    window.addEventListener('authChange', onAuthChange) // same tab custom event

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('authChange', onAuthChange)
    }
  }, [])

  function logout() {
    localStorage.removeItem('ses_token')
    localStorage.removeItem('user_name')
    // notify Navbar (same tab)
    window.dispatchEvent(new Event('authChange'))
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
          <ul className="navbar-nav ms-auto align-items-center">
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
