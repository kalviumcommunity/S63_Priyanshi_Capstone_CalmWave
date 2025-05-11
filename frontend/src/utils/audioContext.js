// audioContext.js - Global audio management utility

// Create a singleton for managing audio across the application
class AudioManager {
  constructor() {
    // Store the currently playing audio elements
    this.activeAudios = [];
    
    // Add event listener to stop all audio when navigating away
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.stopAllAudio());
    }
    
    console.log('AudioManager initialized');
  }
  
  /**
   * Play an audio file while stopping any currently playing audio
   * @param {string} src - The source URL of the audio file
   * @param {Object} options - Options for audio playback
   * @param {boolean} options.loop - Whether the audio should loop (default: false)
   * @param {function} options.onPlay - Callback function when audio starts playing
   * @param {function} options.onError - Callback function when audio fails to play
   * @returns {HTMLAudioElement} - The audio element that was created
   */
  playAudio(src, options = {}) {
    console.log(`Playing audio: ${src}`);
    
    // Stop all currently playing audio
    this.stopAllAudio();
    
    // Create new audio element
    const audio = new Audio(src);
    
    // Set options
    audio.loop = options.loop || false;
    
    // Add to active audios list
    this.activeAudios.push(audio);
    
    // Record start time for session tracking if needed
    audio.startTime = new Date();
    
    // Play the audio with error handling
    audio.play()
      .then(() => {
        console.log(`Successfully playing: ${src}`);
        if (options.onPlay) options.onPlay(audio);
      })
      .catch(error => {
        console.error(`Error playing audio ${src}:`, error);
        if (options.onError) options.onError(error);
        
        // Remove from active audios if it failed to play
        this.activeAudios = this.activeAudios.filter(a => a !== audio);
      });
    
    return audio;
  }
  
  /**
   * Pause a specific audio element
   * @param {HTMLAudioElement} audio - The audio element to pause
   * @param {function} onPause - Callback function when audio is paused
   */
  pauseAudio(audio, onPause) {
    if (!audio) return;
    
    console.log('Pausing audio');
    audio.pause();
    
    // Call the onPause callback if provided
    if (onPause) onPause(audio);
    
    // Remove from active audios
    this.activeAudios = this.activeAudios.filter(a => a !== audio);
  }
  
  /**
   * Stop all currently playing audio
   */
  stopAllAudio() {
    console.log(`Stopping all audio (${this.activeAudios.length} active)`);
    
    this.activeAudios.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    // Clear the active audios list
    this.activeAudios = [];
  }
  
  /**
   * Get the duration of a play session
   * @param {HTMLAudioElement} audio - The audio element
   * @returns {number} - Duration in seconds or 0 if no start time
   */
  getSessionDuration(audio) {
    if (!audio || !audio.startTime) return 0;
    return Math.floor((new Date() - audio.startTime) / 1000);
  }
}

// Create a singleton instance
const audioManager = new AudioManager();

// Export the methods from the singleton
export const playAudio = (src, options) => audioManager.playAudio(src, options);
export const pauseAudio = (audio, onPause) => audioManager.pauseAudio(audio, onPause);
export const stopAllAudio = () => audioManager.stopAllAudio();
export const getSessionDuration = (audio) => audioManager.getSessionDuration(audio);

export default {
  playAudio,
  pauseAudio,
  stopAllAudio,
  getSessionDuration
};