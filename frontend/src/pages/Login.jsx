import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../api'
import { toast, ToastContainer } from 'react-toastify'
import Spinner from '../components/Spinner'

export default function Login(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [loading,setLoading]=useState(false)
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault(); setLoading(true)
    try{
      const res = await auth.login({ email, password })
      const token = res.data.token || res.data?.data?.token
      const user = res.data.user || res.data?.data?.user
      if (token) {
        localStorage.setItem('ses_token', token)
        localStorage.setItem('user_name', user?.name || user?.email || '')
        toast.success('Logged in')
        nav('/')
      } else throw new Error('No token in response')
    }catch(err){
      toast.error(err.response?.data?.message || err.message || 'Login failed')
    }finally{setLoading(false)}
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
                <input className="form-control" value={email} onChange={e=>setEmail(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} required />
              </div>
              <button className="btn btn-primary" disabled={loading}>{loading? <div className="spinner-border spinner-border-sm"></div> : 'Login'}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}