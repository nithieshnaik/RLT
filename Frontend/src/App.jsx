import React from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Setting from './pages/Setting'
import Report from './pages/Report'
import AgentDetails from './pages/AgentDetails'
import CallTranslate from './pages/CallTranslate'



const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/report" element={<Report />} /> 
          <Route path="/agentdetails" element={<AgentDetails />} />
          <Route path="/calltranslate" element={<CallTranslate />} />
          
        </Routes>
      </BrowserRouter>
      {/* <LeftSidePane /> */}
    </>
  )
}

export default App