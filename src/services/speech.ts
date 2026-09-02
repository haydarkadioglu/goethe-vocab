/**
 * Speech synthesis service with configurable playback speed and event subscriptions.
 */

type SpeechListener = (speaking: boolean, currentText: string | null) => void;

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private germanVoice: SpeechSynthesisVoice | null = null;
  private listeners: SpeechListener[] = [];
  private currentText: string | null = null;
  private rate: number = 0.9; // Default slightly natural speed for learners

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      
      try {
        const savedRate = localStorage.getItem('goethe_speech_rate');
        if (savedRate) {
          const parsed = parseFloat(savedRate);
          if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 1.5) {
            this.rate = parsed;
          }
        }
      } catch {}

      this.initVoice();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoice();
      }
    }
  }

  private initVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prioritize natural German voices
    const deVoices = voices.filter(v => v.lang.startsWith('de'));
    const preferred = deVoices.find(v => 
      v.name.includes('Google') || 
      v.name.includes('Natural') || 
      v.name.includes('Katja') || 
      v.name.includes('Hedda') || 
      v.name.includes('Stefan')
    );
    this.germanVoice = preferred || deVoices[0] || null;
  }

  public getRate(): number {
    return this.rate;
  }

  public setRate(newRate: number) {
    this.rate = Math.max(0.5, Math.min(1.5, newRate));
    try {
      localStorage.setItem('goethe_speech_rate', this.rate.toString());
    } catch {}
  }

  public getGermanVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices().filter(v => v.lang.startsWith('de'));
  }

  public setVoice(voice: SpeechSynthesisVoice) {
    this.germanVoice = voice;
  }

  public speak(text: string, customRate?: number) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported on this device/browser.');
      return;
    }

    this.synth.cancel();

    const cleanText = text
      .replace(/[()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'de-DE';
    if (this.germanVoice) {
      utterance.voice = this.germanVoice;
    }
    utterance.rate = customRate ?? this.rate;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.currentText = text;
      this.notifyListeners(true, text);
    };

    utterance.onend = () => {
      this.currentText = null;
      this.notifyListeners(false, null);
    };

    utterance.onerror = () => {
      this.currentText = null;
      this.notifyListeners(false, null);
    };

    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentText = null;
      this.notifyListeners(false, null);
    }
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }

  public subscribe(listener: SpeechListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(speaking: boolean, text: string | null) {
    this.listeners.forEach(listener => listener(speaking, text));
  }
}

export const speechService = new SpeechService();
