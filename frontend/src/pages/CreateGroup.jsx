// src/pages/CreateGroup.jsx
import React, { useState } from 'react'
import { groups } from '../api'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

export default function CreateGroup() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    try {
      const res = await groups.create({ name, description })
      toast.success('Group created')
      nav('/')
    } catch (err) {
      toast.error(err.response?.data?.msg || err.response?.data?.message || err.message)
    }
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-3">
            <h5>Create Group</h5>
            <form onSubmit={submit}>
              
              {/* Name */}
              <div className="mb-3">
                <label className="form-label">Group Name</label>
                <input
                  className="form-control"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <button className="btn btn-primary">Create</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
