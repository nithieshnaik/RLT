import React from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Setting from './pages/Setting'
import Report from './pages/Report'
import AgentDetails from './pages/CallDetails.jsx'
import CallTranslate from './pages/CallTranslate'
import ProtectedRoute from './components/ProtectedRoute.jsx'


const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected routes */}
          {/* <Route element={<ProtectedRoute />}> */}
            <Route path="/home" element={<Home />} />
            <Route path="/setting" element={<Setting />} />
            <Route path="/report" element={<Report />} /> 
            <Route path="/agentdetails" element={<AgentDetails />} />
            <Route path="/calltranslate" element={<CallTranslate />} />
          {/* </Route> */}
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App