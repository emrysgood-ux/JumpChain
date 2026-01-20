/**
 * Epic Fiction Architect - Calendar System Engine
 *
 * Handles custom fantasy calendars with:
 * - Non-standard month lengths
 * - Multiple moons with phase tracking
 * - Era/epoch systems
 * - Real-world date conversion
 * - Holiday and season calculation
 */

import {DatabaseManager} from '../../db/database';
import type {
  CalendarSystem,
  CalendarHoliday,
  TimelineDate
} from '../../core/types';

// ============================================================================
// CALENDAR ENGINE
// ============================================================================

export class CalendarEngine {
  private db: DatabaseManager;
  private calendarCache: Map<string, CalendarSystem> = new Map();

  constructor(db: DatabaseManager) {
    this.db = db;
  }

  /**
   * Get or load calendar system
   */
  getCalendar(calendarId: string): CalendarSystem | undefined {
    if (this.calendarCache.has(calendarId)) {
      return this.calendarCache.get(calendarId);
    }

    const calendar = this.db.getCalendar(calendarId);
    if (calendar) {
      this.calendarCache.set(calendarId, calendar);
    }
    return calendar;
  }

  /**
   * Clear calendar cache (call after calendar modifications)
   */
  clearCache(): void {
    this.calendarCache.clear();
  }

  // ==========================================================================
  // DATE CALCULATIONS
  // ==========================================================================

  /**
   * Get total days in a year for a calendar
   */
  getDaysInYear(calendarId: string): number {
    const calendar = this.getCalendar(calendarId);
    if (!calendar) return 365; // Default to Earth

    return calendar.months.reduce((sum, month) => sum + month.days, 0);
  }

  /**
   * Get days in a specific month
   */
  getDaysInMonth(calendarId: string, monthNumber: number): number {
    const calendar = this.getCalendar(calendarId);
    if (!calendar) return 30;

    const month = calendar.months.find(m => m.order === monthNumber);
    return month?.days ?? 30;
  }

  /**
   * Get month name
   */
  getMonthName(calendarId: string, monthNumber: number): string {
    const calendar = this.getCalendar(calendarId);
    if (!calendar) return `Month ${monthNumber}`;

    const month = calendar.months.find(m => m.order === monthNumber);
    return month?.name ?? `Month ${monthNumber}`;
  }

  /**
   * Get weekday name for a given date
   */
  getWeekdayName(date: TimelineDate): string {
    const calendar = this.getCalendar(date.calendarId);
    if (!calendar || calendar.weekdays.length === 0) return '';

    // Calculate day of week
    const totalDays = this.dateToDayNumber(date);
    const weekLength = calendar.weekdays.length;
    const dayOfWeek = ((totalDays % weekLength) + weekLength) % weekLength;

    const weekday = calendar.weekdays.find(w => w.order === dayOfWeek);
    return weekday?.name ?? '';
  }

  /**
   * Convert a date to a total day number (for calculations)
   */
  dateToDayNumber(date: TimelineDate): number {
    const calendar = this.getCalendar(date.calendarId);
    const daysInYear = this.getDaysInYear(date.calendarId);

    let totalDays = date.year * daysInYear;

    if (date.month !== undefined && calendar) {
      // Add days from previous months
      for (const month of calendar.months) {
        if (month.order < date.month) {
          totalDays += month.days;
        }
      }
    }

    if (date.day !== undefined) {
      totalDays += date.day - 1; // Days are 1-indexed
    }

    return totalDays;
  }

  /**
   * Convert day number back to a date
   */
  dayNumberToDate(dayNumber: number, calendarId: string): TimelineDate {
    const calendar = this.getCalendar(calendarId);
    const daysInYear = this.getDaysInYear(calendarId);

    // Calculate year
    let year = Math.floor(dayNumber / daysInYear);
    let remainingDays = dayNumber - (year * daysInYear);

    // Handle negative day numbers
    if (remainingDays < 0) {
      year--;
      remainingDays += daysInYear;
    }

    // Calculate month and day
    let month = 1;
    let day = 1;

    if (calendar) {
      for (const m of calendar.months.sort((a, b) => a.order - b.order)) {
        if (remainingDays < m.days) {
          month = m.order;
          day = remainingDays + 1;
          break;
        }
        remainingDays -= m.days;
      }
    }

    return {
      calendarId,
      year,
      month,
      day,
      precision: 'day',
      isApproximate: false
    };
  }

