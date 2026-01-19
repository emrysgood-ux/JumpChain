/**
 * Epic Fiction Architect - Character Age Calculator
 *
 * Critical for stories with:
 * - Non-human species with different lifespans
 * - Hybrid characters with mixed aging
 * - Time dilation/stasis effects
 * - Flashbacks/flashforwards
 * - Multi-generational sagas
 *
 * Key Example: Tenchi Muyo Universe
 * - Juraians can live thousands of years
 * - Kiyone Masaki died at 248 but appeared ~25
 * - Yosho is 700+ but appeared 70-80
 * - Tenchi is half-Juraian with uncertain aging
 */

import {DatabaseManager} from '../../db/database';
import {CalendarEngine} from './calendar';
import type {
  TimelineDate,
  Species,
  Character,
  AgingCurvePoint
} from '../../core/types';

// ============================================================================
// AGE CALCULATION RESULT
// ============================================================================

export interface AgeResult {
  /** Actual years since birth */
  chronologicalAge: number;

  /** How old the character appears */
  apparentAge: number;

  /** Description like "child", "adult", "elder" */
  ageCategory: string;

  /** Percentage of expected lifespan */
  lifespanProgress?: number;

  /** Is character in prime years? */
  inPrime: boolean;

  /** Special notes (e.g., "aging slowed by tree bond") */
  notes: string[];
}

export interface AgeComparison {
  character1Name: string;
  character2Name: string;
  chronologicalDifference: number;
  apparentDifference: number;
  relationship: 'older' | 'younger' | 'same';
  displayString: string;
}

// ============================================================================
// AGE CALCULATOR ENGINE
// ============================================================================

export class AgeCalculator {
  private db: DatabaseManager;
  private calendar: CalendarEngine;

  constructor(db: DatabaseManager, calendar: CalendarEngine) {
    this.db = db;
    this.calendar = calendar;
  }

  /**
   * Calculate character's age at a specific date
   */
  calculateAge(characterId: string, atDate: TimelineDate): AgeResult | null {
    const character = this.db.getCharacter(characterId);
    if (!character || !character.birthDate) {
      return null;
    }

    // Get species aging curve
    let species: Species | undefined;
    if (character.speciesId) {
      species = this.db.getSpecies(character.speciesId);
    }

    // Calculate chronological age
    const chronologicalAge = this.calculateChronologicalAge(character.birthDate, atDate);

    // Check if character is dead
    if (character.deathDate) {
      const deathDay = this.calendar.dateToDayNumber(character.deathDate);
      const targetDay = this.calendar.dateToDayNumber(atDate);
      if (targetDay > deathDay) {
        return {
          chronologicalAge: this.calculateChronologicalAge(character.birthDate, character.deathDate),
          apparentAge: this.calculateApparentAge(
            this.calculateChronologicalAge(character.birthDate, character.deathDate),
            species
          ),
          ageCategory: 'deceased',
          inPrime: false,
          notes: [`Died at age ${this.calculateChronologicalAge(character.birthDate, character.deathDate)}`]
        };
      }
    }

    // Calculate apparent age
    const apparentAge = this.calculateApparentAge(chronologicalAge, species);

    // Determine age category
    const ageCategory = this.getAgeCategory(chronologicalAge, apparentAge, species);

    // Calculate lifespan progress
    const lifespanProgress = species?.averageLifespan
      ? Math.min(100, (chronologicalAge / species.averageLifespan) * 100)
      : undefined;

    // Determine if in prime
    const inPrime = this.isInPrime(chronologicalAge, species);

    // Generate notes
    const notes = this.generateAgeNotes(character, chronologicalAge, apparentAge, species);

    return {
      chronologicalAge,
      apparentAge,
      ageCategory,
      lifespanProgress,
      inPrime,
      notes
    };
  }

  /**
   * Calculate chronological age (calendar years)
   */
  private calculateChronologicalAge(birthDate: TimelineDate, atDate: TimelineDate): number {
    // If different calendars, this is complex - use day numbers
    if (birthDate.calendarId !== atDate.calendarId) {
      // Simplified: assume same day length between calendars
      const birthDays = this.calendar.dateToDayNumber(birthDate);
      const atDays = this.calendar.dateToDayNumber(atDate);
      const daysInYear = this.calendar.getDaysInYear(birthDate.calendarId);
      return (atDays - birthDays) / daysInYear;
    }

    // Same calendar - straightforward
    let age = atDate.year - birthDate.year;

    // Adjust for month/day if we haven't reached birthday yet
    if (birthDate.month !== undefined && atDate.month !== undefined) {
      if (atDate.month < birthDate.month) {
        age--;
      } else if (atDate.month === birthDate.month) {
        if (birthDate.day !== undefined && atDate.day !== undefined) {
          if (atDate.day < birthDate.day) {
            age--;
          }
        }
      }
    }

    return Math.max(0, age);
  }

