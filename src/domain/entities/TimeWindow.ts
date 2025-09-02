export class TimeWindow {
  readonly #startTime: string; // HH:mm format
  readonly #endTime: string; // HH:mm format
  readonly #timeZone: string;
  readonly #daysOfWeek: Set<number>; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  private constructor(startTime: string, endTime: string, timeZone: string, daysOfWeek: number[]) {
    this.#startTime = startTime;
    this.#endTime = endTime;
    this.#timeZone = timeZone;
    this.#daysOfWeek = new Set(daysOfWeek);
    Object.freeze(this);
  }

  static create(
    startTime: string,
    endTime: string,
    timeZone = 'Asia/Tokyo',
    daysOfWeek: number[] = [0, 1, 2, 3, 4, 5, 6] // All days by default
  ): TimeWindow {
    if (!TimeWindow.isValidTimeFormat(startTime) || !TimeWindow.isValidTimeFormat(endTime)) {
      throw new Error('Time must be in HH:mm format');
    }

    if (!daysOfWeek || daysOfWeek.length === 0) {
      throw new Error('At least one day of week must be specified');
    }

    const invalidDays = daysOfWeek.filter((day) => day < 0 || day > 6);
    if (invalidDays.length > 0) {
      throw new Error('Days of week must be between 0 (Sunday) and 6 (Saturday)');
    }

    return new TimeWindow(startTime, endTime, timeZone, daysOfWeek);
  }

  static reconstruct(
    startTime: string,
    endTime: string,
    timeZone: string,
    daysOfWeek: number[]
  ): TimeWindow {
    return new TimeWindow(startTime, endTime, timeZone, daysOfWeek);
  }

  private static isValidTimeFormat(time: string): boolean {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
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

  get daysOfWeek(): number[] {
    return Array.from(this.#daysOfWeek).sort();
  }

  contains(date: Date = new Date()): boolean {
    // Check day of week first
    const dayOfWeek = date.getUTCDay(); // 0 = Sunday
    if (!this.#daysOfWeek.has(dayOfWeek)) {
      return false;
    }

    // Check time range
    const timeString = date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      timeZone: this.#timeZone,
    });

    return this.isTimeInRange(timeString, this.#startTime, this.#endTime);
  }

  private isTimeInRange(current: string, start: string, end: string): boolean {
    const currentMinutes = this.timeToMinutes(current);
    const startMinutes = this.timeToMinutes(start);
    const endMinutes = this.timeToMinutes(end);

    if (startMinutes <= endMinutes) {
      // Same day range (e.g., 09:00-17:00)
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }
    // Overnight range (e.g., 22:00-06:00)
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  isDuringBusinessHours(date: Date = new Date()): boolean {
    return this.contains(date);
  }

  getNextActiveTime(from: Date = new Date()): Date {
    const startOfDay = new Date(from);
    startOfDay.setHours(0, 0, 0, 0);

    // Try next 14 days to find the next active window
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const checkDate = new Date(startOfDay);
      checkDate.setDate(checkDate.getDate() + dayOffset);

      const dayOfWeek = checkDate.getUTCDay();
      if (this.#daysOfWeek.has(dayOfWeek)) {
        const [startHour, startMinute] = this.#startTime.split(':').map(Number);
        const activeTime = new Date(checkDate);
        activeTime.setHours(startHour, startMinute, 0, 0);

        if (activeTime > from) {
          return activeTime;
        }
      }
    }

    // Fallback: return start of next week
    const nextWeek = new Date(from);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const [startHour, startMinute] = this.#startTime.split(':').map(Number);
    nextWeek.setHours(startHour, startMinute, 0, 0);
    return nextWeek;
  }

  toJSON(): any {
    return {
      startTime: this.#startTime,
      endTime: this.#endTime,
      timeZone: this.#timeZone,
      daysOfWeek: this.daysOfWeek,
    };
  }
}