  /**
   * Calculate days between two dates
   */
  daysBetween(date1: TimelineDate, date2: TimelineDate): number {
    if (date1.calendarId !== date2.calendarId) {
      throw new Error('Cannot calculate days between dates in different calendars');
    }

    const day1 = this.dateToDayNumber(date1);
    const day2 = this.dateToDayNumber(date2);
    return day2 - day1;
  }

  /**
   * Add days to a date
   */
  addDays(date: TimelineDate, days: number): TimelineDate {
    const dayNumber = this.dateToDayNumber(date);
    const newDate = this.dayNumberToDate(dayNumber + days, date.calendarId);

    // Preserve time if present
    if (date.hour !== undefined) {
      newDate.hour = date.hour;
      newDate.precision = 'hour';
    }
    if (date.minute !== undefined) {
      newDate.minute = date.minute;
      newDate.precision = 'minute';
    }

    return newDate;
  }

  /**
   * Add months to a date
   */
  addMonths(date: TimelineDate, months: number): TimelineDate {
    const calendar = this.getCalendar(date.calendarId);
    if (!calendar) {
      // Simple fallback: 30 days per month
      return this.addDays(date, months * 30);
    }

    const monthCount = calendar.months.length;
    let newMonth = (date.month ?? 1) + months;
    let yearOffset = Math.floor((newMonth - 1) / monthCount);
    newMonth = ((newMonth - 1) % monthCount) + 1;

    if (newMonth <= 0) {
      newMonth += monthCount;
      yearOffset--;
    }

    const newDate: TimelineDate = {
      calendarId: date.calendarId,
      year: date.year + yearOffset,
      month: newMonth,
      day: date.day,
      precision: date.precision,
      isApproximate: date.isApproximate
    };

    // Clamp day to valid range for new month
    const daysInNewMonth = this.getDaysInMonth(date.calendarId, newMonth);
    if (newDate.day !== undefined && newDate.day > daysInNewMonth) {
      newDate.day = daysInNewMonth;
    }

    return newDate;
  }

  /**
   * Add years to a date
   */
  addYears(date: TimelineDate, years: number): TimelineDate {
    return {
      ...date,
      year: date.year + years
    };
  }

  // ==========================================================================
  // FORMAT & DISPLAY
  // ==========================================================================

  /**
   * Format a date for display
   */
  formatDate(date: TimelineDate, format: 'short' | 'long' | 'full' = 'long'): string {
    const calendar = this.getCalendar(date.calendarId);

    const yearStr = this.formatYear(date, calendar);
    const monthName = date.month !== undefined ? this.getMonthName(date.calendarId, date.month) : undefined;
    const dayStr = date.day?.toString();
    const weekdayName = format === 'full' ? this.getWeekdayName(date) : undefined;

    switch (date.precision) {
      case 'year':
        return yearStr;

      case 'month':
        return `${monthName} ${yearStr}`;

      case 'day':
      case 'hour':
      case 'minute':
      case 'exact':
        if (format === 'short') {
          return `${date.month}/${date.day}/${date.year}`;
        } else if (format === 'full' && weekdayName) {
          return `${weekdayName}, ${monthName} ${dayStr}, ${yearStr}`;
        } else {
          return `${monthName} ${dayStr}, ${yearStr}`;
        }

      default:
        return yearStr;
    }
  }

  /**
   * Format year with era
   */
  private formatYear(date: TimelineDate, calendar?: CalendarSystem): string {
    const yearZero = calendar?.yearZero ?? 0;
    const adjustedYear = date.year - yearZero;

    if (adjustedYear >= 0) {
      return `${adjustedYear} ${calendar?.eraName ?? 'CE'}`;
    } else {
      return `${Math.abs(adjustedYear)} ${calendar?.eraNegativeName ?? 'BCE'}`;
    }
  }

  /**
   * Parse a date string (basic parsing)
   */
  parseDate(dateStr: string, calendarId: string): TimelineDate | null {
    // Try common formats
    const patterns = [
      /^(\d+)\/(\d+)\/(-?\d+)$/, // M/D/Y
      /^(\d+)-(\d+)-(-?\d+)$/, // M-D-Y
      /^(-?\d+)$/ // Year only
    ];

    for (const pattern of patterns) {
      const match = dateStr.match(pattern);
      if (match) {
        if (match.length === 2) {
          return {
            calendarId,
            year: parseInt(match[1], 10),
            precision: 'year',
            isApproximate: false
          };
        } else {
          return {
            calendarId,
            year: parseInt(match[3], 10),
            month: parseInt(match[1], 10),
            day: parseInt(match[2], 10),
            precision: 'day',
            isApproximate: false
          };
        }
      }
    }

    return null;
  }

