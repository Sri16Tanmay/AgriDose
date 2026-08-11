import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  X,
  Mic,
  MicOff,
  Bot,
  User,
  Zap,
  CornerDownLeft,
  Globe,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Radio,
} from 'lucide-react';
import { AppThemeConfig, InfectionSeverityLevel, CropType, ScanModeType } from '../types';
import { triggerHaptic, speakText, speakBilingualText, unlockSpeechSynthesis } from './VoiceReader';
import { TabType } from './MobileContainer';

export interface RewaChatMessage {
  id: string;
  sender: 'user' | 'rewa';
  text: string;
  timestamp: string;
  actionExecuted?: {
    type: string;
    description: string;
  };
}

interface RewaAssistantProps {
  currentTab: TabType;
  themeConfig: AppThemeConfig;
  onNavigateTab: (tab: TabType, scanMode?: ScanModeType) => void;
  onTriggerSpray: (dosageMl: number, durationSec: number, pressureBar: number) => void;
  onUpdateThemeConfig: (updates: Partial<AppThemeConfig>) => void;
}

export const RewaAssistant: React.FC<RewaAssistantProps> = ({
  currentTab,
  themeConfig,
  onNavigateTab,
  onTriggerSpray,
  onUpdateThemeConfig,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputMsg, setInputMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [voicePlayback, setVoicePlayback] = useState<boolean>(themeConfig.voiceAudioEnabled);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [speechLang, setSpeechLang] = useState<'hi-IN' | 'en-IN' | 'en-US'>(
    themeConfig.language === 'HI' ? 'hi-IN' : 'en-US'
  );
  const [messages, setMessages] = useState<RewaChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'rewa',
      text:
        themeConfig.language === 'HI'
          ? 'नमस्ते किसान भाई! मैं रेवा हूँ, एग्रीडोज़ की सहायक। आप मुझसे किसी भी भाषा (हिंदी, English, या Hinglish) में बोलकर (Mic 🎙️) या लिखकर पूछ सकते हैं।'
          : 'Namaste! I am Rewa, your AgriDose voice assistant. Tap the Microphone 🎙️ to speak in Hindi or English, or type your question below.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isHighContrast = themeConfig.highContrastOutdoor;
  const isEco = themeConfig.batterySaverEco;

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Keep speech language & voice playback synced with themeConfig
  useEffect(() => {
    setSpeechLang(themeConfig.language === 'HI' ? 'hi-IN' : 'en-US');
  }, [themeConfig.language]);

  useEffect(() => {
    setVoicePlayback(themeConfig.voiceAudioEnabled);
  }, [themeConfig.voiceAudioEnabled]);

  // Clean up speech recognition when unmounting or closing
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Unlock browser audio context on user gesture
  const unlockAudioContext = () => {
    unlockSpeechSynthesis();
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.getVoices();
      } catch (e) {
        // ignore
      }
    }
  };

  // Speech synthesis handler mapping themeConfig.language to hi-IN or en-US voices
  const speakRewaResponse = (text: string) => {
    if (!('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const containsDevanagari = /[\u0900-\u097F]/.test(text);
      const isHindi = themeConfig.language === 'HI' || containsDevanagari;
      const targetLang = isHindi ? 'hi-IN' : 'en-US';

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang;
      utterance.rate = isHindi ? 0.90 : 0.95;
      utterance.pitch = 1.0;

      // Match system voices for target language (hi-IN or en-US)
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const targetLangLower = targetLang.toLowerCase();
        let matchedVoice = voices.find(
          (v) => v.lang.toLowerCase() === targetLangLower || v.lang.toLowerCase().replace('_', '-') === targetLangLower
        );
        if (!matchedVoice) {
          const prefix = targetLangLower.split('-')[0];
          matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
        }
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis error in RewaAssistant:', e);
    }
  };

  const toggleSpeechRecognition = () => {
    triggerHaptic([30, 20]);
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError('Speech recognition is not supported in this browser. Please type your message.');
      setTimeout(() => setMicError(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInputMsg(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicError('MIC_PERMISSION_DENIED:\nEnglish: 🎙️ Microphone access blocked. Please enable microphone permissions to speak with Rewa.\nHindi: 🎙️ माइक्रोफ़ोन एक्सेस ब्लॉक है। रीवा से बात करने के लिए माइक्रोफ़ोन अनुमति चालू करें।');
        } else if (event.error !== 'no-speech') {
          setMicError(`🎙️ Microphone access blocked. Please enable microphone permissions to speak with Rewa.\n🎙️ माइक्रोफ़ोन एक्सेस ब्लॉक है। रीवा से बात करने के लिए माइक्रोफ़ोन अनुमति चालू करें।`);
        }
        setTimeout(() => setMicError(null), 8000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setMicError('Failed to activate microphone. Please try typing.');
      setTimeout(() => setMicError(null), 4000);
    }
  };

  // Suggested Prompts for Quick Action (Function Execution Shortcuts)
  const quickPrompts = [
    {
      label: '📱 Dosage Calculator',
      query: 'Go to dosage calculator screen',
    },
    {
      label: '📷 Plant Scan Mode',
      query: 'Open plant scan mode',
    },
    {
      label: '🍾 Pesticide Scan Mode',
      query: 'Pesticide scan mode',
    },
    {
      label: '💧 Actuate Test Spray',
      query: 'Actuate test spray',
    },
    {
      label: '❌ Close Chat',
      query: 'Close chat',
    },
  ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMsg;
    if (!textToSend.trim() || loading) return;

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
    }

    triggerHaptic(30);
    unlockSpeechSynthesis();
    const userMsgObj: RewaChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsgObj]);
    if (!customText) setInputMsg('');
    setLoading(true);

    try {
      const response = await fetch('/api/rewa-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          currentTab,
          themeConfig,
          history: messages.slice(-6).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
        }),
      });

      const data = await response.json();
      const replyText = data.reply || 'Namaste! Main aapki madad ke liye taiyar hoon.';
      const action = data.action;

      let executedActionInfo: { type: string; description: string } | undefined = undefined;

      // Handle Function Execution Engine & State Routing Dispatcher
      if (action && action.type) {
        if (action.type === 'NAVIGATE' || action.type === 'NAVIGATE_SCREEN') {
          const rawTab = (action.payload?.tab || '').toUpperCase();
          let targetTab: TabType = 'scanner';
          let targetScanMode: ScanModeType | undefined = undefined;

          if (rawTab === 'DOSAGE_CALCULATOR' || rawTab === 'CALCULATOR') {
            targetTab = 'calculator';
          } else if (rawTab === 'PLANT_HEALTH_SCAN' || rawTab === 'SCANNER' || rawTab === 'PLANT_SCAN') {
            targetTab = 'scanner';
            targetScanMode = 'CROP_HEALTH_ANALYSIS';
          } else if (rawTab === 'PESTICIDE_LABEL_SCAN' || rawTab === 'PESTICIDE_SCAN') {
            targetTab = 'scanner';
            targetScanMode = 'PESTICIDE_LABEL_SCAN';
          } else if (rawTab === 'SPRINKLER' || rawTab === 'SPRAY' || rawTab === 'SPRINKLER_RIG') {
            targetTab = 'sprinkler';
          } else if (rawTab === 'FIELD_MAP' || rawTab === 'MAP') {
            targetTab = 'field_map';
          } else if (rawTab === 'ANALYTICS' || rawTab === 'SAVINGS') {
            targetTab = 'analytics';
          } else if (rawTab === 'OFFLINE_SYNC' || rawTab === 'SYNC') {
            targetTab = 'offline_sync';
          } else {
            targetTab = (action.payload?.tab || 'scanner') as TabType;
          }

          onNavigateTab(targetTab, targetScanMode);

          // Close chat drawer on screen navigation commands to immediately show target screen
          if (action.payload?.closeChat !== false) {
            setIsOpen(false);
          }

          executedActionInfo = {
            type: 'NAVIGATE_SCREEN',
            description: `Navigated screen state to '${targetTab.toUpperCase()}'${
              targetScanMode ? ` [${targetScanMode}]` : ''
            }`,
          };
        } else if (action.type === 'ACTUATE_SPRAY' || action.type === 'TRIGGER_SPRAY') {
          const dosage = action.payload?.dosageMl || 45;
          const duration = action.payload?.durationSec || 10;
          const pressure = action.payload?.pressureBar || 2.5;

          onTriggerSpray(dosage, duration, pressure);

          // Close chat drawer so user immediately sees the 3D misting particle simulation and countdown timer
          if (action.payload?.closeChat !== false) {
            setIsOpen(false);
          }

          executedActionInfo = {
            type: 'ACTUATE_SPRAY',
            description: `Actuated Spray Rig Hardware (${dosage} mL, ${duration}s, ${pressure} bar)`,
          };
        } else if (action.type === 'TOGGLE_CHAT' || action.type === 'CLOSE_CHAT') {
          setIsOpen(false);
          executedActionInfo = {
            type: 'TOGGLE_CHAT',
            description: 'Dismissed Rewa AI Assistant overlay',
          };
        } else if (action.type === 'TOGGLE_THEME') {
          onUpdateThemeConfig(action.payload);
          executedActionInfo = {
            type: 'TOGGLE_THEME',
            description: 'Updated application theme settings',
          };
        } else if (action.type === 'SET_LANGUAGE') {
          onUpdateThemeConfig({ language: action.payload?.language || 'HI' });
          executedActionInfo = {
            type: 'SET_LANGUAGE',
            description: `Switched language to ${action.payload?.language || 'HI'}`,
          };
        }
      }

      const rewaMsgObj: RewaChatMessage = {
        id: `rewa_${Date.now()}`,
        sender: 'rewa',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionExecuted: executedActionInfo,
      };

      setMessages((prev) => [...prev, rewaMsgObj]);

      // Voice readout if enabled (maps themeConfig.language to hi-IN or en-US)
      if (voicePlayback) {
        speakRewaResponse(replyText);
      }
    } catch (err) {
      console.error('Error talking to Rewa AI:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `rewa_err_${Date.now()}`,
          sender: 'rewa',
          text: 'Namaste Kisan Bhai! Offline connection error. Main bilkul taiyar hoon, aap humare local calculator ya scanner ka prayog kar sakte hain.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Assistant Launcher Button - Small Circular Shape Icon fixed at bottom:20px, right:20px */}
      {!isOpen && (
        <button
          onClick={() => {
            triggerHaptic([40, 30]);
            unlockAudioContext();
            setIsOpen(true);
          }}
          style={{ bottom: '20px', right: '20px' }}
          className="fixed z-50 w-13 h-13 rounded-full shadow-2xl border-[1.5px] border-[#00FF88] bg-[#10171D] text-[#00FF88] shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all flex items-center justify-center group active:scale-90 hover:bg-[#1E293B]"
          aria-label="Open Rewa Virtual Assistant"
          title="Rewa AI Virtual Assistant (Voice & Chat)"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6 stroke-[2.2] text-[#00FF88]" />
            <Sparkles className="w-3.5 h-3.5 text-[#00E5FF] absolute -top-1.5 -right-1.5 animate-spin" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00FF88] rounded-full border border-black animate-ping" />
          </div>
        </button>
      )}

      {/* Expanded Rewa Assistant Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div
            className={`w-full max-w-lg h-[92vh] sm:h-[650px] rounded-t-3xl sm:rounded-3xl border-t sm:border flex flex-col overflow-hidden shadow-2xl ${
              isHighContrast
                ? 'bg-zinc-950 text-white border-2 border-amber-400/80 font-bold shadow-2xl'
                : isEco
                ? 'bg-zinc-950 border-emerald-900 text-emerald-100'
                : 'glass-card-accent bg-zinc-950/90 border-emerald-500/35 text-white backdrop-blur-2xl glow-emerald'
            }`}
          >
            {/* Header */}
            <div className="p-3.5 px-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-amber-500 p-0.5 shadow-md flex items-center justify-center shrink-0">
                  <div className="w-full h-full bg-zinc-900 rounded-[14px] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black tracking-tight text-white">REWA AI ASSISTANT</h3>
                    <span className="px-1.5 py-0.2 rounded-md bg-emerald-900/80 text-emerald-300 border border-emerald-700 text-[8px] font-black uppercase">
                      Voice & Chat (🎙️ EN/हिन्दी)
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-medium">
                    AgriDose Precision Agronomist & Voice Controller
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Speech Recognition Language Selector Badge */}
                <button
                  onClick={() => {
                    unlockAudioContext();
                    const nextLang = speechLang === 'hi-IN' ? 'en-US' : 'hi-IN';
                    setSpeechLang(nextLang);
                    triggerHaptic(20);
                  }}
                  className="px-2 py-1 rounded-xl bg-zinc-900 text-amber-300 border border-amber-500/40 text-[10px] font-black hover:bg-zinc-800"
                  title="Switch Voice Input Language"
                >
                  🎙️ {speechLang === 'hi-IN' ? 'हिन्दी' : 'EN'}
                </button>

                <button
                  onClick={() => {
                    unlockAudioContext();
                    triggerHaptic(20);
                    setVoicePlayback(!voicePlayback);
                  }}
                  className={`p-2 rounded-xl border transition-all ${
                    voicePlayback
                      ? 'bg-emerald-600/30 text-emerald-400 border-emerald-500'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                  title="Toggle Voice Output Readout"
                >
                  {voicePlayback ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => {
                    triggerHaptic(30);
                    if (isListening && recognitionRef.current) {
                      try {
                        recognitionRef.current.stop();
                      } catch (e) {
                        // ignore
                      }
                      setIsListening(false);
                    }
                    setIsOpen(false);
                  }}
                  className="p-2 rounded-xl bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="p-2 px-3 bg-zinc-950/50 border-b border-zinc-800/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.query)}
                  className="px-2.5 py-1 rounded-full bg-zinc-800/90 text-zinc-300 hover:bg-emerald-950 hover:text-emerald-300 border border-zinc-700/80 text-[10px] font-bold whitespace-nowrap transition-all shrink-0"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Listening Live Indicator Banner */}
            {isListening && (
              <div className="p-2.5 bg-red-950/90 border-b border-red-500/60 text-red-200 flex items-center justify-between px-4 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-black tracking-wide">
                    {speechLang === 'hi-IN' ? 'सुन रहे हैं... बोलिए! (Listening in Hindi)' : 'Listening now... Speak your prompt!'}
                  </span>
                </div>
                <button
                  onClick={toggleSpeechRecognition}
                  className="px-2 py-0.5 rounded-lg bg-red-600 text-white text-[10px] font-extrabold uppercase hover:bg-red-500"
                >
                  Stop Mic
                </button>
              </div>
            )}

            {/* Mic Error Banner */}
            {micError && (
              <div className="p-2 bg-[#10171D] border-b border-[#FF3B30]/50 text-[#FF3B30] text-xs text-center font-bold">
                ⚠️ {micError}
              </div>
            )}

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
                  >
                    <div className="flex items-end gap-1.5 max-w-[85%]">
                      {!isUser && (
                        <div className="w-6 h-6 rounded-lg bg-emerald-900/80 border border-emerald-600 flex items-center justify-center shrink-0 mb-1">
                          <Bot className="w-3.5 h-3.5 text-emerald-300" />
                        </div>
                      )}

                      <div
                        className={`p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-md ${
                          isUser
                            ? 'bg-emerald-600 text-white rounded-br-none border border-emerald-400 font-semibold'
                            : 'bg-zinc-800/90 text-zinc-100 rounded-bl-none border border-zinc-700'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        {msg.actionExecuted && (
                          <div className="mt-2 pt-2 border-t border-emerald-500/30 flex items-center gap-1.5 text-[10px] font-extrabold text-amber-300">
                            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Executed Action: {msg.actionExecuted.description}</span>
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mb-1">
                          <User className="w-3.5 h-3.5 text-zinc-300" />
                        </div>
                      )}
                    </div>
                    <span className="text-[8px] text-zinc-500 mt-0.5 px-1">{msg.timestamp}</span>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-amber-300 p-2 bg-zinc-950/60 rounded-xl w-fit border border-amber-900/50 animate-pulse">
                  <Bot className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span>Rewa is calculating response in Hindi/English...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-zinc-950 border-t border-zinc-800/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                {/* Voice Input Microphone Button */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`p-3 rounded-2xl transition-all shrink-0 flex items-center justify-center border ${
                    isListening
                      ? 'bg-red-600 text-white border-red-400 ring-4 ring-red-500/40 animate-pulse scale-105'
                      : 'bg-zinc-900 text-amber-300 border-zinc-700 hover:bg-zinc-800 hover:border-amber-400'
                  }`}
                  aria-label="Voice input microphone"
                  title={isListening ? 'Stop listening' : 'Speak voice prompt (Hindi / English)'}
                >
                  {isListening ? (
                    <Radio className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Mic className="w-4 h-4 text-amber-400" />
                  )}
                </button>

                <input
                  type="text"
                  placeholder={
                    isListening
                      ? speechLang === 'hi-IN'
                        ? 'सुन रहे हैं... बोलिए (Listening)...'
                        : 'Listening... speak your query...'
                      : 'Poochiye ya Mic 🎙️ se boliyen...'
                  }
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  className="flex-1 bg-zinc-900 text-white text-xs font-medium p-3 rounded-2xl border border-zinc-700 focus:border-emerald-500 outline-none"
                />

                <button
                  type="submit"
                  disabled={!inputMsg.trim() || loading}
                  className="p-3 rounded-2xl bg-emerald-600 text-white font-bold border border-emerald-400 hover:bg-emerald-500 disabled:opacity-50 transition-all shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

