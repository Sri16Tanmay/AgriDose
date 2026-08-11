import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Smartphone } from 'lucide-react';

interface VoiceReaderProps {
  textToSpeak?: string;
  enabled: boolean;
  onToggle: () => void;
  highContrast?: boolean;
}

export const unlockSpeechSynthesis = () => {
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.resume();
    // Warm up getVoices()
    window.speechSynthesis.getVoices();
    // Silent utterance to unlock audio context in strict browsers
    const silent = new SpeechSynthesisUtterance('');
    silent.volume = 0;
    window.speechSynthesis.speak(silent);
  } catch (e) {
    // Ignore error
  }
};

export const getOptimalVoice = (lang: string): SpeechSynthesisVoice | null => {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const targetLang = lang.toLowerCase();
  
  // 1. Exact match (e.g. hi-IN or en-IN or en-US)
  let voice = voices.find(
    (v) => v.lang.toLowerCase() === targetLang || v.lang.toLowerCase().replace('_', '-') === targetLang
  );
  if (voice) return voice;

  // 2. Language prefix match (e.g. 'hi' or 'en')
  const prefix = targetLang.split('-')[0];
  voice = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
  if (voice) return voice;

  return null;
};

export const speakText = (text: string, lang = 'en-IN') => {
  if (!('speechSynthesis' in window) || !text) return;
  try {
    window.speechSynthesis.cancel(); // Stop prior speech
    window.speechSynthesis.resume();

    // Check if text is predominantly Hindi/Devanagari characters
    const containsDevanagari = /[\u0900-\u097F]/.test(text);
    const targetLang = containsDevanagari ? 'hi-IN' : lang;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang;
    utterance.rate = containsDevanagari ? 0.90 : 0.95;
    utterance.pitch = 1.0;

    const matchedVoice = getOptimalVoice(targetLang);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error('Speech synthesis error:', e);
  }
};

export const speakBilingualText = (englishText: string, hindiText?: string) => {
  if (!('speechSynthesis' in window) || (!englishText && !hindiText)) return;
  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    // If englishText itself contains Devanagari or is Hindi, speak directly with hi-IN
    const hasDevanagari = /[\u0900-\u097F]/.test(englishText);
    if (hasDevanagari) {
      const hiUtterance = new SpeechSynthesisUtterance(englishText);
      hiUtterance.lang = 'hi-IN';
      hiUtterance.rate = 0.90;
      const hiVoice = getOptimalVoice('hi-IN');
      if (hiVoice) hiUtterance.voice = hiVoice;
      window.speechSynthesis.speak(hiUtterance);
      return;
    }

    // 1. Speak English response
    const engUtterance = new SpeechSynthesisUtterance(englishText);
    engUtterance.lang = 'en-IN';
    engUtterance.rate = 0.95;
    const engVoice = getOptimalVoice('en-IN') || getOptimalVoice('en-US');
    if (engVoice) engUtterance.voice = engVoice;

    // 2. Speak Hindi response if provided
    if (hindiText) {
      const hiUtterance = new SpeechSynthesisUtterance(hindiText);
      hiUtterance.lang = 'hi-IN';
      hiUtterance.rate = 0.90;
      const hiVoice = getOptimalVoice('hi-IN');
      if (hiVoice) hiUtterance.voice = hiVoice;

      engUtterance.onend = () => {
        try {
          window.speechSynthesis.speak(hiUtterance);
        } catch (e) {
          console.error('Hindi speech playback error:', e);
        }
      };
    }

    window.speechSynthesis.speak(engUtterance);
  } catch (e) {
    console.error('Bilingual speech error:', e);
  }
};

export const triggerHaptic = (pattern: number | number[] = [40, 30, 40]) => {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore fallback
    }
  }
};

export const VoiceReaderControl: React.FC<VoiceReaderProps> = ({
  textToSpeak,
  enabled,
  onToggle,
  highContrast,
}) => {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (enabled && textToSpeak) {
      setSpeaking(true);
      speakText(textToSpeak);
      const timer = setTimeout(() => setSpeaking(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [textToSpeak, enabled]);

  return (
    <button
      onClick={() => {
        triggerHaptic(50);
        onToggle();
        if (!enabled && textToSpeak) {
          speakText(textToSpeak);
        } else {
          window.speechSynthesis.cancel();
        }
      }}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
        highContrast
          ? 'bg-yellow-400 text-black border-2 border-black hover:bg-yellow-300'
          : enabled
          ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'
          : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
      }`}
      title="Toggle Audio Voice Readouts for Field Workers"
    >
      {enabled ? (
        <>
          <Volume2 className={`w-4 h-4 ${speaking ? 'animate-bounce text-yellow-300' : ''}`} />
          <span>VOICE ON</span>
        </>
      ) : (
        <>
          <VolumeX className="w-4 h-4 text-zinc-400" />
          <span>VOICE OFF</span>
        </>
      )}
    </button>
  );
};