  // ==========================================================================
  // MOON PHASES
  // ==========================================================================

  /**
   * Get moon phase for a given date
   */
  getMoonPhase(date: TimelineDate, moonId: string): {phase: string; dayInCycle: number} | null {
    const calendar = this.getCalendar(date.calendarId);
    if (!calendar?.moons) return null;

    const moon = calendar.moons.find(m => m.id === moonId);
    if (!moon) return null;

    const dayNumber = this.dateToDayNumber(date);
    const dayInCycle = dayNumber % moon.cycleLength;
    const phaseIndex = Math.floor((dayInCycle / moon.cycleLength) * moon.phases.length);

    return {
      phase: moon.phases[phaseIndex] ?? 'Unknown',
      dayInCycle
    };
  }

  /**
   * Get all moon phases for a date
   */
  getAllMoonPhases(date: TimelineDate): {moonName: string; phase: string; dayInCycle: number}[] {
    const calendar = this.getCalendar(date.calendarId);
    if (!calendar?.moons) return [];

    return calendar.moons.map(moon => {
      const phaseInfo = this.getMoonPhase(date, moon.id);
      return {
        moonName: moon.name,
        phase: phaseInfo?.phase ?? 'Unknown',
        dayInCycle: phaseInfo?.dayInCycle ?? 0
      };
    });
  }

  /**
   * Find next occurrence of a specific moon phase
   */
  findNextMoonPhase(startDate: TimelineDate, moonId: string, targetPhase: string): TimelineDate | null {
    const calendar = this.getCalendar(startDate.calendarId);
    if (!calendar?.moons) return null;

    const moon = calendar.moons.find(m => m.id === moonId);
    if (!moon) return null;

    const targetPhaseIndex = moon.phases.indexOf(targetPhase);
    if (targetPhaseIndex === -1) return null;

    // Search forward up to 2 cycles
    for (let dayOffset = 0; dayOffset <= moon.cycleLength * 2; dayOffset++) {
      const checkDate = this.addDays(startDate, dayOffset);
      const phaseInfo = this.getMoonPhase(checkDate, moonId);
      if (phaseInfo?.phase === targetPhase) {
        return checkDate;
      }
    }

    return null;
  }

  // ==========================================================================
  // SEASONS
  // ==========================================================================

  /**
   * Get current season for a date
   */
  getSeason(date: TimelineDate): string | null {
    const calendar = this.getCalendar(date.calendarId);
    if (!calendar?.seasons || date.month === undefined || date.day === undefined) {
      return null;
    }

    for (const season of calendar.seasons) {
      const isInSeason = this.isDateInRange(
        date.month,
        date.day,
        season.startMonth,
        season.startDay,
        season.endMonth,
        season.endDay
      );

      if (isInSeason) {
        return season.name;
      }
    }

    return null;
  }

  private isDateInRange(
    month: number,
    day: number,
    startMonth: number,
    startDay: number,
    endMonth: number,
    endDay: number
  ): boolean {
    const current = month * 100 + day;
    const start = startMonth * 100 + startDay;
    const end = endMonth * 100 + endDay;

    if (start <= end) {
      // Normal range (e.g., March to June)
      return current >= start && current <= end;
    } else {
      // Wrapping range (e.g., November to February)
      return current >= start || current <= end;
    }
  }

  // ==========================================================================
  // HOLIDAYS
  // ==========================================================================

  /**
   * Get holidays for a specific date
   */
  getHolidays(date: TimelineDate): CalendarHoliday[] {
    if (date.month === undefined || date.day === undefined) {
      return [];
    }

    const holidays = this.db.all<{
      id: string;
      calendar_id: string;
      name: string;
      month: number;
      day: number;
      description: string | null;
      recurring: number;
      year_introduced: number | null;
    }>(
      `SELECT * FROM calendar_holidays
       WHERE calendar_id = ? AND month = ? AND day = ?
       AND (recurring = 1 OR year_introduced IS NULL OR year_introduced <= ?)`,
      [date.calendarId, date.month, date.day, date.year]
    );

    return holidays.map(h => ({
      id: h.id,
      calendarId: h.calendar_id,
      name: h.name,
      month: h.month,
      day: h.day,
      description: h.description ?? undefined,
      recurring: h.recurring === 1,
      yearIntroduced: h.year_introduced ?? undefined
    }));
  }

