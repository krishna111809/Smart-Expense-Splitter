import { useState } from 'react'
import { auth } from '../api'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({}) // { name: '...', email: '...', password: '...' }
  const nav = useNavigate()

  const extractMsg = (err) => {
    return err?.response?.data?.msg || err?.response?.data?.message || err?.message || 'Register failed'
  }

  // Use "path" because backend errors use path (express-validator)
  const extractFieldErrors = (err) => {
    const arr = err?.response?.data?.errors
    if (!Array.isArray(arr)) return {}
    const map = {}
    arr.forEach(e => {
      const key = e.path || e.param || e.location // fallback
      if (key) map[key] = e.msg
    })
    return map
  }

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setFieldErrors({})
    try {
      await auth.register({ name, email, password })
      toast.success('Registered: please login')
      setTimeout(() => nav('/login'), 700)
    } catch (err) {
      console.error('Register error raw:', err)

      // Network / CORS errors
      if (!err.response) {
        toast.error('Network or CORS error: ' + (err.message || 'Request failed'))
        setLoading(false)
        return
      }

      // Field errors (express-validator)
      const f = extractFieldErrors(err)
      if (Object.keys(f).length) {
        setFieldErrors(f)
        toast.error('Please fix the highlighted fields')
        setLoading(false)
        return
      }

      // Generic backend message
      const msg = extractMsg(err)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mt-5">
      <ToastContainer />
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4">
            <h4>Register</h4>
            <form onSubmit={submit} noValidate>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
                {fieldErrors.name && <div className="invalid-feedback">{fieldErrors.name}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                {fieldErrors.password && <div className="invalid-feedback">{fieldErrors.password}</div>}
              </div>

              <button className="btn btn-primary" disabled={loading}>
                {loading ? <div className="spinner-border spinner-border-sm"></div> : 'Register'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
