import React, { useState } from 'react'
import { groups } from '../api'
import api from '../api'
import { toast } from 'react-toastify'

export default function AddMemberForm({ groupId, onAdded }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  async function getUserIdByEmail(addr) {
    const e = addr.trim().toLowerCase()
    if (!emailRegex.test(e)) {
      toast.error("Invalid email format")
      return null
    }
    try {
      const res = await api.get('/users/by-email', { params: { email: e } })
      // be tolerant: backend may return .user._id or .user.id
      return res.data?.user?._id || res.data?.user?.id || null
    } catch {
      toast.error("Email not found. User must register first.")
      return null
    }
  }

  async function submit(e) {
    e.preventDefault()
    if (!email.trim()) return toast.error("Enter email")

    setLoading(true)
    try {
      const userId = await getUserIdByEmail(email)
      if (!userId) {
        setLoading(false)
        return
      }

      await groups.addMember(groupId, { memberUserId: userId, displayName: '' })
      toast.success("Member added")
      setEmail('')
      if (onAdded) onAdded()
    } catch (err) {
      toast.error(err?.response?.data?.msg || err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="mb-3">
      <label className="form-label fw-bold">Add Member by Email</label>

      <div className="d-flex" style={{ gap: '8px', maxWidth: '420px' }}>
        <input
          className="form-control form-control-sm"
          style={{ flex: 1 }}
          placeholder="example@gmail.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <button
          className="btn btn-sm btn-primary"
          type="submit"
          disabled={loading}
        >
          {loading ? <span className="spinner-border spinner-border-sm" /> : "Add"}
        </button>
      </div>
    </form>
  )
}