  /**
   * Calculate apparent age based on species aging curve
   */
  private calculateApparentAge(chronologicalAge: number, species?: Species): number {
    if (!species || !species.agingCurve || species.agingCurve.length === 0) {
      // Human aging (1:1)
      return chronologicalAge;
    }

    const curve = species.agingCurve.sort((a, b) => a.chronologicalAge - b.chronologicalAge);

    // Handle ages below the curve start
    if (chronologicalAge <= curve[0].chronologicalAge) {
      // Linear interpolation from 0
      const ratio = curve[0].apparentAge / curve[0].chronologicalAge;
      return chronologicalAge * ratio;
    }

    // Handle ages above the curve end
    const lastPoint = curve[curve.length - 1];
    if (chronologicalAge >= lastPoint.chronologicalAge) {
      // Extrapolate from last segment
      if (curve.length >= 2) {
        const secondLast = curve[curve.length - 2];
        const rate = (lastPoint.apparentAge - secondLast.apparentAge) /
          (lastPoint.chronologicalAge - secondLast.chronologicalAge);
        const extraYears = chronologicalAge - lastPoint.chronologicalAge;
        return lastPoint.apparentAge + (extraYears * rate);
      }
      return lastPoint.apparentAge;
    }

    // Find surrounding points and interpolate
    for (let i = 0; i < curve.length - 1; i++) {
      if (curve[i].chronologicalAge <= chronologicalAge &&
          curve[i + 1].chronologicalAge > chronologicalAge) {
        const lower = curve[i];
        const upper = curve[i + 1];
        const range = upper.chronologicalAge - lower.chronologicalAge;
        const progress = (chronologicalAge - lower.chronologicalAge) / range;
        return lower.apparentAge + (progress * (upper.apparentAge - lower.apparentAge));
      }
    }

    return chronologicalAge;
  }

  /**
   * Get age category from species curve labels or defaults
   */
  private getAgeCategory(
    chronologicalAge: number,
    apparentAge: number,
    species?: Species
  ): string {
    // Check species curve for labels
    if (species?.agingCurve) {
      const sortedCurve = species.agingCurve
        .filter(p => p.label)
        .sort((a, b) => a.chronologicalAge - b.chronologicalAge);

      let category = 'Adult';
      for (const point of sortedCurve) {
        if (chronologicalAge >= point.chronologicalAge && point.label) {
          category = point.label;
        }
      }
      return category;
    }

    // Default human-like categories based on apparent age
    if (apparentAge < 3) return 'Infant';
    if (apparentAge < 13) return 'Child';
    if (apparentAge < 20) return 'Adolescent';
    if (apparentAge < 40) return 'Young Adult';
    if (apparentAge < 60) return 'Middle-aged';
    if (apparentAge < 80) return 'Senior';
    return 'Elderly';
  }

  /**
   * Check if character is in their prime years
   */
  private isInPrime(chronologicalAge: number, species?: Species): boolean {
    if (species?.maturityAge && species?.elderAge) {
      return chronologicalAge >= species.maturityAge && chronologicalAge < species.elderAge;
    }

    // Default human prime: 20-50
    const apparentAge = this.calculateApparentAge(chronologicalAge, species);
    return apparentAge >= 20 && apparentAge < 50;
  }

  /**
   * Generate contextual notes about the character's age
   */
  private generateAgeNotes(
    character: Character,
    chronologicalAge: number,
    apparentAge: number,
    species?: Species
  ): string[] {
    const notes: string[] = [];

    // Significant age difference
    const ageDiff = Math.abs(chronologicalAge - apparentAge);
    if (ageDiff > 10) {
      if (apparentAge < chronologicalAge) {
        notes.push(`Appears ${Math.round(chronologicalAge - apparentAge)} years younger than chronological age`);
      } else {
        notes.push(`Appears ${Math.round(apparentAge - chronologicalAge)} years older than chronological age`);
      }
    }

    // Species-specific notes
    if (species) {
      if (species.averageLifespan && chronologicalAge > species.averageLifespan * 0.8) {
        notes.push(`Approaching end of typical ${species.name} lifespan`);
      }

      if (species.maturityAge && chronologicalAge < species.maturityAge) {
        const yearsToMaturity = species.maturityAge - chronologicalAge;
        notes.push(`${yearsToMaturity} years until full maturity`);
      }
    }

    // Milestone ages
    const milestones = [100, 500, 1000, 5000, 10000];
    for (const milestone of milestones) {
      if (chronologicalAge >= milestone && chronologicalAge < milestone + 1) {
        notes.push(`Just reached ${milestone} years old`);
      }
    }

    return notes;
  }

