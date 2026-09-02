class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private germanVoice: SpeechSynthesisVoice | null = null;
  private listeners: ((speaking: boolean, text: string) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoice();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoice();
      }
    }
  }

  private initVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    const deVoice = voices.find(v => v.lang === 'de-DE' || v.lang.startsWith('de')) || null;
    this.germanVoice = deVoice;
  }

  subscribe(callback: (speaking: boolean, text: string) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify(speaking: boolean, text: string = '') {
    this.listeners.forEach(l => l(speaking, text));
  }

  speak(text: string, rate: number = 0.9) {
    if (!this.synth) return;
    this.synth.cancel();

    const clean = text.replace(/[\(\)\[\]\/]/g, ' ').replace(/\s+/g, ' ').trim();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'de-DE';
    if (this.germanVoice) {
      utterance.voice = this.germanVoice;
    }
    utterance.rate = rate;
    utterance.pitch = 1.0;

    utterance.onstart = () => this.notify(true, text);
    utterance.onend = () => this.notify(false, '');
    utterance.onerror = () => this.notify(false, '');

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.notify(false, '');
    }
  }
}

export const speechService = new SpeechService();
