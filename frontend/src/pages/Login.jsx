import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../api'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const extractErr = (err) => {
    const data = err?.response?.data
    if (data?.msg) return data.msg
    if (data?.message) return data.message
    if (Array.isArray(data?.errors) && data.errors.length) return data.errors.map(e => e.msg).join(', ')
    return err?.message || 'Login failed'
  }

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await auth.login({ email, password })

      const token = res?.data?.token || res?.data?.data?.token || res?.data?.accessToken || res?.token
      const user  = res?.data?.user  || res?.data?.data?.user    || res?.user || null

      if (!token) throw new Error('No token in response')

      localStorage.setItem('ses_token', token)
      localStorage.setItem('user_name', user?.name || user?.email || '')
      const uid = user?.id || user?._id || ''
      if (uid) localStorage.setItem('ses_user_id', uid)

      window.dispatchEvent(new Event('authChange'))
      toast.success('Logged in')
      nav('/')
    } catch (err) {
      toast.error(extractErr(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4">
            <h4>Login</h4>
            <form onSubmit={submit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button className="btn btn-primary" disabled={loading}>
                {loading ? <div className="spinner-border spinner-border-sm" /> : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