  /**
   * Get ages for all characters at a date
   */
  getAllCharacterAges(
    projectId: string,
    atDate: TimelineDate
  ): Map<string, AgeResult | null> {
    const characters = this.db.getStoryElementsByType(projectId, 'character' as any);
    const results = new Map<string, AgeResult | null>();

    for (const element of characters) {
      const age = this.calculateAge(element.id, atDate);
      results.set(element.id, age);
    }

    return results;
  }

  /**
   * Compare ages of two characters
   */
  compareAges(
    character1Id: string,
    character2Id: string,
    atDate: TimelineDate
  ): AgeComparison | null {
    const char1 = this.db.getCharacter(character1Id);
    const char2 = this.db.getCharacter(character2Id);

    if (!char1 || !char2) return null;

    const age1 = this.calculateAge(character1Id, atDate);
    const age2 = this.calculateAge(character2Id, atDate);

    if (!age1 || !age2) return null;

    const chronoDiff = age1.chronologicalAge - age2.chronologicalAge;
    const apparentDiff = age1.apparentAge - age2.apparentAge;

    let relationship: 'older' | 'younger' | 'same';
    if (Math.abs(chronoDiff) < 1) {
      relationship = 'same';
    } else if (chronoDiff > 0) {
      relationship = 'older';
    } else {
      relationship = 'younger';
    }

    // Generate display string
    let displayString: string;
    if (relationship === 'same') {
      displayString = `${char1.name} and ${char2.name} are the same age`;
    } else {
      const olderChar = chronoDiff > 0 ? char1.name : char2.name;
      const youngerChar = chronoDiff > 0 ? char2.name : char1.name;
      displayString = `${olderChar} is ${Math.abs(Math.round(chronoDiff))} years older than ${youngerChar}`;

      if (Math.abs(apparentDiff) !== Math.abs(chronoDiff)) {
        displayString += ` (but appears ${Math.abs(Math.round(apparentDiff))} years ${apparentDiff > 0 ? 'older' : 'younger'})`;
      }
    }

    return {
      character1Name: char1.name,
      character2Name: char2.name,
      chronologicalDifference: chronoDiff,
      apparentDifference: apparentDiff,
      relationship,
      displayString
    };
  }

  /**
   * Find when a character reaches a specific apparent age
   */
  findDateAtApparentAge(
    characterId: string,
    targetApparentAge: number
  ): TimelineDate | null {
    const character = this.db.getCharacter(characterId);
    if (!character?.birthDate) return null;

    const species = character.speciesId
      ? this.db.getSpecies(character.speciesId)
      : undefined;

    // Binary search for the chronological age that gives target apparent age
    let low = 0;
    let high = species?.averageLifespan ?? 200;
    const tolerance = 0.5; // Half a year tolerance

    while (high - low > tolerance) {
      const mid = (low + high) / 2;
      const apparent = this.calculateApparentAge(mid, species);

      if (apparent < targetApparentAge) {
        low = mid;
      } else {
        high = mid;
      }
    }

    const chronoAge = Math.round((low + high) / 2);
    return this.calendar.addYears(character.birthDate, chronoAge);
  }

  /**
   * Get character's age at each chapter/scene
   */
  getAgeTimeline(characterId: string): {sceneId: string; sceneTitle: string; date: TimelineDate; age: AgeResult}[] {
    const character = this.db.getCharacter(characterId);
    if (!character?.birthDate) return [];

    // Get all scenes with dates
    const scenes = this.db.all<{
      id: string;
      title: string;
      date: string;
    }>(
      `SELECT id, title, date FROM scenes WHERE date IS NOT NULL AND project_id = (
        SELECT project_id FROM story_elements WHERE id = ?
      ) ORDER BY json_extract(date, '$.year'), json_extract(date, '$.month'), json_extract(date, '$.day')`,
      [characterId]
    );

    const timeline: {sceneId: string; sceneTitle: string; date: TimelineDate; age: AgeResult}[] = [];

    for (const scene of scenes) {
      const date = JSON.parse(scene.date) as TimelineDate;
      const age = this.calculateAge(characterId, date);
      if (age) {
        timeline.push({
          sceneId: scene.id,
          sceneTitle: scene.title,
          date,
          age
        });
      }
    }

    return timeline;
  }
}

// ============================================================================
// PRE-BUILT SPECIES AGING CURVES
// ============================================================================

