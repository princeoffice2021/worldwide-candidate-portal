import React, { useState } from 'react';
import { Mic, MicOff, Globe, AlertCircle } from 'lucide-react';
import { isSpeechSupported, SpeechController } from '../lib/speech';
import { VoiceLanguage } from '../types';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  fieldLabel?: string;
  className?: string;
  compact?: boolean;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  fieldLabel,
  className = '',
  compact = false,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [language, setLanguage] = useState<VoiceLanguage>('hi-IN'); // Default Hindi / Auto friendly
  const [showLangMenu, setShowLangMenu] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [controller, setController] = useState<SpeechController | null>(null);

  const isSupported = isSpeechSupported();

  const handleToggleListening = () => {
    setErrorMessage(null);

    if (!isSupported) {
      setErrorMessage('Voice recognition is not supported in this browser. Please type manually.');
      return;
    }

    if (isRecording && controller) {
      controller.stop();
      setIsRecording(false);
      return;
    }

    const speech = new SpeechController({
      language,
      onResult: (transcript, isFinal) => {
        if (transcript) {
          onTranscript(transcript);
        }
      },
      onError: (err) => {
        setErrorMessage(err);
        setIsRecording(false);
      },
      onEnd: () => {
        setIsRecording(false);
      },
    });

    setController(speech);
    const started = speech.start();
    if (started) {
      setIsRecording(true);
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Mic Button */}
      <button
        type="button"
        onClick={handleToggleListening}
        className={`inline-flex items-center space-x-1.5 transition rounded-lg font-medium shadow-xs ${
          isRecording
            ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
            : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200'
        } ${compact ? 'p-1.5 text-xs' : 'px-3 py-1.5 text-xs'}`}
        title={`Voice input using microphone ${fieldLabel ? `for ${fieldLabel}` : ''}`}
      >
        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-blue-600" />}
        {!compact && (
          <span>{isRecording ? 'Listening... Speak Now' : 'Voice Input (बोलकर लिखें)'}</span>
        )}
      </button>

      {/* Language Selector Trigger */}
      {!compact && (
        <button
          type="button"
          onClick={() => setShowLangMenu(!showLangMenu)}
          className="ml-1 p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg text-xs"
          title="Change Voice Language"
        >
          <Globe className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Language Menu Dropdown */}
      {showLangMenu && (
        <div className="absolute right-0 top-full mt-1 z-30 bg-white rounded-lg shadow-xl border border-slate-200 py-1 text-xs w-36">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
            Speech Language
          </div>
          <button
            type="button"
            onClick={() => { setLanguage('hi-IN'); setShowLangMenu(false); }}
            className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center justify-between ${
              language === 'hi-IN' ? 'font-bold text-blue-600' : 'text-slate-700'
            }`}
          >
            <span>🇮🇳 Hindi (हिंदी)</span>
          </button>
          <button
            type="button"
            onClick={() => { setLanguage('en-US'); setShowLangMenu(false); }}
            className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center justify-between ${
              language === 'en-US' ? 'font-bold text-blue-600' : 'text-slate-700'
            }`}
          >
            <span>🇬🇧 English</span>
          </button>
          <button
            type="button"
            onClick={() => { setLanguage('pa-IN'); setShowLangMenu(false); }}
            className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center justify-between ${
              language === 'pa-IN' ? 'font-bold text-blue-600' : 'text-slate-700'
            }`}
          >
            <span>🇮🇳 Punjabi (ਪੰਜਾਬੀ)</span>
          </button>
          <button
            type="button"
            onClick={() => { setLanguage('auto'); setShowLangMenu(false); }}
            className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center justify-between ${
              language === 'auto' ? 'font-bold text-blue-600' : 'text-slate-700'
            }`}
          >
            <span>🌐 Auto Detect</span>
          </button>
        </div>
      )}

      {/* Error Popup Notice */}
      {errorMessage && (
        <div className="absolute left-0 top-full mt-1.5 z-40 bg-red-50 border border-red-200 text-red-700 text-xs p-2 rounded-lg shadow-lg max-w-xs flex items-start space-x-1.5">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-[10px] font-bold text-red-800 underline mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
