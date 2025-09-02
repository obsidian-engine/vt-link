import { MessageSpecification } from './MessageSpecification';
import { IncomingMessage } from '../entities/IncomingMessage';

/**
 * 時間範囲条件のSpecification
 */
export class TimeWindowSpecification implements MessageSpecification {
  readonly #startTime: string; // "HH:MM" format
  readonly #endTime: string;   // "HH:MM" format
  readonly #timeZone: string;

  constructor(
    startTime: string,
    endTime: string,
    timeZone: string = 'Asia/Tokyo'
  ) {
    if (!this.isValidTimeFormat(startTime)) {
      throw new Error('Invalid start time format. Expected HH:MM');
    }
    if (!this.isValidTimeFormat(endTime)) {
      throw new Error('Invalid end time format. Expected HH:MM');
    }

    this.#startTime = startTime;
    this.#endTime = endTime;
    this.#timeZone = timeZone;
  }

  isSatisfiedBy(message: IncomingMessage): boolean {
    const now = new Date();
    const currentTime = this.formatTime(now);
    
    return this.isTimeInRange(currentTime, this.#startTime, this.#endTime);
  }

  private isValidTimeFormat(time: string): boolean {
    const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timePattern.test(time);
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      timeZone: this.#timeZone
    });
  }

  private isTimeInRange(currentTime: string, startTime: string, endTime: string): boolean {
    const current = this.timeToMinutes(currentTime);
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    if (start <= end) {
      // Same day range (e.g., 09:00-17:00)
      return current >= start && current <= end;
    } else {
      // Cross midnight range (e.g., 22:00-06:00)
      return current >= start || current <= end;
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  get startTime(): string {
    return this.#startTime;
  }

  get endTime(): string {
    return this.#endTime;
  }

  get timeZone(): string {
    return this.#timeZone;
  }
}