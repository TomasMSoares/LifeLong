/**
 * Voice recording utilities
 * TODO: Implement Web Speech API or Whisper integration
 */

let recognition = null;
let transcript = '';

export async function startRecording() {
  // TODO: Implement Web Speech API
  // recognition = new window.webkitSpeechRecognition();
  // recognition.continuous = true;
  // recognition.onresult = (event) => {
  //   transcript = event.results[0][0].transcript;
  // };
  // recognition.start();

  console.log('Recording started (placeholder)');
  return Promise.resolve();
}

export async function stopRecording() {
  // TODO: Stop recording and return transcript
  // recognition?.stop();
  // return transcript;

  console.log('Recording stopped (placeholder)');
  return 'This is a placeholder transcript of what the user said.';
}
