import React from 'react'
import { Navigate } from 'react-router-dom'

export default function GuestRoute({ children }) {
  try {
    const token = localStorage.getItem('ses_token')
    if (token) {
      return <Navigate to="/" replace />
    }
  } catch (e) {
    // localStorage may throw in some environments — fall back to showing page.
  }
  return children
}