  /**
   * Get all holidays in a month
   */
  getMonthHolidays(calendarId: string, year: number, month: number): CalendarHoliday[] {
    const holidays = this.db.all<{
      id: string;
      calendar_id: string;
      name: string;
      month: number;
      day: number;
      description: string | null;
      recurring: number;
      year_introduced: number | null;
    }>(
      `SELECT * FROM calendar_holidays
       WHERE calendar_id = ? AND month = ?
       AND (recurring = 1 OR year_introduced IS NULL OR year_introduced <= ?)
       ORDER BY day`,
      [calendarId, month, year]
    );

    return holidays.map(h => ({
      id: h.id,
      calendarId: h.calendar_id,
      name: h.name,
      month: h.month,
      day: h.day,
      description: h.description ?? undefined,
      recurring: h.recurring === 1,
      yearIntroduced: h.year_introduced ?? undefined
    }));
  }

  // ==========================================================================
  // REAL WORLD CONVERSION
  // ==========================================================================

  /**
   * Convert fantasy date to real-world date (if anchor is set)
   */
  toRealWorldDate(date: TimelineDate): Date | null {
    const calendar = this.getCalendar(date.calendarId);
    if (!calendar?.realWorldAnchor) return null;

    const anchor = calendar.realWorldAnchor;
    const anchorFantasy = this.parseDate(anchor.calendarDate, date.calendarId);
    if (!anchorFantasy) return null;

    const anchorReal = new Date(anchor.realWorldDate);
    if (isNaN(anchorReal.getTime())) return null;

    // Calculate days from anchor
    const daysDiff = this.daysBetween(anchorFantasy, date);

    // Add days to real-world anchor
    const result = new Date(anchorReal);
    result.setDate(result.getDate() + daysDiff);

    return result;
  }

  /**
   * Convert real-world date to fantasy date (if anchor is set)
   */
  fromRealWorldDate(realDate: Date, calendarId: string): TimelineDate | null {
    const calendar = this.getCalendar(calendarId);
    if (!calendar?.realWorldAnchor) return null;

    const anchor = calendar.realWorldAnchor;
    const anchorFantasy = this.parseDate(anchor.calendarDate, calendarId);
    if (!anchorFantasy) return null;

    const anchorReal = new Date(anchor.realWorldDate);
    if (isNaN(anchorReal.getTime())) return null;

    // Calculate days difference
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysDiff = Math.round((realDate.getTime() - anchorReal.getTime()) / msPerDay);

    // Add days to fantasy anchor
    return this.addDays(anchorFantasy, daysDiff);
  }
}

// ============================================================================
// CALENDAR TEMPLATES
// ============================================================================

