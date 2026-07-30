import { z } from 'zod';

/** Operating window for schedule sessions (inclusive). */
export const SCHEDULE_WINDOW_START = '06:00';
export const SCHEDULE_WINDOW_END = '20:00';

export const SCHEDULE_WINDOW_START_MINUTES = 6 * 60;
export const SCHEDULE_WINDOW_END_MINUTES = 20 * 60;

export function timeToMinutes(time: string): number {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return NaN;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return NaN;
  }
  return hours * 60 + minutes;
}

export function minutesToTime(total: number): string {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, total));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Clamp a clock hour so start+1h can still end by 8 PM. */
export function clampScheduleStartHour(hour: number): number {
  return Math.min(19, Math.max(6, hour));
}

export function formatScheduleHourLabel(hour: number): string {
  if (hour === 12) return '12 PM';
  if (hour === 0) return '12 AM';
  if (hour > 12) return `${hour - 12} PM`;
  return `${hour} AM`;
}

/**
 * Zod refine: start/end required within 6:00–20:00 and end after start.
 * Attach with `.superRefine(refineSessionTimeWindow)`.
 */
export function refineSessionTimeWindow(
  data: { startTime: string; endTime: string },
  ctx: z.RefinementCtx
) {
  const start = timeToMinutes(data.startTime);
  const end = timeToMinutes(data.endTime);

  if (Number.isNaN(start)) {
    ctx.addIssue({
      code: 'custom',
      path: ['startTime'],
      message: 'Enter a valid start time',
    });
    return;
  }
  if (Number.isNaN(end)) {
    ctx.addIssue({
      code: 'custom',
      path: ['endTime'],
      message: 'Enter a valid end time',
    });
    return;
  }

  if (start < SCHEDULE_WINDOW_START_MINUTES || start >= SCHEDULE_WINDOW_END_MINUTES) {
    ctx.addIssue({
      code: 'custom',
      path: ['startTime'],
      message: 'Start time must be from 6:00 AM and before 8:00 PM',
    });
  }

  if (end <= SCHEDULE_WINDOW_START_MINUTES || end > SCHEDULE_WINDOW_END_MINUTES) {
    ctx.addIssue({
      code: 'custom',
      path: ['endTime'],
      message: 'End time must be after 6:00 AM and no later than 8:00 PM',
    });
  }

  if (end <= start) {
    ctx.addIssue({
      code: 'custom',
      path: ['endTime'],
      message: 'End time must be after start time',
    });
  }
}
