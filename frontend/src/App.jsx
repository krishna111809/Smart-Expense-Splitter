import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import CreateGroup from './pages/CreateGroup'
import GroupDetails from './pages/GroupDetails'
import ProtectedRoute from './components/ProtectedRoute'
import { ToastContainer } from 'react-toastify'

export default function App(){
  return (
    <div>
      <Navbar />
      <ToastContainer />
      <Routes>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create-group" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
        <Route path="/groups/:id" element={<ProtectedRoute><GroupDetails /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  )
}