export const calendarTemplates = {
  gregorian: {
    name: 'Gregorian (Earth)',
    yearZero: 0,
    eraName: 'CE',
    eraNegativeName: 'BCE',
    months: [
      {id: 'jan', name: 'January', shortName: 'Jan', days: 31, order: 1},
      {id: 'feb', name: 'February', shortName: 'Feb', days: 28, order: 2},
      {id: 'mar', name: 'March', shortName: 'Mar', days: 31, order: 3},
      {id: 'apr', name: 'April', shortName: 'Apr', days: 30, order: 4},
      {id: 'may', name: 'May', shortName: 'May', days: 31, order: 5},
      {id: 'jun', name: 'June', shortName: 'Jun', days: 30, order: 6},
      {id: 'jul', name: 'July', shortName: 'Jul', days: 31, order: 7},
      {id: 'aug', name: 'August', shortName: 'Aug', days: 31, order: 8},
      {id: 'sep', name: 'September', shortName: 'Sep', days: 30, order: 9},
      {id: 'oct', name: 'October', shortName: 'Oct', days: 31, order: 10},
      {id: 'nov', name: 'November', shortName: 'Nov', days: 30, order: 11},
      {id: 'dec', name: 'December', shortName: 'Dec', days: 31, order: 12}
    ],
    weekdays: [
      {id: 'sun', name: 'Sunday', shortName: 'Sun', order: 0},
      {id: 'mon', name: 'Monday', shortName: 'Mon', order: 1},
      {id: 'tue', name: 'Tuesday', shortName: 'Tue', order: 2},
      {id: 'wed', name: 'Wednesday', shortName: 'Wed', order: 3},
      {id: 'thu', name: 'Thursday', shortName: 'Thu', order: 4},
      {id: 'fri', name: 'Friday', shortName: 'Fri', order: 5},
      {id: 'sat', name: 'Saturday', shortName: 'Sat', order: 6}
    ],
    moons: [
      {name: 'Moon', cycleLength: 29.5, phases: ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent']}
    ]
  },

  juraian: {
    name: 'Juraian Standard',
    yearZero: 0,
    eraName: 'JSC', // Juraian Standard Calendar
    eraNegativeName: 'Pre-JSC',
    months: [
      {id: 'firstbloom', name: 'Firstbloom', days: 36, order: 1},
      {id: 'tsunami', name: 'Tsunami', days: 35, order: 2},
      {id: 'highgrowth', name: 'Highgrowth', days: 36, order: 3},
      {id: 'starcrest', name: 'Starcrest', days: 35, order: 4},
      {id: 'midyear', name: 'Midyear', days: 36, order: 5},
      {id: 'treewake', name: 'Treewake', days: 35, order: 6},
      {id: 'highsun', name: 'Highsun', days: 36, order: 7},
      {id: 'harvestide', name: 'Harvestide', days: 35, order: 8},
      {id: 'fallrest', name: 'Fallrest', days: 36, order: 9},
      {id: 'deepnight', name: 'Deepnight', days: 35, order: 10}
    ],
    weekdays: [
      {id: 'firstday', name: 'Firstday', shortName: 'Fir', order: 0},
      {id: 'seedday', name: 'Seedday', shortName: 'Sed', order: 1},
      {id: 'treesday', name: 'Treesday', shortName: 'Tre', order: 2},
      {id: 'midday', name: 'Midday', shortName: 'Mid', order: 3},
      {id: 'lightday', name: 'Lightday', shortName: 'Lig', order: 4},
      {id: 'starday', name: 'Starday', shortName: 'Sta', order: 5}
    ],
    moons: []
  },

  fantasy12: {
    name: 'Fantasy Standard (12 months)',
    yearZero: 1,
    eraName: 'AE', // After Empire
    eraNegativeName: 'BE', // Before Empire
    months: [
      {id: 'winterdeep', name: 'Winterdeep', days: 30, order: 1, season: 'Winter'},
      {id: 'icemelt', name: 'Icemelt', days: 28, order: 2, season: 'Winter'},
      {id: 'newspring', name: 'Newspring', days: 31, order: 3, season: 'Spring'},
      {id: 'rainmoon', name: 'Rainmoon', days: 30, order: 4, season: 'Spring'},
      {id: 'flowering', name: 'Flowering', days: 31, order: 5, season: 'Spring'},
      {id: 'highsun', name: 'Highsun', days: 30, order: 6, season: 'Summer'},
      {id: 'goldmoon', name: 'Goldmoon', days: 31, order: 7, season: 'Summer'},
      {id: 'harvest', name: 'Harvest', days: 31, order: 8, season: 'Summer'},
      {id: 'fallingleaf', name: 'Fallingleaf', days: 30, order: 9, season: 'Autumn'},
      {id: 'darkening', name: 'Darkening', days: 30, order: 10, season: 'Autumn'},
      {id: 'frostfall', name: 'Frostfall', days: 30, order: 11, season: 'Autumn'},
      {id: 'yearsend', name: 'Yearsend', days: 31, order: 12, season: 'Winter'}
    ],
    weekdays: [
      {id: 'sunday', name: 'Sunday', shortName: 'Sun', order: 0},
      {id: 'moonday', name: 'Moonday', shortName: 'Moo', order: 1},
      {id: 'starday', name: 'Starday', shortName: 'Sta', order: 2},
      {id: 'hearthday', name: 'Hearthday', shortName: 'Hea', order: 3},
      {id: 'workday', name: 'Workday', shortName: 'Wor', order: 4},
      {id: 'restday', name: 'Restday', shortName: 'Res', order: 5}
    ],
    moons: [
      {name: 'Silver Moon', cycleLength: 28, phases: ['New', 'Waxing', 'Full', 'Waning']},
      {name: 'Blood Moon', cycleLength: 63, phases: ['Hidden', 'Rising', 'Crimson', 'Fading']}
    ]
  }
};
