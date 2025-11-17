import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../api'
import { toast} from 'react-toastify'
import { ToastContainer } from 'react-toastify'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const extractErr = (err) => {
    const data = err?.response?.data

    // if backend sends { msg: "..."} or { message: "..." }
    if (data?.msg) return data.msg
    if (data?.message) return data.message

    // if backend sends express-validator style errors
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors.map(e => e.msg).join(', ')
    }

    // fallback to axios message
    return err?.message || 'Login failed'
  }

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await auth.login({ email, password })
      const token = res?.data?.token || res?.data?.data?.token
      const user = res?.data?.user || res?.data?.data?.user || res?.data?.user || null

      if (token) {
        localStorage.setItem('ses_token', token)
        // store display name (fallbacks) — used by Navbar
        localStorage.setItem('user_name', user?.name || user?.email || '')

        // normalize ID (backend sometimes returns id and sometimes _id)
        const uid = user?.id || user?._id || ''
        if (uid) localStorage.setItem('ses_user_id', uid)

        // notify same-tab listeners (Navbar)
        window.dispatchEvent(new Event('authChange'))
        toast.success('Logged in')
        nav('/')
      } else {
        throw new Error('No token in response')
      }
    } catch (err) {
      toast.error(extractErr(err))
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
            <h4>Login</h4>
            <form onSubmit={submit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button className="btn btn-primary" disabled={loading}>{loading ? <div className="spinner-border spinner-border-sm"></div> : 'Login'}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
