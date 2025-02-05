import { useState, useEffect, useRef } from "react"
import { PaperAirplaneIcon } from "@heroicons/react/24/solid"

const ChatPanel = ({ lobbyId, userName }) => {
  // Use your websocket server URL here (or from env variables)
  const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:4000"

  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const ws = useRef(null)
  const reconnectInterval = useRef(null)

  // Helper to send a message via WebSocket
  const sendWebSocketMessage = (messageObj) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(messageObj))
    } else {
      console.error("WebSocket is not open. Unable to send message.")
    }
  }

  useEffect(() => {
    // Establish the WebSocket connection when component mounts
    const connectWebSocket = () => {
      // Append lobbyId and userName as query parameters if needed by your server
      ws.current = new WebSocket(`${WS_URL}?lobbyId=${lobbyId}&userName=${userName}`)

      ws.current.onopen = () => {
        console.log("WebSocket connection established.")
        if (reconnectInterval.current) {
          clearInterval(reconnectInterval.current)
          reconnectInterval.current = null
        }
      }

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          // Assume your server sends messages in the form:
          // { text, sender, timestamp }
          setMessages((prev) => [...prev, message])
        } catch (error) {
          console.error("Error parsing incoming message:", error)
        }
      }

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error)
      }

      ws.current.onclose = (event) => {
        console.warn("WebSocket closed. Reconnecting in 3 seconds...", event)
        // Try to reconnect every 3 seconds if connection is lost
        if (!reconnectInterval.current) {
          reconnectInterval.current = setInterval(() => {
            connectWebSocket()
          }, 3000)
        }
      }
    }

    connectWebSocket()

    // Cleanup on unmount
    return () => {
      if (reconnectInterval.current) clearInterval(reconnectInterval.current)
      if (ws.current) ws.current.close()
    }
  }, [lobbyId, userName])

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const messageObj = {
      text: newMessage,
      sender: userName,
      timestamp: new Date().toLocaleTimeString(),
      // You might want to include a type field or lobbyId if needed by your server
      lobbyId,
      type: "chat",
    }

    // Optimistic UI update
    setMessages((prev) => [...prev, messageObj])

    sendWebSocketMessage(messageObj)

    setNewMessage("")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold">Chat</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg ${msg.sender === userName ? "bg-blue-600 ml-auto" : "bg-gray-700"} max-w-[80%]`}
          >
            <div className="text-sm font-semibold">{msg.sender}</div>
            <div className="mt-1">{msg.text}</div>
            <div className="text-xs text-gray-400 mt-1">{msg.timestamp}</div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 bg-gray-700 text-white border-none p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
          >
            <PaperAirplaneIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatPanel

