import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Video, Mic, ArrowRight } from "lucide-react"

export default function LobbyPage() {
  const [userName, setUserName] = useState("")
  const [lobbyId, setLobbyId] = useState("")
  const { type } = useParams()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!userName.trim() || !lobbyId.trim()) return

    sessionStorage.setItem("userName", userName.trim())
    navigate(`/${type}/${lobbyId.trim()}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-white flex items-center justify-center">
          {type === "voice" ? <Mic className="mr-2" /> : <Video className="mr-2" />}
          Join {type.charAt(0).toUpperCase() + type.slice(1)} Room
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white mb-2 font-medium">Your Name:</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-white placeholder-white/50"
              placeholder="Enter your name"
              required
              minLength={2}
            />
          </div>

          <div>
            <label className="block text-white mb-2 font-medium">Room ID:</label>
            <input
              type="text"
              value={lobbyId}
              onChange={(e) => setLobbyId(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-white placeholder-white/50"
              placeholder="Enter room ID"
              required
              minLength={2}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-white text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 font-semibold flex items-center justify-center"
          >
            Join Room <ArrowRight className="ml-2" />
          </button>
        </form>
      </div>
    </div>
  )
}

