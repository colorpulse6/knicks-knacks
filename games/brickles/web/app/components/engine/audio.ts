import { AudioEvent } from "./types";

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted = false;

  init(): void {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.ctx.destination);
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 0.3;
    }
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  play(event: AudioEvent, params?: { combo?: number; pitch?: number }): void {
    if (!this.ctx || this.muted) return;

    switch (event) {
      case AudioEvent.PADDLE_HIT:
        this.playNote("triangle", 220, 80, { pitchEnd: 176 });
        break;

      case AudioEvent.WALL_HIT:
        this.playNote("sine", 180, 50, { gainStart: 0.15 });
        break;

      case AudioEvent.BRICK_HIT:
        this.playNote("square", params?.pitch ?? 440, 60, { gainStart: 0.15 });
        break;

      case AudioEvent.BRICK_DESTROY: {
        const freq = params?.pitch ?? 440;
        this.playNote("square", freq, 80, { gainStart: 0.2 });
        this.playNote("sine", freq * 1.5, 100, {
          gainStart: 0.1,
          delay: 0.02,
        });
        break;
      }

      case AudioEvent.EXPLOSIVE_DESTROY:
        this.playNote("sawtooth", 110, 200, {
          pitchEnd: 55,
          gainStart: 0.3,
        });
        this.playNote("square", 80, 150, { pitchEnd: 40, gainStart: 0.2, delay: 0.03 });
        break;

      case AudioEvent.POWER_UP_COLLECT:
        this.playNote("sine", 440, 60, { gainStart: 0.2 });
        this.playNote("sine", 660, 60, { gainStart: 0.2, delay: 0.06 });
        this.playNote("sine", 880, 80, { gainStart: 0.2, delay: 0.12 });
        break;

      case AudioEvent.POWER_UP_NEGATIVE:
        this.playNote("sine", 440, 60, { gainStart: 0.2 });
        this.playNote("sine", 330, 60, { gainStart: 0.2, delay: 0.06 });
        this.playNote("sine", 220, 80, { gainStart: 0.2, delay: 0.12 });
        break;

      case AudioEvent.EXTRA_LIFE:
        this.playNote("triangle", 523, 70, { gainStart: 0.2 });
        this.playNote("triangle", 659, 70, { gainStart: 0.2, delay: 0.07 });
        this.playNote("triangle", 784, 70, { gainStart: 0.2, delay: 0.14 });
        this.playNote("triangle", 1047, 120, { gainStart: 0.25, delay: 0.21 });
        break;

      case AudioEvent.BALL_LOST:
        this.playNote("sine", 440, 400, {
          pitchEnd: 110,
          gainStart: 0.25,
        });
        break;

      case AudioEvent.LEVEL_COMPLETE:
        this.playNote("sine", 523, 100, { gainStart: 0.2 });
        this.playNote("sine", 659, 100, { gainStart: 0.2, delay: 0.1 });
        this.playNote("sine", 784, 100, { gainStart: 0.2, delay: 0.2 });
        this.playNote("sine", 1047, 200, { gainStart: 0.25, delay: 0.3 });
        break;

      case AudioEvent.GAME_OVER:
        this.playNote("sawtooth", 330, 800, {
          pitchEnd: 80,
          gainStart: 0.2,
        });
        break;

      case AudioEvent.COMBO: {
        const comboCount = params?.combo ?? 3;
        const basePitch = 440 * (1 + comboCount * 0.08);
        this.playNote("sine", basePitch, 40, { gainStart: 0.15 });
        break;
      }

      case AudioEvent.LASER_FIRE:
        this.playNote("sawtooth", 1200, 30, {
          pitchEnd: 600,
          gainStart: 0.1,
        });
        break;
    }
  }

  private playNote(
    type: OscillatorType,
    frequency: number,
    durationMs: number,
    options?: {
      pitchEnd?: number;
      gainStart?: number;
      gainEnd?: number;
      delay?: number;
    }
  ): void {
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const start = now + (options?.delay ?? 0);
    const end = start + durationMs / 1000;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    if (options?.pitchEnd) {
      osc.frequency.linearRampToValueAtTime(options.pitchEnd, end);
    }

    gain.gain.setValueAtTime(options?.gainStart ?? 0.2, start);
    gain.gain.linearRampToValueAtTime(options?.gainEnd ?? 0, end);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(start);
    osc.stop(end + 0.01);
  }
}
