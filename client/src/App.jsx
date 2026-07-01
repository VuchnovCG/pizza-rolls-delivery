import { useState, useEffect } from 'react'
import './App.css'
import Shop from './pages/Shop'
import Admin from './pages/Admin'
import ChatWidget from './components/ChatWidget'
import { setBackButton } from './telegram.js'

export default function App() {
  const [page, setPage] = useState('shop')

  // Telegram back button: admin → shop, shop → close
  useEffect(() => {
    if (page === 'admin') {
      setBackButton(true, () => setPage('shop'))
    } else {
      setBackButton(false)
    }
  }, [page])

  if (page === 'admin') {
    return <Admin onNavigate={setPage} />
  }

  return (
    <>
      <Shop onNavigate={setPage} />
      <ChatWidget />
    </>
  )
}
