import { useState } from "react"
import { Link } from "react-router-dom"
import { Video, Mic, Users, Globe, X } from "lucide-react"

const RippleButton = ({ to, children }) => {
  const [ripple, setRipple] = useState({ x: -1, y: -1, show: false })

  const handleClick = (e) => {
    const rect = e.target.getBoundingClientRect()
    setRipple({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      show: true,
    })
    setTimeout(() => setRipple({ x: -1, y: -1, show: false }), 500)
  }

  return (
    <Link
      to={to}
      className="bg-white/20 backdrop-blur-lg px-8 py-4 rounded-xl text-white text-2xl font-semibold hover:bg-white/30 transition-all flex items-center relative overflow-hidden group"
      onClick={handleClick}
    >
      {children}
      {ripple.show && (
        <span
          className="absolute bg-white/30 rounded-full animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
      <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
    </Link>
  )
}

const ComingSoonPopup = ({ isOpen, onClose, title }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <p className="text-gray-600">This feature is coming soon! Stay tuned for updates.</p>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [popupOpen, setPopupOpen] = useState(false)
  const [popupTitle, setPopupTitle] = useState("")

  const openPopup = (title) => {
    setPopupTitle(title)
    setPopupOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex flex-col items-center justify-between p-8">
      <header className="w-full flex justify-between items-center">
        <div className="text-white text-2xl font-bold">Wavelink Connect</div>
        <nav>
          <button onClick={() => openPopup("About")} className="text-white hover:text-blue-200 mr-4">
            About
          </button>
          <button onClick={() => openPopup("Contact")} className="text-white hover:text-blue-200">
            Contact
          </button>
        </nav>
      </header>

      <main className="flex flex-col items-center justify-center flex-grow text-center">
        <h1 className="text-6xl text-white font-bold mb-8 animate-pulse">Wavelink Connect</h1>
        <p className="text-xl text-white mb-8 max-w-2xl">
          Experience seamless communication with our cutting-edge WebRTC platform. Connect instantly through
          high-quality voice and video calls.
        </p>
        <div className="flex gap-8">
          <RippleButton to="/join/voice">
            <Mic className="mr-2" /> Voice Call
          </RippleButton>
          <RippleButton to="/join/video">
            <Video className="mr-2" /> Video Call
          </RippleButton>
        </div>
      </main>

      <footer className="w-full flex justify-center items-center mt-12">
        <div className="flex space-x-12 text-white">
          <div className="flex flex-col items-center">
            <Users size={24} />
            <p className="mt-2">1M+ Users</p>
          </div>
          <div className="flex flex-col items-center">
            <Globe size={24} />
            <p className="mt-2">Global Reach</p>
          </div>
        </div>
      </footer>

      <ComingSoonPopup isOpen={popupOpen} onClose={() => setPopupOpen(false)} title={popupTitle} />
    </div>
  )
}

