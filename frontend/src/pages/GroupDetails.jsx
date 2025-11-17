// src/pages/GroupDetails.jsx
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { groups, expenses as expensesApi } from '../api'
import Spinner from '../components/Spinner'
import AddExpense from './AddExpense'
import AddMemberForm from '../components/AddMemberForm'

export default function GroupDetails() {
  const { id } = useParams()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expenses, setExpenses] = useState([])

  // ---------------------------
  // Helpers: member lookups & labels
  // ---------------------------
  function findMemberById(g, uid) {
    if (!g || !Array.isArray(g.members)) return null
    return g.members.find(m => {
      const mid = (typeof m === 'string')
        ? m
        : (m.userId ? (m.userId._id || m.userId.id || m.userId) : (m._id || m.id || null))
      return mid && String(mid) === String(uid)
    }) || null
  }

  function getOwnerLabel(group) {
    if (!group?.owner) return "Unknown owner"

    const ownerId = String(
      group.owner._id || group.owner.id || group.owner || ""
    )

    // find owner in members
    const ownerMember = group.members?.find(m => {
      const mid = (typeof m === "string")
        ? m
        : (m.userId?._id || m.userId?.id || m.userId)
          || m._id || m.id
      return String(mid) === ownerId
    })

    // If viewer is owner
    const myId = localStorage.getItem("ses_user_id") || ""
    if (myId && ownerId === myId) return "You (Owner)"

    // If member found, show their name/email
    if (ownerMember) {
      return (ownerMember.userId?.name ||
              ownerMember.displayName ||
              ownerMember.userId?.email ||
              ownerMember.name ||
              ownerMember.email ||
              "Owner")
    }

    return "Owner"
  }

  function labelForUserId(g, uid) {
    if (!uid) return 'Unknown user'
    const member = findMemberById(g, uid)
    if (!member) return 'Unknown user'

    if (member.displayName) return member.displayName

    if (member.userId && typeof member.userId === 'object') {
      return member.userId.name || member.userId.email || 'Unknown user'
    }

    if (member.name || member.email) return member.name || member.email

    return 'Unknown user'
  }

  // ---------------------------
  // Data fetch / refresh
  // ---------------------------

  // ...existing code...

  async function refresh(isMounted = () => true) {
    setLoading(true)
    try {
      const [gRes, eRes] = await Promise.all([
        groups.get(id),
        expensesApi.list({ groupId: id })
      ])
      // Check if component is still mounted before state updates
      if (!isMounted()) return
      
      const g = gRes.data?.group || gRes.data || null
      const es = eRes.data?.expenses || eRes.data || []
      setGroup(g)
      setExpenses(es)
    } catch (err) {
      console.error('fetch group/details err', err)
      if (isMounted()) {
        setGroup(null)
        setExpenses([])
      }
    } finally {
      if (isMounted()) setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    refresh()
    return () => { mounted = false }
  }, [id])

  // ---------------------------
  // Format helpers used in render
  // ---------------------------
  const fmt = (n) => {
    if (n == null || isNaN(n)) return '-'
    return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const pctFor = (expense, share) => {
    const amt = Number(expense?.amount) || 0
    if (amt === 0) return 0
    if (expense.splitType === 'PERCENTAGE') {
      return Number(share) || 0
    }
    return Math.round(((Number(share) || 0) / amt) * 10000) / 100
  }

  const amtFor = (expense, share) => {
    const amt = Number(expense?.amount) || 0
    if (expense.splitType === 'PERCENTAGE') {
      return Math.round((((Number(share) || 0) / 100) * amt) * 100) / 100
    }
    return Math.round((Number(share) || 0) * 100) / 100
  }

  const EPS = 0.01

  // ---------------------------
  // Render
  // ---------------------------
  if (loading) return <Spinner />

  return (
    <div className="container mt-4">
      <div className="card mb-3 p-3">
        <h4>{group?.name || 'Group'}</h4>
        <p><strong>Owner:</strong> {getOwnerLabel(group)}</p>
        <p>
          Members:&nbsp;
          {Array.isArray(group?.members) && group.members.length > 0
            ? group.members.map(m => {
                const mid = (typeof m === 'string') ? m : (m.userId ? (m.userId._id || m.userId.id || m.userId) : (m._id || m.id || ''))
                return labelForUserId(group, mid)
              }).join(', ')
            : 'No members'}
        </p>
        <p>{group?.description}</p>
      </div>

      {/* Add member by email (owner-only check optional) */}
      <AddMemberForm groupId={group?._id || group?.id} onAdded={refresh} />

      {/* Add expense (refresh parent on add) */}
      <AddExpense group={group} onAdded={refresh} />

      <div className="mt-4">
        <h5>Expenses</h5>
        {expenses.length === 0 && <div className="alert alert-info">No expenses yet</div>}
        {expenses.map(exp => {
          const participants = Array.isArray(exp.participants) ? exp.participants : []
          const amt = Math.round((Number(exp.amount) || 0) * 100) / 100

          // compute numeric totals for existing participants
          const totalAmtFromParticipants = participants.reduce((s, p) => {
            // p.share may be percentage or amount depending on splitType
            if (exp.splitType === 'PERCENTAGE') {
              return s + Math.round((((Number(p.share) || 0) / 100) * amt) * 100) / 100
            }
            return s + (Math.round((Number(p.share) || 0) * 100) / 100)
          }, 0)

          // compute total percent if needed
          const totalPctFromParticipants = participants.reduce((s, p) => s + (Number(p.share) || 0), 0)

          // build displayParticipants: start with backend participants (others)
          const displayParticipants = participants.map(p => {
            const uid = (p.userId && (p.userId._id || p.userId.id || p.userId)) || p.userId || p
            return { uid, rawShare: p.share } // rawShare is either % or amount depending on splitType
          })

          // add payer entry if missing
          const payerId = (exp.paidBy && (exp.paidBy._id || exp.paidBy.id || exp.paidBy)) || exp.paidBy || exp.paidById
          const payerPresent = displayParticipants.some(dp => String(dp.uid) === String(payerId))

          if (!payerPresent) {
            if (exp.splitType === 'PERCENTAGE') {
              // compute payer percent as remainder to 100
              const payerPct = Math.round(((100 - (totalPctFromParticipants || 0)) * 100)) / 100
              displayParticipants.unshift({ uid: payerId, rawShare: payerPct, isPayer: true })
            } else {
              // amount split: payer covers remaining amount = amt - sum(other amounts)
              const payerAmt = Math.round((amt - totalAmtFromParticipants) * 100) / 100
              displayParticipants.unshift({ uid: payerId, rawShare: payerAmt, isPayer: true })
            }
          } else {
            // If payer is present (rare), mark it so UI can annotate
            displayParticipants.forEach(dp => { if (String(dp.uid) === String(payerId)) dp.isPayer = true })
          }

          // recompute totals for display validation
          const totalAmtDisplay = displayParticipants.reduce((s, dp) => {
            if (exp.splitType === 'PERCENTAGE') {
              // convert percentage to amount for display total
              return s + Math.round((((Number(dp.rawShare) || 0) / 100) * amt) * 100) / 100
            }
            return s + (Math.round((Number(dp.rawShare) || 0) * 100) / 100)
          }, 0)

          return (
            <div className="card mb-3" key={exp._id}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">{exp.title}</h6>
                    <small className="text-muted">
                      Paid by: {labelForUserId(group, payerId)}{' • '}Date: {exp.date ? new Date(exp.date).toLocaleString() : '-'}
                    </small>
                  </div>
                  <div>
                    <strong>{fmt(exp.amount)}</strong>
                    <div className="text-muted" style={{ fontSize: 12 }}>{exp.category || 'General'}</div>
                  </div>
                </div>

                <hr />

                <div>
                  <div className="mb-2"><strong>Split Type:</strong> {exp.splitType || 'CUSTOM'}</div>
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Participant</th>
                        <th className="text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayParticipants.map((dp, idx) => {
                        const label = labelForUserId(group, dp.uid)
                        const shareAmt = exp.splitType === 'PERCENTAGE'
                          ? Math.round((((Number(dp.rawShare) || 0) / 100) * amt) * 100) / 100
                          : Math.round((Number(dp.rawShare) || 0) * 100) / 100

                        // optionally compute pct for display in parens
                        const pct = exp.splitType === 'PERCENTAGE' ? (Number(dp.rawShare) || 0) : null

                        return (
                          <tr key={idx}>
                            <td>{label}{dp.isPayer ? ' (Payer)' : ''}</td>
                            <td className="text-end">
                              {fmt(shareAmt)}
                              {pct !== null ? ` (${fmt(pct)} %)` : ''}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th>Total</th>
                        <th className="text-end">
                          {fmt(totalAmtDisplay)}
                        </th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
