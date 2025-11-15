import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { groups } from '../api'
import Spinner from '../components/Spinner'
import AddExpense from './AddExpense'

export default function GroupDetails(){
  const { id } = useParams()
  const [group,setGroup]=useState(null)
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    let mounted = true
    groups.get(id)
      .then(r=>{
        const g = r.data.group || r.data
        if(mounted) { setGroup(g); setLoading(false); console.log('Group fetched:', g) }
      })
      .catch(e=>{ console.error(e); setLoading(false) })
    return ()=> mounted = false
  },[id])

  // universal member getters (supports many shapes)
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

  return (
    <div className="container mt-4">
      {loading ? <Spinner /> : (
        <>
          <div className="card mb-3 p-3">
            <h4>{group?.name || 'Group'}</h4>
            <p>
              Members:&nbsp;
              {Array.isArray(group?.members) && group.members.length > 0
                ? group.members.map(m => getLabel(m)).join(', ')
                : 'No members'}
            </p>
            <p>{group?.description}</p>
          </div>

          <AddExpense group={group} />
        </>
      )}
    </div>
  )
}
