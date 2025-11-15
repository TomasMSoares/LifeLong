/**
 * Voice recording utilities
 * TODO: Implement Web Speech API or Whisper integration
 */

let mediaRecorder = null;
let mediaStream = null;
let audioChunks = [];


/**
 * Starts the microphone recording.
 * Prompts the user for microphone permission if not already granted.
 * @returns {Promise<void>}
 */
export async function startRecording() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
  } catch (err) {
    console.error("Error accessing microphone: ", err);
    alert("Could not access microphone. Please ensure permissions are granted.");
    return;
  }

  mediaRecorder = new MediaRecorder(mediaStream);
  audioChunks = [];
  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };

  mediaRecorder.start();
  console.log("Recording started.");
}

/**
 * Stops the recording, cleans up the microphone stream, and returns the audio Blob.
 * @returns {Promise<Blob | null>} The recorded audio Blob, or null if recording wasn't active.
 */
export async function stopRecording() {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    console.warn("Recording was not active.");
    return null;
  }

  return new Promise((resolve) => {
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      mediaStream = null;
      mediaRecorder = null;
      audioChunks = [];

      console.log("Recording stopped. Audio Blob created: ", audioBlob);
      resolve(audioBlob);
    };

    mediaRecorder.stop();
  });
}
