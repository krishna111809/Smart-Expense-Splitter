import React, { useState } from 'react'
import { auth } from '../api'
import { toast, ToastContainer } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    try{
      await auth.register({ name, email, password })
      toast.success('Registered: please login')
      setTimeout(()=>nav('/login'),800)
    }catch(err){
      toast.error(err.response?.data?.message || err.message || 'Register failed')
    }
  }

  return (
    <div className="container mt-5">
      <ToastContainer />
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4">
            <h4>Register</h4>
            <form onSubmit={submit}>
              <div className="mb-3"><label className="form-label">Name</label><input className="form-control" value={name} onChange={e=>setName(e.target.value)} required /></div>
              <div className="mb-3"><label className="form-label">Email</label><input className="form-control" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
              <div className="mb-3"><label className="form-label">Password</label><input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
              <button className="btn btn-primary">Register</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}