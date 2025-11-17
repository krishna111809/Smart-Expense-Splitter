// src/pages/AddExpense.jsx
import React, { useState, useMemo, useEffect } from 'react'
import { expenses } from '../api'
import { toast } from 'react-toastify'

export default function AddExpense({ group, onAdded }) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [selectedParts, setSelectedParts] = useState([]) // non-payer participants
  const [includePayer] = useState(true) // payer always included (no setter needed)
  const [loading, setLoading] = useState(false)
  const [splitType, setSplitType] = useState('EQUAL') // EQUAL | PERCENTAGE | CUSTOM
  const [shares, setShares] = useState({}) // { userId: number } - stores non-payer shares (pct or amount)

  // --- helpers for member shapes ---
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

  const memberIds = useMemo(() => (group?.members || []).map(getId).filter(Boolean), [group])

  // default paidBy
  useEffect(() => {
    if ((!paidBy || paidBy === '') && memberIds.length) {
      setPaidBy(memberIds[0])
    }
  }, [memberIds])

  // whenever paidBy changes auto-select all others and reset shares (preserve earlier vals)
  useEffect(() => {
    if (!paidBy) return
    const nextSelected = memberIds.filter(id => String(id) !== String(paidBy))
    setSelectedParts(nextSelected)
    setShares(prev => {
      const copy = {}
      nextSelected.forEach(id => { copy[id] = splitType === 'EQUAL' ? (prev[id] || '') : '' })
      return copy
    })
  }, [paidBy, memberIds])

  useEffect(() => {
    // when switching into PERCENTAGE or CUSTOM, clear any existing shares so we don't mix amounts <> percentages
    if (splitType === 'EQUAL') return
    if (!selectedParts.length) { setShares({}); return }
    setShares(prev => {
      const next = {}
      selectedParts.forEach(id => { next[id] = '' })
      return next
    })
  }, [splitType, selectedParts])

  function togglePart(id) {
    if (String(id) === String(paidBy)) {
      toast.info('Payer is included automatically')
      return
    }
    setSelectedParts(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      if (!prev.includes(id)) setShares(s => ({ ...s, [id]: '' }))
      else setShares(s => { const c = { ...s }; delete c[id]; return c })
      return next
    })
  }

  const extractErr = (err) => {
    const data = err?.response?.data
    if (data?.msg) return data.msg
    if (data?.message) return data.message
    if (Array.isArray(data?.errors)) return data.errors.map(e => e.msg).join(', ')
    return err?.message || 'Request failed'
  }

  function handleShareChange(id, raw) {
    let val = raw === '' ? '' : raw.toString().replace(/[^0-9.-]/g, '')
    if (val !== '') {
      const n = Number(val)
      if (isNaN(n) || !isFinite(n)) val = ''
      else {
        if (n < 0) val = '0'
        else {
          val = Math.round(n * 100) / 100
          val = String(val)
        }
      }
    }
    setShares(prev => ({ ...prev, [id]: val }))
  }

  const computePayer = () => {
    const amt = Math.round((Number(amount) || 0) * 100) / 100
    if (splitType === 'PERCENTAGE') {
      const parts = selectedParts.map(id => Number(shares[id] || 0))
      const sumPct = Math.round(parts.reduce((s, v) => s + v, 0) * 100) / 100
      const payerPct = Math.round((100 - sumPct) * 100) / 100
      const payerAmt = Math.round(((payerPct / 100) * amt) * 100) / 100
      return { payerPct, payerAmt }
    } else if (splitType === 'CUSTOM') {
      const partsAmt = selectedParts.map(id => Math.round((Number(shares[id] || 0)) * 100) / 100)
      const sumNon = Math.round(partsAmt.reduce((s, v) => s + v, 0) * 100) / 100
      const payerAmt = Math.round((amt - sumNon) * 100) / 100
      return { payerPct: null, payerAmt }
    } else { // EQUAL
      const totalPeople = selectedParts.length + (includePayer ? 1 : 0)
      if (totalPeople <= 0) return { payerPct: null, payerAmt: amt }
      const per = Math.round((amt / totalPeople) * 100) / 100
      const sumNon = Math.round((per * selectedParts.length) * 100) / 100
      const payerAmt = Math.round((amt - sumNon) * 100) / 100
      const payerPct = Math.round(((payerAmt / (amt || 1)) * 100) * 100) / 100
      return { payerPct, payerAmt }
    }
  }

  function validateAndBuildParticipants() {
    const amt = Math.round((Number(amount) || 0) * 100) / 100
    if (amt <= 0) { toast.error('Amount must be greater than 0'); return null }

    const nonPayerCount = selectedParts.length
    const totalPeople = nonPayerCount + (includePayer ? 1 : 0)

    // If no non-payer selected: payer covers all (we'll represent that as empty array here,
    // and submit() will include payer explicitly if backend expects full participants).
    if (nonPayerCount === 0) return []

    if (splitType === 'EQUAL') {
      const per = Math.round((amt / totalPeople) * 100) / 100
      const parts = selectedParts.map(id => ({ userId: id, share: per }))
      const sumNon = Math.round(parts.reduce((s, p) => s + (Number(p.share) || 0), 0) * 100) / 100
      if (!includePayer) {
        const diff = Math.round((amt - sumNon) * 100) / 100
        if (Math.abs(diff) > 0.001 && parts.length > 0) {
          parts[parts.length - 1].share = Math.round((parts[parts.length - 1].share + diff) * 100) / 100
        }
      } else {
        if (sumNon > amt + 0.01) { toast.error('Calculated participant share exceeds total amount'); return null }
      }
      return parts
    }

    if (splitType === 'PERCENTAGE') {
      const parts = selectedParts.map(id => {
        const raw = shares[id]
        const v = Number(raw || 0)
        return { userId: id, share: Math.round(v * 100) / 100 }
      })

      const sumPct = Math.round(parts.reduce((s, p) => s + (Number(p.share) || 0), 0) * 100) / 100

      if (sumPct > 100 + 0.01) {
        toast.error(`Percentages exceed 100 (current ${sumPct})`)
        return null
      }

      if (!includePayer && Math.abs(sumPct - 100) > 0.01) {
        toast.error(`For PERCENTAGE split, participants share must sum to 100 when payer is excluded. Current ${sumPct}`)
        return null
      }

      const allZero = parts.every(p => (Number(p.share) || 0) === 0)
      if (allZero) {
        const perAll = Math.round((100 / totalPeople) * 100) / 100
        return selectedParts.map(id => ({ userId: id, share: perAll }))
      }

      return parts
    }

    if (splitType === 'CUSTOM') {
      const parts = selectedParts.map(id => ({ userId: id, share: Math.round((Number(shares[id] || 0)) * 100) / 100 }))
      const sumAmt = Math.round(parts.reduce((s, p) => s + (Number(p.share) || 0), 0) * 100) / 100
      if (includePayer) {
        if (sumAmt > amt + 0.01) { toast.error(`Participant amounts exceed total (${sumAmt})`); return null }
        return parts
      } else {
        if (Math.abs(sumAmt - amt) > 0.01) { toast.error(`Custom shares must sum to amount (${amt}). Current ${sumAmt}`); return null }
        return parts
      }
    }

    return null
  }

  async function submit(e) {
    e.preventDefault()
    
    const groupId = group && (group._id || group.id)
    if (!title || !amount || !groupId || !paidBy) {
      return toast.error('Please fill title, amount, and paid by')
    }

    const participants = validateAndBuildParticipants()
    if (participants === null) return

    // prepare payload participants; ensure numbers not strings
    const payloadParticipants = participants.map(p => ({ userId: p.userId, share: Number(p.share || 0) }))

    const amt = Math.round((Number(amount) || 0) * 100) / 100

    // If there were no non-payer participants, include payer as sole participant (full amount)
    if (payloadParticipants.length === 0) {
      if (splitType === 'PERCENTAGE') {
        payloadParticipants.push({ userId: paidBy, share: 100 })
      } else {
        payloadParticipants.push({ userId: paidBy, share: amt })
      }
    } else {
      // include payer entry for CUSTOM or PERCENTAGE so backend sees full allocation
      if (splitType === 'CUSTOM') {
        const sumNon = Math.round(payloadParticipants.reduce((s, p) => s + (Number(p.share) || 0), 0) * 100) / 100
        const payerAmt = Math.round((amt - sumNon) * 100) / 100
        if (payerAmt < -0.001) { toast.error('Participant amounts exceed total'); return }
        payloadParticipants.push({ userId: paidBy, share: Number(payerAmt) })
      } else if (splitType === 'PERCENTAGE') {
        const sumPct = Math.round(payloadParticipants.reduce((s, p) => s + (Number(p.share) || 0), 0) * 100) / 100
        const payerPct = Math.round((100 - sumPct) * 100) / 100
        if (payerPct < -0.001) { toast.error('Percentages exceed 100'); return }
        payloadParticipants.push({ userId: paidBy, share: Number(payerPct) })
      } else if (splitType === 'EQUAL') {
        // ensure payer included for backend compatibility (equal split -> compute shares)
        const totalPeople = selectedParts.length + (includePayer ? 1 : 0)
        const per = Math.round((amt / totalPeople) * 100) / 100
        // replace existing shares with per (ensures numeric)
        const recalculated = selectedParts.map(id => ({ userId: id, share: Number(per) }))
        // compute sumNon then payer remainder
        const sumNon = Math.round(recalculated.reduce((s, p) => s + (Number(p.share) || 0), 0) * 100) / 100
        const payerAmt = Math.round((amt - sumNon) * 100) / 100
        payloadParticipants.length = 0
        recalculated.forEach(r => payloadParticipants.push(r))
        payloadParticipants.push({ userId: paidBy, share: Number(payerAmt) })
      }
    }

    setLoading(true)
    try {
      const payload = {
        title,
        amount: amt,
        groupId,
        paidBy,
        splitType,
        participants: payloadParticipants
      }
      await expenses.add(payload)
      toast.success('Expense added')
      if (typeof onAdded === 'function') onAdded()
      // reset
      setTitle(''); setAmount(''); setSelectedParts([]); setShares({}); setPaidBy(memberIds[0] || '')
    } catch (err) {
      console.error(err)
      toast.error(extractErr(err))
    } finally {
      setLoading(false)
    }
  }

  const { payerPct, payerAmt } = computePayer()

  const renderShareInputs = () => {
    if (!selectedParts.length) return <div className="alert alert-info">No participants selected — payer covers full amount.</div>

    const payerLine = (
      <div className="mb-2">
        <strong>Payer (computed):</strong>&nbsp;
        {splitType === 'PERCENTAGE' ? `${payerPct} %` : `${payerAmt != null ? payerAmt.toFixed(2) : '-'}`}
        {splitType === 'PERCENTAGE' ? ` • ${payerAmt != null ? payerAmt.toFixed(2) : '-'}` : ''}
      </div>
    )

    if (splitType === 'EQUAL') {
      return (
        <div className="mb-3">
          <div className="alert alert-info">Equal split: shares computed automatically. Payer included in split.</div>
          {payerLine}
        </div>
      )
    }

    return (
      <div className="mb-3">
        <label className="form-label">{splitType === 'PERCENTAGE' ? 'Enter percentage (%) for each participant' : 'Enter amount for each participant'}</label>
        {payerLine}
        <div>
          {selectedParts.map(id => (
            <div key={id} className="d-flex align-items-center mb-2">
              <div style={{ minWidth: 160 }}>
                {group?.members?.find(m => getId(m) === id) ? getLabel(group.members.find(m => getId(m) === id)) : id}
              </div>
              <input
                className="form-control form-control-sm ms-2"
                style={{ maxWidth: 160 }}
                value={shares[id] === undefined ? '' : shares[id]}
                onChange={e => handleShareChange(id, e.target.value)}
                placeholder={splitType === 'PERCENTAGE' ? 'e.g. 50' : 'e.g. 200.00'}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card p-3 mb-3">
      <h5>Add Expense</h5>
      <form onSubmit={submit}>
        <div className="mb-2">
          <input className="form-control" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>

        <div className="mb-2">
          <input className="form-control" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required type="number" step="0.01" />
        </div>

        <div className="mb-2">
          <label className="form-label">Split Type</label>
          <select className="form-select" value={splitType} onChange={e => setSplitType(e.target.value)}>
            <option value="EQUAL">Equal</option>
            <option value="PERCENTAGE">Percentage</option>
            <option value="CUSTOM">Custom (exact amounts)</option>
          </select>
        </div>

        <div className="mb-2 d-flex align-items-center" style={{ gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">Paid By</label>
            <select className="form-select" value={paidBy} onChange={e => setPaidBy(e.target.value)} required>
              <option value="">Select</option>
              {group?.members?.map(m => {
                const id = getId(m)
                const label = getLabel(m)
                return <option key={id} value={id}>{label}{String(id) === String(memberIds[0]) ? ' (You)' : ''}</option>
              })}
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Participants (who share) — payer included automatically</label>
          <div className="d-flex flex-wrap">
            {group?.members?.map(m => {
              const id = getId(m)
              const isPayer = String(id) === String(paidBy)
              return (
                <div key={id} className="me-2 mb-2">
                  <button type="button"
                    className={`btn btn-outline-secondary btn-sm ${selectedParts.includes(id) ? 'active' : ''}`}
                    onClick={() => togglePart(id)}
                    disabled={isPayer}
                    title={isPayer ? 'Payer is included automatically' : ''}
                    style={isPayer ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                  >
                    {getLabel(m)}{isPayer ? ' (Payer)' : ''}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {renderShareInputs()}

        <button className="btn btn-primary" disabled={loading}>
          {loading ? <div className="spinner-border spinner-border-sm"></div> : 'Add'}
        </button>
      </form>
    </div>
  )
}
