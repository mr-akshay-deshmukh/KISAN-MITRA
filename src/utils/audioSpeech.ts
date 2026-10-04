import { LanguageCode } from '../types';
import { transcribeAudioBlob } from '../services/geminiService';

class AudioSpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private isSpeaking: boolean = false;
  private isListening: boolean = false;
  private keepAliveTimer: any = null;

  private recognition: any = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animationFrameId: number | null = null;
  private silenceTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      if (this.synth && this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          // Pre-warmed voices loaded
        };
      }
    }
  }

  /**
   * Cleans text and replaces language-specific symbols (₹, %) with spoken words
   */
  public normalizeTextForSpeech(text: string, lang: LanguageCode): string {
    if (!text) return '';
    let cleaned = text
      .replace(/[*#_`~[\]()]/g, ' ')
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/•/g, ' ')
      .replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (lang === 'mr') {
      cleaned = cleaned.replace(/₹\s*([0-9]+)/g, '$1 रुपये');
      cleaned = cleaned.replace(/₹/g, 'रुपये ');
      cleaned = cleaned.replace(/%/g, ' टक्के ');
    } else if (lang === 'hi') {
      cleaned = cleaned.replace(/₹\s*([0-9]+)/g, '$1 रुपये');
      cleaned = cleaned.replace(/₹/g, 'रुपये ');
      cleaned = cleaned.replace(/%/g, ' प्रतिशत ');
    } else if (lang === 'gu') {
      cleaned = cleaned.replace(/₹\s*([0-9]+)/g, '$1 રૂપિયા');
      cleaned = cleaned.replace(/₹/g, 'રૂપિયા ');
      cleaned = cleaned.replace(/%/g, ' ટકા ');
    } else if (lang === 'te') {
      cleaned = cleaned.replace(/₹\s*([0-9]+)/g, '$1 రూపాయలు');
      cleaned = cleaned.replace(/₹/g, 'రూపాయలు ');
      cleaned = cleaned.replace(/%/g, ' శాతం ');
    } else if (lang === 'ta') {
      cleaned = cleaned.replace(/₹\s*([0-9]+)/g, '$1 ரூபாய்');
      cleaned = cleaned.replace(/₹/g, 'ரூபாய் ');
      cleaned = cleaned.replace(/%/g, ' சதவீதம் ');
    } else if (lang === 'kn') {
      cleaned = cleaned.replace(/₹\s*([0-9]+)/g, '$1 ರೂಪಾಯಿ');
      cleaned = cleaned.replace(/₹/g, 'ರೂಪಾಯಿ ');
      cleaned = cleaned.replace(/%/g, ' ಪ್ರತಿಶತ ');
    } else if (lang === 'ml') {
      cleaned = cleaned.replace(/₹\s*([0-9]+)/g, '$1 രൂപ');
      cleaned = cleaned.replace(/₹/g, 'രൂപ ');
      cleaned = cleaned.replace(/%/g, ' ശതമാനം ');
    } else if (lang === 'bn') {
      cleaned = cleaned.replace(/₹\s*([0-9]+)/g, '$1 টাকা');
      cleaned = cleaned.replace(/₹/g, 'টাকা ');
      cleaned = cleaned.replace(/%/g, ' শতাংশ ');
    } else if (lang === 'pa') {
      cleaned = cleaned.replace(/₹\s*([0-9]+)/g, '$1 ਰੁਪਏ');
      cleaned = cleaned.replace(/₹/g, 'ਰੁਪਏ ');
      cleaned = cleaned.replace(/%/g, ' ਪ੍ਰਤੀਸ਼ਤ ');
    } else if (lang === 'or') {
      cleaned = cleaned.replace(/₹\s*([0-9]+)/g, '$1 ଟଙ୍କା');
      cleaned = cleaned.replace(/₹/g, 'ଟଙ୍କା ');
      cleaned = cleaned.replace(/%/g, ' ପ୍ରତିଶତ ');
    } else if (lang === 'as') {
      cleaned = cleaned.replace(/₹\s*([0-9]+)/g, '$1 টকা');
      cleaned = cleaned.replace(/₹/g, 'টকা ');
      cleaned = cleaned.replace(/%/g, ' শতাংশ ');
    } else if (lang === 'ur') {
      cleaned = cleaned.replace(/₹\s*([0-9]+)/g, '$1 روپے');
      cleaned = cleaned.replace(/₹/g, 'روپے ');
      cleaned = cleaned.replace(/%/g, ' فیصد ');
    } else {
      cleaned = cleaned.replace(/₹\s*([0-9]+)/g, '$1 Rupees');
      cleaned = cleaned.replace(/₹/g, 'Rupees ');
      cleaned = cleaned.replace(/%/g, ' percent ');
    }
    return cleaned;
  }

  /**
   * High-fidelity multi-tier Text-To-Speech with strict anti-echo protection
   */
  public speak(
    text: string,
    language: LanguageCode = 'mr',
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ) {
    // CRITICAL: Stop microphone to prevent speaker echo feedback loop
    this.stopListening();
    this.stop();

    if (!text || !text.trim()) {
      if (onEnd) onEnd();
      return;
    }

    const cleanText = this.normalizeTextForSpeech(text, language);
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    this.isSpeaking = true;
    if (onStart) onStart();

    let finished = false;
    const finish = (failed = false, err?: any) => {
      if (finished) return;
      finished = true;
      this.isSpeaking = false;
      this.clearKeepAlive();
      this.currentAudioElement = null;
      if (failed && onError) onError(err);
      if (onEnd) onEnd();
    };

    // Primary delivery: Instant browser speech synthesis if supported
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.speakWithBrowserSynth(cleanText, language, onStart, () => finish(false), (e) => {
        // If browser synth throws, fallback to audio element
        this.speakWithAudioElement(cleanText, language, onStart, onEnd, onError);
      });
      return;
    }

    // Secondary delivery: Server audio stream
    this.speakWithAudioElement(cleanText, language, onStart, onEnd, onError);
  }

  private speakWithAudioElement(
    cleanText: string,
    language: LanguageCode,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ) {
    let finished = false;
    const finish = (failed = false, err?: any) => {
      if (finished) return;
      finished = true;
      this.isSpeaking = false;
      this.currentAudioElement = null;
      if (failed && onError) onError(err);
      if (onEnd) onEnd();
    };

    try {
      const ttsUrl = `/api/ai/tts?lang=${language}&text=${encodeURIComponent(cleanText)}`;
      const audio = new Audio(ttsUrl);
      this.currentAudioElement = audio;

      audio.onended = () => finish(false);
      audio.onerror = () => finish(false);

      audio.play().catch(() => {
        finish(false);
      });
    } catch {
      finish(false);
    }
  }

  private clearKeepAlive() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  private speakWithBrowserSynth(
    text: string,
    language: LanguageCode,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ) {
    if (!this.synth) {
      this.isSpeaking = false;
      if (onError) onError('Speech synthesis not supported');
      if (onEnd) onEnd();
      return;
    }

    try {
      this.synth.cancel(); // Cancel any stalled speech
      if (this.synth.paused) {
        this.synth.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      const langMap: Record<LanguageCode, string> = {
        mr: 'mr-IN',
        hi: 'hi-IN',
        gu: 'gu-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        kn: 'kn-IN',
        ml: 'ml-IN',
        bn: 'bn-IN',
        pa: 'pa-IN',
        or: 'or-IN',
        as: 'as-IN',
        ur: 'ur-IN',
        en: 'en-IN',
      };

      const targetLang = langMap[language] || 'mr-IN';
      utterance.lang = targetLang;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      const voices = this.synth.getVoices();
      if (voices && voices.length > 0) {
        const matchedVoice =
          voices.find((v) => v.lang === targetLang) ||
          voices.find((v) => v.lang.replace('_', '-').toLowerCase() === targetLang.toLowerCase()) ||
          voices.find((v) => v.lang.startsWith(targetLang.slice(0, 2))) ||
          voices.find((v) => v.lang.includes('IN') || v.lang.includes('hi') || v.lang.includes('en'));

        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      // Chrome SpeechSynthesis bug workaround: Pulse resume every 8 seconds to prevent mid-speech pause
      this.clearKeepAlive();
      this.keepAliveTimer = setInterval(() => {
        if (this.synth && this.synth.speaking) {
          this.synth.resume();
        } else {
          this.clearKeepAlive();
        }
      }, 8000);

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.clearKeepAlive();
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e: any) => {
        this.isSpeaking = false;
        this.clearKeepAlive();
        this.currentUtterance = null;
        // If canceled or interrupted by new user action, complete cleanly without throwing error
        if (e && (e.error === 'canceled' || e.error === 'interrupted')) {
          if (onEnd) onEnd();
          return;
        }
        // Fallback to server audio streaming if browser speech synthesis failed
        this.speakWithAudioElement(text, language, onStart, onEnd, onError);
      };

      this.synth.speak(utterance);
    } catch {
      this.isSpeaking = false;
      this.clearKeepAlive();
      // On browser synth crash, smoothly fallback to server audio stream
      this.speakWithAudioElement(text, language, onStart, onEnd, onError);
    }
  }

  public stop() {
    this.clearKeepAlive();

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudioElement = null;
    }

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Starts microphone recording with clean transcription and no phantom auto-triggers.
   * onResult(transcript: string, isFinal: boolean)
   */
  public startListening(
    language: LanguageCode = 'mr',
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (errorMsg: string) => void,
    onEnd: () => void,
    onAudioLevel?: (level: number) => void
  ): boolean {
    // 1. MUST stop any playing audio so bot never hears itself!
    this.stop();
    this.stopListening();

    this.isListening = true;
    this.audioChunks = [];

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const langMap: Record<LanguageCode, string> = {
      mr: 'mr-IN',
      hi: 'hi-IN',
      gu: 'gu-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      bn: 'bn-IN',
      pa: 'pa-IN',
      or: 'or-IN',
      as: 'as-IN',
      ur: 'ur-IN',
      en: 'en-IN',
    };
    const targetSpeechLang = langMap[language] || 'mr-IN';

    // 1. Primary: Browser SpeechRecognition (High accuracy native Web Speech API)
    if (SpeechRecognitionClass) {
      try {
        const recognition = new SpeechRecognitionClass();
        this.recognition = recognition;
        recognition.lang = targetSpeechLang;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        let accumulatedFinal = '';
        let lastFullTranscript = '';
        let volumeInterval: any = null;

        // Animate visualizer based on speech activity
        const startVisualizerPulse = () => {
          if (volumeInterval) return;
          volumeInterval = setInterval(() => {
            if (!this.isListening) {
              clearInterval(volumeInterval);
              return;
            }
            // Dynamic wave amplitude when user is actively speaking
            const level = Math.floor(45 + Math.random() * 45);
            if (onAudioLevel) onAudioLevel(level);
          }, 120);
        };

        const stopVisualizerPulse = () => {
          if (volumeInterval) {
            clearInterval(volumeInterval);
            volumeInterval = null;
          }
          if (onAudioLevel) onAudioLevel(12);
        };

        recognition.onspeechstart = () => {
          startVisualizerPulse();
        };

        recognition.onspeechend = () => {
          stopVisualizerPulse();
        };

        recognition.onresult = (event: any) => {
          let currentInterim = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const res = event.results[i];
            if (res.isFinal) {
              accumulatedFinal += (accumulatedFinal ? ' ' : '') + res[0].transcript.trim();
            } else {
              currentInterim += res[0].transcript;
            }
          }

          const combined = (accumulatedFinal + (currentInterim ? ' ' + currentInterim : '')).trim();
          if (combined) {
            lastFullTranscript = combined;
            // Real-time transcript delivery to input box with isFinal=false so user is NEVER cut off!
            onResult(combined, false);
            startVisualizerPulse();
          }
        };

        recognition.onerror = (event: any) => {
          stopVisualizerPulse();
          const err = event.error;
          if (err === 'no-speech' || err === 'aborted') {
            // Harmless: user paused speaking or stopped manually.
            return;
          }
          console.warn('SpeechRecognition status:', err);
          if (err === 'not-allowed' || err === 'permission-denied') {
            const permMsg =
              language === 'mr'
                ? 'मायक्रोफोन परवानगी नाकारली आहे. कृपया ब्राउझर सेटिंग्जमध्ये मायक्रोफोन चालू करा.'
                : language === 'hi'
                ? 'माइक की अनुमति अस्वीकार की गई है। कृपया ब्राउज़र सेटिंग्स में माइक की अनुमति दें।'
                : 'Microphone permission was denied. Please allow microphone access in your browser settings.';
            onError(permMsg);
            this.stopListening();
            onEnd();
          } else if (err === 'audio-capture') {
            const capMsg =
              language === 'mr'
                ? 'मायक्रोफोन सापडला नाही किंवा इतर ॲपमध्ये वापरला जात आहे.'
                : language === 'hi'
                ? 'माइक नहीं मिला या किसी अन्य ऐप में उपयोग हो रहा है।'
                : 'No microphone was found or microphone is busy.';
            onError(capMsg);
            this.stopListening();
            onEnd();
          }
        };

        recognition.onend = () => {
          stopVisualizerPulse();
          // If the recognition session ended naturally but user still hasn't stopped, deliver what was captured
          if (this.isListening) {
            if (lastFullTranscript) {
              onResult(lastFullTranscript, false);
            }
            this.isListening = false;
            onEnd();
          }
        };

        recognition.start();
        return true;
      } catch (err: any) {
        console.warn('Native SpeechRecognition failed, falling back to MediaRecorder:', err);
      }
    }

    // 2. Secondary Fallback: MediaRecorder + Gemini Server STT (for Firefox or unsupported browsers)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
        .then((stream) => {
          if (!this.isListening) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          this.mediaStream = stream;

          // Audio visualizer setup
          try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
              this.audioContext = new AudioContextClass();
              const source = this.audioContext.createMediaStreamSource(stream);
              this.analyser = this.audioContext.createAnalyser();
              this.analyser.fftSize = 64;
              source.connect(this.analyser);

              const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
              const checkVolume = () => {
                if (!this.analyser || !this.isListening) return;
                this.analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                  sum += dataArray[i];
                }
                const average = sum / dataArray.length;
                const normalized = Math.min(100, Math.round((average / 128) * 100));
                if (onAudioLevel) onAudioLevel(normalized);
                this.animationFrameId = requestAnimationFrame(checkVolume);
              };
              checkVolume();
            }
          } catch {
            // ignore visualizer errors
          }

          try {
            const mimeType = MediaRecorder.isTypeSupported('audio/webm')
              ? 'audio/webm'
              : MediaRecorder.isTypeSupported('audio/mp4')
              ? 'audio/mp4'
              : '';

            this.mediaRecorder = mimeType
              ? new MediaRecorder(stream, { mimeType })
              : new MediaRecorder(stream);

            this.mediaRecorder.ondataavailable = (event) => {
              if (event.data && event.data.size > 0) {
                this.audioChunks.push(event.data);
              }
            };

            this.mediaRecorder.onstop = async () => {
              if (this.audioChunks.length > 0) {
                try {
                  const audioBlob = new Blob(this.audioChunks, {
                    type: this.mediaRecorder?.mimeType || 'audio/webm',
                  });
                  if (audioBlob.size > 800) {
                    onResult(
                      language === 'mr'
                        ? 'आवाज समजून घेत आहे...'
                        : language === 'hi'
                        ? 'आवाज समझ रहा है...'
                        : 'Processing voice...',
                      false
                    );
                    const serverTranscript = await transcribeAudioBlob(audioBlob, language);
                    if (serverTranscript && serverTranscript.trim()) {
                      onResult(serverTranscript.trim(), false);
                      return;
                    }
                  }
                } catch (sttErr: any) {
                  console.info('Server audio STT note:', sttErr);
                }
              }
            };

            this.mediaRecorder.start(200);
          } catch (recErr) {
            console.warn('MediaRecorder init note:', recErr);
          }
        })
        .catch((err) => {
          console.warn('Microphone permission note:', err);
          onError('Microphone access is needed to speak. Please allow microphone permission.');
          this.stopListening();
          onEnd();
        });

      return true;
    }

    onError('Voice input is not supported in this browser. Please type your query.');
    this.stopListening();
    onEnd();
    return false;
  }

  public stopListening() {
    this.isListening = false;

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.recognition = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {
        // ignore
      }
      this.audioContext = null;
    }

    this.analyser = null;
  }
}

export const audioSpeech = new AudioSpeechService();
