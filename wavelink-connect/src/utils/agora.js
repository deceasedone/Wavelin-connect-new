import AgoraRTC from "agora-rtc-sdk-ng";

export const initializeAgora = async (appId, channelName) => {
  if (!appId) {
    throw new Error("Agora App ID is required");
  }

  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  try {
    await client.join(appId, channelName, null, null);
    console.log("Successfully joined channel:", channelName);
    return client;
  } catch (error) {
    console.error("Failed to join channel:", error);
    throw error;
  }
};

export const createLocalTracks = async (audioOnly = false) => {
  try {
    const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    if (audioOnly) {
      return [audioTrack];
    }
    const videoTrack = await AgoraRTC.createCameraVideoTrack();
    return [audioTrack, videoTrack];
  } catch (error) {
    console.error("Failed to create local tracks:", error);
    throw error;
  }
};

export const handleUserPublished = async (client, user, mediaType) => {
  try {
    await client.subscribe(user, mediaType);
    console.log("Subscribed to user:", user.uid, mediaType);
    return true;
  } catch (error) {
    console.error("Failed to subscribe to user:", error);
    return false;
  }
};