import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import AgoraRTC from "agora-rtc-sdk-ng"
import ChatPanel from "../components/ChatPanel"
import {
  MicrophoneIcon,
  VideoCameraIcon,
  ComputerDesktopIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/solid"

const VideoRoom = () => {
  const { lobbyId } = useParams()
  const [userName] = useState(() => sessionStorage.getItem("userName") || "Guest")
  const appId = import.meta.env.VITE_AGORA_APP_ID

  // RTC State
  const [localVideoTrack, setLocalVideoTrack] = useState(null)
  const [localAudioTrack, setLocalAudioTrack] = useState(null)
  const [screenTrack, setScreenTrack] = useState(null)
  const [remoteUsers, setRemoteUsers] = useState([])
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [enlargedUser, setEnlargedUser] = useState(null)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const agoraEngine = useRef(null)
  const localVideoRef = useRef(null)

  // Play local video track when it changes
  useEffect(() => {
    if (localVideoTrack && localVideoRef.current) {
      localVideoTrack.play(localVideoRef.current)
    }
  }, [localVideoTrack])

  useEffect(() => {
    if (!appId) {
      console.error("Agora App ID is missing!")
      return
    }

    const initAgora = async () => {
      try {
        // Create the RTC client
        agoraEngine.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })

        // Set up event listeners for remote users
        agoraEngine.current.on("user-published", async (user, mediaType) => {
          await agoraEngine.current.subscribe(user, mediaType)

          // Update the remoteUsers state
          setRemoteUsers((prev) => {
            const existing = prev.find((u) => u.uid === user.uid)
            if (existing) {
              return prev.map((u) => (u.uid === user.uid ? user : u))
            }
            return [...prev, user]
          })

          if (mediaType === "audio") {
            user.audioTrack?.play()
          }
        })

        agoraEngine.current.on("user-unpublished", (user, mediaType) => {
          // Update remote user's track state
          setRemoteUsers((prev) =>
            prev.map((u) => {
              if (u.uid === user.uid) {
                if (mediaType === "video") {
                  return { ...u, videoTrack: null }
                }
                if (mediaType === "audio") {
                  return { ...u, audioTrack: null }
                }
              }
              return u
            }),
          )
        })

        agoraEngine.current.on("user-left", (user) => {
          // Remove the user from remoteUsers when they leave
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid))
        })

        // Join the RTC channel
        await agoraEngine.current.join(appId, lobbyId, null, userName)

        // Create and publish local tracks
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
        setLocalAudioTrack(audioTrack)
        setLocalVideoTrack(videoTrack)
        await agoraEngine.current.publish([audioTrack, videoTrack])
      } catch (error) {
        console.error("Error initializing Agora RTC:", error)
      }
    }

    initAgora()

    // Cleanup function
    return () => {
      localAudioTrack?.close()
      localVideoTrack?.close()
      screenTrack?.close()
      agoraEngine.current?.leave()
    }
  }, [appId, lobbyId])

  // Toggle microphone
  const toggleMic = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!isMuted)
      setIsMuted(!isMuted)
    }
  }

  // Toggle camera
  const toggleVideo = async () => {
    if (localVideoTrack) {
      if (isVideoOff) {
        // Turn video on
        const newVideoTrack = await AgoraRTC.createCameraVideoTrack()
        setLocalVideoTrack(newVideoTrack)
        await agoraEngine.current.publish(newVideoTrack)
        setIsVideoOff(false)
      } else {
        // Turn video off
        await agoraEngine.current.unpublish(localVideoTrack)
        localVideoTrack.close()
        setIsVideoOff(true)
      }
    }
  }

  // Toggle screen sharing
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenTrack = await AgoraRTC.createScreenVideoTrack({ optimizationMode: "detail" })
        await agoraEngine.current.unpublish(localVideoTrack)
        await agoraEngine.current.publish(screenTrack)
        if (localVideoRef.current) {
          localVideoTrack.stop()
          screenTrack.play(localVideoRef.current)
        }
        setScreenTrack(screenTrack)
        setIsScreenSharing(true)
      } catch (error) {
        console.error("Error sharing screen:", error)
      }
    } else {
      if (screenTrack) {
        await agoraEngine.current.unpublish(screenTrack)
        await agoraEngine.current.publish(localVideoTrack)
        if (localVideoRef.current) {
          screenTrack.stop()
          localVideoTrack.play(localVideoRef.current)
        }
        screenTrack.close()
        setScreenTrack(null)
        setIsScreenSharing(false)
      }
    }
  }

  // Enlarge remote video on click
  const enlargeUserVideo = (userId) => {
    setEnlargedUser(userId)
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-800 p-4 shadow-lg">
          <h1 className="text-2xl font-bold">Video Room: {lobbyId}</h1>
          <p className="text-gray-400">Joined as: {userName}</p>
        </header>

        <main className="flex-1 p-4 flex flex-wrap gap-4 justify-center items-center">
          {/* Local Video */}
          <div className="relative w-96 h-72 bg-gray-700 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105">
            <div
              ref={localVideoRef}
              className="w-full h-full object-cover"
              style={{ display: isVideoOff ? "none" : "block" }}
            />
            {isVideoOff && (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <VideoCameraIcon className="h-16 w-16" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-sm">You ({userName})</div>
          </div>

          {/* Remote Videos */}
          {remoteUsers.map((user) => (
            <div
              key={user.uid}
              className="relative w-96 h-72 bg-gray-700 rounded-lg overflow-hidden cursor-pointer shadow-lg transform transition-all duration-300 hover:scale-105"
              onClick={() => enlargeUserVideo(user.uid)}
            >
              {user.videoTrack ? (
                <div
                  className="w-full h-full object-cover"
                  ref={(el) => {
                    if (el && user.videoTrack) {
                      user.videoTrack.play(el)
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <VideoCameraIcon className="h-16 w-16" />
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-sm">
                {user.uid === userName ? "You" : `User ${user.uid}`}
              </div>
            </div>
          ))}
        </main>

        {/* Control Panel */}
        <div className="bg-gray-800 p-4 flex justify-center gap-4">
          <button
            onClick={toggleMic}
            className={`p-4 rounded-full ${isMuted ? "bg-red-500" : "bg-blue-500"} text-white transition-colors hover:opacity-80`}
          >
            <MicrophoneIcon className="h-6 w-6" />
          </button>
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full ${isVideoOff ? "bg-red-500" : "bg-blue-500"} text-white transition-colors hover:opacity-80`}
          >
            <VideoCameraIcon className="h-6 w-6" />
          </button>
          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full ${isScreenSharing ? "bg-red-500" : "bg-blue-500"} text-white transition-colors hover:opacity-80`}
          >
            <ComputerDesktopIcon className="h-6 w-6" />
          </button>
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="p-4 rounded-full bg-green-500 text-white transition-colors hover:opacity-80"
          >
            <ChatBubbleLeftRightIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Chat Panel */}
      {isChatOpen && (
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
          <ChatPanel lobbyId={lobbyId} userName={userName} />
        </div>
      )}

      {/* Enlarged Video Modal */}
      {enlargedUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setEnlargedUser(null)}
        >
          <div className="relative w-3/4 h-3/4 bg-gray-800 rounded-lg overflow-hidden">
            {remoteUsers.find((u) => u.uid === enlargedUser)?.videoTrack ? (
              <div
                className="w-full h-full"
                ref={(el) => {
                  const user = remoteUsers.find((u) => u.uid === enlargedUser)
                  if (el && user && user.videoTrack) {
                    user.videoTrack.play(el)
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <VideoCameraIcon className="h-32 w-32" />
              </div>
            )}
            <button
              className="absolute top-4 right-4 text-white bg-red-500 rounded-full p-2 hover:bg-red-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setEnlargedUser(null)
              }}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoRoom

