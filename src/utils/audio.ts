// Audio utility using Web Audio API & Multi-Tier Vietnamese Speech Synthesis

type SpeakingListener = (isSpeaking: boolean) => void;

class CosmicAudioManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private currentAudioElement: HTMLAudioElement | null = null;
  private speakingStatus: boolean = false;
  private speakingListeners: Set<SpeakingListener> = new Set();
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initVoices();
    }
  }

  private initVoices() {
    if ('speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
      };
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stopSpeaking();
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public isSpeaking(): boolean {
    return this.speakingStatus;
  }

  public addSpeakingListener(listener: SpeakingListener) {
    this.speakingListeners.add(listener);
    return () => this.speakingListeners.delete(listener);
  }

  private notifySpeaking(status: boolean) {
    this.speakingStatus = status;
    this.speakingListeners.forEach((l) => l(status));
  }

  // Play a gentle sparkling star chime
  public playStarChime() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (joyful chord)
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.5);
      });
    } catch {
      // Ignore audio context errors gracefully
    }
  }

  // Play a subtle rocket launch swoosh
  public playRocketLaunch() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.35);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // Ignore audio errors
    }
  }

  // Play a happy quest completion fanfare
  public playSuccessFanfare() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.55);
      });
    } catch {
      // Ignore audio errors
    }
  }

  /**
   * Reads Vietnamese text aloud using a multi-tiered pipeline:
   * Tier 1: Gemini TTS API (gemini-3.8-flash-lite-tts with Vietnamese voice prompt)
   * Tier 2: Google Vietnamese TTS Audio
   * Tier 3: Browser SpeechSynthesis with explicit vi-VN voice selection
   */
  public async speakVietnamese(text: string, onEnd?: () => void) {
    if (!this.soundEnabled) return;

    // Stop ongoing speech
    this.stopSpeaking();
    this.notifySpeaking(true);

    const cleanText = text.replace(/[*#_~`]/g, '').trim();
    if (!cleanText) {
      this.notifySpeaking(false);
      onEnd?.();
      return;
    }

    const finish = () => {
      this.notifySpeaking(false);
      this.currentAudioElement = null;
      onEnd?.();
    };

    // Tier 1: Attempt Gemini TTS via backend /api/tts
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, voice: 'Kore' }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          this.currentAudioElement = audio;
          audio.onended = finish;
          audio.onerror = () => {
            this.fallbackToVietnameseWebAudio(cleanText, finish);
          };
          await audio.play();
          return;
        }
      }
    } catch (e) {
      console.warn('Gemini TTS failed, falling back to Vietnamese web audio:', e);
    }

    // Tier 2: Google Vietnamese TTS Audio stream
    this.fallbackToVietnameseWebAudio(cleanText, finish);
  }

  private fallbackToVietnameseWebAudio(text: string, onFinish: () => void) {
    try {
      const encoded = encodeURIComponent(text.slice(0, 200));
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=vi&client=tw-ob`;
      const audio = new Audio(audioUrl);
      this.currentAudioElement = audio;

      audio.onended = onFinish;
      audio.onerror = () => {
        // Tier 3: Browser SpeechSynthesis
        this.fallbackToSpeechSynthesis(text, onFinish);
      };

      audio.play().catch(() => {
        this.fallbackToSpeechSynthesis(text, onFinish);
      });
    } catch {
      this.fallbackToSpeechSynthesis(text, onFinish);
    }
  }

  private fallbackToSpeechSynthesis(text: string, onFinish: () => void) {
    if (!('speechSynthesis' in window)) {
      onFinish();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.9;
    utterance.pitch = 1.05;

    // Refresh voices if empty
    if (this.cachedVoices.length === 0) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }

    // Find Vietnamese voice
    const viVoice = this.cachedVoices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('vi') ||
        v.lang.toLowerCase().includes('vn') ||
        v.name.toLowerCase().includes('vietnam') ||
        v.name.toLowerCase().includes('vietnamese') ||
        v.name.toLowerCase().includes('linh') ||
        v.name.toLowerCase().includes('mai') ||
        v.name.toLowerCase().includes('an')
    );

    if (viVoice) {
      utterance.voice = viVoice;
      utterance.lang = viVoice.lang;
    }

    utterance.onend = onFinish;
    utterance.onerror = onFinish;

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudioElement = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.notifySpeaking(false);
  }
}

export const cosmicAudio = new CosmicAudioManager();
