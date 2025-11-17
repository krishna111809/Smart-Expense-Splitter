import React, { useEffect, useState } from 'react'
import { groups } from '../api'
import Spinner from '../components/Spinner'
import { Link } from 'react-router-dom'

export default function Dashboard(){
  const [list,setList]=useState([])
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    let mounted=true
    groups.list().then(r=>{ if(mounted){ setList(r.data.groups || r.data || []); setLoading(false) }}).catch(e=>{setLoading(false)})
    return ()=> mounted=false
  },[])

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Your Groups</h3>
        <Link to="/create-group" className="btn btn-sm btn-primary">Create Group</Link>
      </div>
      {loading ? <Spinner /> : (
        <div className="row">
          {list.length===0 && <div className="alert alert-info">No groups yet</div>}
          {list.map(g=> (
            <div className="col-md-4" key={g._id || g.id}>
              <div className="card mb-3">
                <div className="card-body">
                  <h5>{g.name}</h5>
                  <p className="mb-1">Members: {Array.isArray(g.members) ? g.members.length : 0}</p>
                  <Link to={`/groups/${g._id || g.id}`} className="stretched-link"></Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}