import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { initializeData } from './lib/storage'
import OwnerPanel from './pages/OwnerPanel'
import AdminPanel from './pages/AdminPanel'
import UserPanel from './pages/UserPanel'

function App() {
  useEffect(() => {
    initializeData()
  }, [])

  return (
    <Routes>
      <Route path="/" element={<OwnerPanel />} />
      <Route path="/admin/:adminId" element={<AdminPanel />} />
      <Route path="/s/:adminId/:linkSlug" element={<UserPanel />} />
    </Routes>
  )
}

export default App
