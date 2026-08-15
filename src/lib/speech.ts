import { VoiceLanguage } from '../types';

export interface SpeechControllerOptions {
  language?: VoiceLanguage;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd?: () => void;
}

// Global declaration for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function isSpeechSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export class SpeechController {
  private recognition: any = null;
  private isListening = false;

  constructor(private options: SpeechControllerOptions) {
    if (!isSpeechSupported()) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    // Set recognition language
    const lang = options.language || 'auto';
    if (lang === 'hi-IN') {
      this.recognition.lang = 'hi-IN';
    } else if (lang === 'pa-IN') {
      this.recognition.lang = 'pa-IN';
    } else if (lang === 'en-US') {
      this.recognition.lang = 'en-US';
    } else {
      // Default auto: navigator language or fallback
      this.recognition.lang = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';
    }

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      if (text) {
        this.options.onResult(text, !!finalTranscript);
      }
    };

    this.recognition.onerror = (event: any) => {
      let msg = 'Speech recognition error.';
      if (event.error === 'not-allowed') {
        msg = 'Microphone permission denied. Please allow microphone access.';
      } else if (event.error === 'no-speech') {
        msg = 'No speech detected. Please speak into your microphone.';
      } else if (event.error === 'audio-capture') {
        msg = 'No microphone hardware found.';
      }
      this.isListening = false;
      this.options.onError(msg);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.options.onEnd) {
        this.options.onEnd();
      }
    };
  }

  public start(): boolean {
    if (!this.recognition) {
      this.options.onError('Speech recognition is not supported in this browser. You can type manually.');
      return false;
    }

    try {
      if (this.isListening) {
        this.recognition.stop();
      }
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (err: any) {
      this.options.onError('Could not start speech recognition: ' + (err.message || 'Error'));
      return false;
    }
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}
