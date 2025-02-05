import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import AgoraRTC from "agora-rtc-sdk-ng"
import ChatPanel from "../components/ChatPanel"
import { MicrophoneIcon, SpeakerWaveIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid"

const VoiceRoom = () => {
  const { lobbyId } = useParams()
  const [userName] = useState(() => sessionStorage.getItem("userName") || "Guest")
  const appId = import.meta.env.VITE_AGORA_APP_ID

  const agoraEngine = useRef(null)
  const [remoteUsers, setRemoteUsers] = useState([])
  const localAudioTrack = useRef(null)
  const [micMuted, setMicMuted] = useState(false)
  const [activeSpeakers, setActiveSpeakers] = useState(new Set())
  const [isChatOpen, setIsChatOpen] = useState(false)

  useEffect(() => {
    if (!appId) return

    const initAgora = async () => {
      try {
        agoraEngine.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
        await agoraEngine.current.join(appId, lobbyId, null, userName)

        localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack()
        await agoraEngine.current.publish(localAudioTrack.current)
        console.log("Local audio track published.")

        agoraEngine.current.on("user-published", async (user, mediaType) => {
          await agoraEngine.current.subscribe(user, mediaType)
          setRemoteUsers((prev) => [...prev, user])

          if (mediaType === "audio" && user.audioTrack) {
            user.audioTrack.play()
          }
        })

        agoraEngine.current.on("user-left", (user) => {
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid))
        })

        agoraEngine.current.enableAudioVolumeIndicator()
        agoraEngine.current.on("volume-indicator", (volumes) => {
          const activeUsers = new Set(volumes.filter((v) => v.level > 5).map((v) => v.uid))
          setActiveSpeakers(activeUsers)
        })
      } catch (error) {
        console.error("Error initializing Agora RTC:", error)
      }
    }

    initAgora()

    return () => {
      localAudioTrack.current?.close()
      agoraEngine.current?.leave()
    }
  }, [lobbyId, userName]) // Removed appId from dependencies

  const toggleMic = async () => {
    if (localAudioTrack.current) {
      micMuted ? await localAudioTrack.current.setMuted(false) : await localAudioTrack.current.setMuted(true)
      setMicMuted(!micMuted)
    }
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-800 p-4 shadow-lg">
          <h1 className="text-2xl font-bold">Voice Room: {lobbyId}</h1>
          <p className="text-gray-400">Joined as: {userName}</p>
        </header>

        <main className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {remoteUsers.map((user) => (
              <div
                key={user.uid}
                className={`p-4 rounded-lg ${activeSpeakers.has(user.uid) ? "bg-green-600" : "bg-gray-700"} transition-colors duration-300`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{user.uid}</span>
                  <SpeakerWaveIcon
                    className={`h-6 w-6 ${activeSpeakers.has(user.uid) ? "text-green-300" : "text-gray-400"}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </main>

        <div className="bg-gray-800 p-4 flex justify-center gap-4">
          <button
            onClick={toggleMic}
            className={`p-4 rounded-full ${micMuted ? "bg-red-500" : "bg-blue-500"} text-white transition-colors hover:opacity-80`}
          >
            <MicrophoneIcon className="h-6 w-6" />
          </button>
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="p-4 rounded-full bg-green-500 text-white transition-colors hover:opacity-80"
          >
            <ChatBubbleLeftRightIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {isChatOpen && (
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
          <ChatPanel lobbyId={lobbyId} userName={userName} />
        </div>
      )}
    </div>
  )
}

export default VoiceRoom

