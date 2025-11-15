import React, { useState, useMemo } from 'react'
import { expenses } from '../api'
import { toast } from 'react-toastify'

export default function AddExpense({ group }){
  const [title,setTitle]=useState('')
  const [amount,setAmount]=useState('')
  const [paidBy,setPaidBy]=useState('')
  const [participants,setParticipants]=useState([])
  const [loading,setLoading]=useState(false)

  // universal getters (handles string, populated user, or nested userId)
  const getId = (m) => {
    if (!m) return ''
    if (typeof m === 'string') return m
    if (m.userId) return m.userId._id || m.userId.id || ''
    return m._id || m.id || ''
  }
  const getLabel = (m) => {
    if (!m) return 'Unknown'
    if (typeof m === 'string') return m
    if (m.userId) return m.userId.name || m.displayName || m.userId.email || getId(m)
    return m.name || m.email || m.displayName || getId(m)
  }

  const memberIds = useMemo(() => (group?.members || []).map(getId), [group])
  React.useEffect(() => {
    if (!paidBy && memberIds.length) setPaidBy(memberIds[0])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group])

  function togglePart(id){
    setParticipants(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id])
  }

  async function submit(e){
    e.preventDefault()
    if (!title || !amount || !group?._id || !paidBy) {
      return toast.error('Please fill title, amount, and paid by')
    }
    setLoading(true)
    try{
      const payload = {
        title,
        amount: Number(amount),
        groupId: getId(group),
        paidBy,
        participants
      }
      await expenses.add(payload)
      toast.success('Expense added')
      setTitle(''); setAmount(''); setParticipants([]); setPaidBy(memberIds[0] || '')
    }catch(err){
      console.error(err)
      toast.error(err.response?.data?.message || err.message || 'Add failed')
    }finally{ setLoading(false) }
  }

  return (
    <div className="card p-3 mb-3">
      <h5>Add Expense</h5>
      <form onSubmit={submit}>
        <div className="mb-2">
          <input className="form-control" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required />
        </div>
        <div className="mb-2">
          <input className="form-control" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} required type="number" step="0.01" />
        </div>

        <div className="mb-2">
          <label className="form-label">Paid By</label>
          <select className="form-select" value={paidBy} onChange={e=>setPaidBy(e.target.value)} required>
            <option value="">Select</option>
            {group?.members?.map(m => (
              <option key={getId(m)} value={getId(m)}>{getLabel(m)}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Participants (split)</label>
          <div className="d-flex flex-wrap">
            {group?.members?.map(m => {
              const id = getId(m)
              return (
                <div key={id} className="me-2 mb-2">
                  <button type="button"
                    className={`btn btn-outline-secondary btn-sm ${participants.includes(id) ? 'active' : ''}`}
                    onClick={() => togglePart(id)}
                  >
                    {getLabel(m)}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <button className="btn btn-primary" disabled={loading}>
          {loading ? <div className="spinner-border spinner-border-sm"></div> : 'Add'}
        </button>
      </form>
    </div>
  )
}