export const speciesAgingTemplates = {
  human: {
    name: 'Human',
    averageLifespan: 85,
    maturityAge: 18,
    elderAge: 65,
    agingCurve: [
      {chronologicalAge: 0, apparentAge: 0, label: 'Infant'},
      {chronologicalAge: 3, apparentAge: 3, label: 'Toddler'},
      {chronologicalAge: 12, apparentAge: 12, label: 'Child'},
      {chronologicalAge: 18, apparentAge: 18, label: 'Adult'},
      {chronologicalAge: 40, apparentAge: 40, label: 'Middle-aged'},
      {chronologicalAge: 65, apparentAge: 65, label: 'Senior'},
      {chronologicalAge: 85, apparentAge: 85, label: 'Elderly'}
    ]
  },

  juraian: {
    name: 'Juraian',
    averageLifespan: 5000,
    maturityAge: 200,
    elderAge: 4000,
    agingCurve: [
      {chronologicalAge: 0, apparentAge: 0, label: 'Infant'},
      {chronologicalAge: 20, apparentAge: 5, label: 'Child'},
      {chronologicalAge: 100, apparentAge: 15, label: 'Adolescent'},
      {chronologicalAge: 200, apparentAge: 20, label: 'Young Adult'},
      {chronologicalAge: 500, apparentAge: 25, label: 'Adult'},
      {chronologicalAge: 1000, apparentAge: 30, label: 'Adult'},
      {chronologicalAge: 2000, apparentAge: 40, label: 'Mature'},
      {chronologicalAge: 3000, apparentAge: 55, label: 'Mature'},
      {chronologicalAge: 4000, apparentAge: 70, label: 'Elder'},
      {chronologicalAge: 5000, apparentAge: 85, label: 'Ancient'}
    ]
  },

  juraianHybrid: {
    name: 'Juraian-Human Hybrid',
    averageLifespan: 2500,
    maturityAge: 100,
    elderAge: 2000,
    agingCurve: [
      {chronologicalAge: 0, apparentAge: 0, label: 'Infant'},
      {chronologicalAge: 10, apparentAge: 5, label: 'Child'},
      {chronologicalAge: 30, apparentAge: 12, label: 'Child'},
      {chronologicalAge: 60, apparentAge: 16, label: 'Adolescent'},
      {chronologicalAge: 100, apparentAge: 20, label: 'Young Adult'},
      {chronologicalAge: 300, apparentAge: 25, label: 'Adult'},
      {chronologicalAge: 600, apparentAge: 30, label: 'Adult'},
      {chronologicalAge: 1200, apparentAge: 40, label: 'Mature'},
      {chronologicalAge: 2000, apparentAge: 60, label: 'Elder'},
      {chronologicalAge: 2500, apparentAge: 80, label: 'Ancient'}
    ]
  },

  elf: {
    name: 'Elf (Standard Fantasy)',
    averageLifespan: 750,
    maturityAge: 100,
    elderAge: 600,
    agingCurve: [
      {chronologicalAge: 0, apparentAge: 0, label: 'Infant'},
      {chronologicalAge: 20, apparentAge: 8, label: 'Child'},
      {chronologicalAge: 50, apparentAge: 14, label: 'Adolescent'},
      {chronologicalAge: 100, apparentAge: 20, label: 'Young Adult'},
      {chronologicalAge: 200, apparentAge: 25, label: 'Adult'},
      {chronologicalAge: 400, apparentAge: 35, label: 'Mature'},
      {chronologicalAge: 600, apparentAge: 50, label: 'Elder'},
      {chronologicalAge: 750, apparentAge: 70, label: 'Ancient'}
    ]
  },

  dwarf: {
    name: 'Dwarf (Standard Fantasy)',
    averageLifespan: 350,
    maturityAge: 50,
    elderAge: 250,
    agingCurve: [
      {chronologicalAge: 0, apparentAge: 0, label: 'Infant'},
      {chronologicalAge: 15, apparentAge: 10, label: 'Child'},
      {chronologicalAge: 30, apparentAge: 16, label: 'Adolescent'},
      {chronologicalAge: 50, apparentAge: 20, label: 'Young Adult'},
      {chronologicalAge: 100, apparentAge: 30, label: 'Adult'},
      {chronologicalAge: 200, apparentAge: 50, label: 'Mature'},
      {chronologicalAge: 300, apparentAge: 70, label: 'Elder'},
      {chronologicalAge: 350, apparentAge: 90, label: 'Ancient'}
    ]
  },

  vampire: {
    name: 'Vampire (Immortal)',
    averageLifespan: undefined, // Immortal
    maturityAge: 100,
    elderAge: undefined, // Never ages past prime
    agingCurve: [
      // Vampires freeze at the age they were turned
      // This is a default; actual age depends on turn age
      {chronologicalAge: 0, apparentAge: 25, label: 'Fledgling'},
      {chronologicalAge: 100, apparentAge: 25, label: 'Young Vampire'},
      {chronologicalAge: 500, apparentAge: 25, label: 'Mature Vampire'},
      {chronologicalAge: 1000, apparentAge: 25, label: 'Elder Vampire'},
      {chronologicalAge: 5000, apparentAge: 25, label: 'Ancient'}
    ]
  }
};
