export default function CallControls({
    micMuted,
    cameraOff,
    onToggleMic,
    onToggleCamera,
    onScreenShare,
    isScreenSharing,
  }) {
    return (
      <div className="bg-white p-4 flex justify-center gap-4">
        <button
          onClick={onToggleMic}
          className={`p-4 rounded-full ${
            micMuted ? "bg-red-500" : "bg-blue-500"
          } text-white`}
        >
          {micMuted ? "Unmute" : "Mute"}
        </button>
  
        {onToggleCamera && (
          <button
            onClick={onToggleCamera}
            className={`p-4 rounded-full ${
              cameraOff ? "bg-red-500" : "bg-blue-500"
            } text-white`}
          >
            {cameraOff ? "Camera On" : "Camera Off"}
          </button>
        )}
  
        {onScreenShare && (
          <button
            onClick={onScreenShare}
            className={`p-4 rounded-full ${
              isScreenSharing ? "bg-red-500" : "bg-blue-500"
            } text-white`}
          >
            {isScreenSharing ? "Stop Share" : "Share Screen"}
          </button>
        )}
      </div>
    );
  }
  