/**
 * Entity File Generator
 *
 * Generates formatted markdown and JSON files for story entities with
 * templates optimized for each entity type.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  Entity,
  EntityType,
  EntityStatus,
  CharacterEntity,
  LocationEntity,
  PowerEntity,
  ItemEntity,
  FactionEntity,
  EntityRegistry
} from './entity-registry';

// ============================================================================
// INTERFACES
// ============================================================================

export interface FileGeneratorConfig {
  basePath: string;
  format: 'markdown' | 'json' | 'both';
  includeMetadata: boolean;
  includeChangeHistory: boolean;
  includeReferences: boolean;
  createIndex: boolean;
  templateStyle: 'detailed' | 'compact' | 'wiki';
}

export interface GenerationResult {
  entityId: string;
  entityName: string;
  entityType: EntityType;
  markdownPath?: string;
  jsonPath?: string;
  success: boolean;
  error?: string;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const defaultConfig: FileGeneratorConfig = {
  basePath: './story-files',
  format: 'both',
  includeMetadata: true,
  includeChangeHistory: false,
  includeReferences: true,
  createIndex: true,
  templateStyle: 'detailed'
};

// ============================================================================
// FILE GENERATOR CLASS
// ============================================================================

export class EntityFileGenerator {
  private config: FileGeneratorConfig;
  private registry: EntityRegistry;

  constructor(registry: EntityRegistry, config?: Partial<FileGeneratorConfig>) {
    this.registry = registry;
    this.config = { ...defaultConfig, ...config };
  }

  // ==========================================================================
  // CONFIGURATION
  // ==========================================================================

  setConfig(config: Partial<FileGeneratorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ==========================================================================
  // MAIN GENERATION
  // ==========================================================================

  generateEntityFile(entity: Entity): GenerationResult {
    const result: GenerationResult = {
      entityId: entity.id,
      entityName: entity.name,
      entityType: entity.type,
      success: false
    };

    try {
      const safeName = this.getSafeName(entity.name);
      const typeDir = path.join(this.config.basePath, entity.type);

      // Ensure directory exists
      if (!fs.existsSync(typeDir)) {
        fs.mkdirSync(typeDir, { recursive: true });
      }

      // Generate markdown
      if (this.config.format === 'markdown' || this.config.format === 'both') {
        const mdPath = path.join(typeDir, `${safeName}.md`);
        const markdown = this.generateMarkdown(entity);
        fs.writeFileSync(mdPath, markdown);
        result.markdownPath = mdPath;
      }

      // Generate JSON
      if (this.config.format === 'json' || this.config.format === 'both') {
        const jsonPath = path.join(typeDir, `${safeName}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(entity, null, 2));
        result.jsonPath = jsonPath;
      }

      result.success = true;
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
    }

    return result;
  }

  generateAllEntityFiles(): GenerationResult[] {
    const results: GenerationResult[] = [];
    const entities = this.registry.getAllEntities();

    for (const entity of entities) {
      results.push(this.generateEntityFile(entity));
    }

    // Generate index files if configured
    if (this.config.createIndex) {
      this.generateIndexFiles();
    }

    return results;
  }

  generateEntityFilesByType(type: EntityType): GenerationResult[] {
    const results: GenerationResult[] = [];
    const entities = this.registry.getEntitiesByType(type);

    for (const entity of entities) {
      results.push(this.generateEntityFile(entity));
    }

    return results;
  }

  // ==========================================================================
  // MARKDOWN GENERATION
  // ==========================================================================

  private generateMarkdown(entity: Entity): string {
    switch (entity.type) {
      case EntityType.CHARACTER:
        return this.generateCharacterMarkdown(entity as CharacterEntity);
      case EntityType.LOCATION:
        return this.generateLocationMarkdown(entity as LocationEntity);
      case EntityType.POWER:
        return this.generatePowerMarkdown(entity as PowerEntity);
      case EntityType.ITEM:
        return this.generateItemMarkdown(entity as ItemEntity);
      case EntityType.FACTION:
        return this.generateFactionMarkdown(entity as FactionEntity);
      default:
        return this.generateGenericMarkdown(entity);
    }
  }

  private generateCharacterMarkdown(char: CharacterEntity): string {
    let md = `# ${char.name}\n\n`;

    // Quick reference box
    md += `> **Status:** ${char.status} | **Species:** ${char.species}`;
    if (char.age) md += ` | **Age:** ${char.age}`;
    md += `\n\n`;

    // Aliases
    if (char.aliases.length > 0) {
      md += `**Also known as:** ${char.aliases.join(', ')}\n\n`;
    }

    // Description
    md += `## Description\n\n${char.description || '_No description provided._'}\n\n`;

    // Physical Appearance
    if (char.appearance) {
      md += `## Physical Appearance\n\n`;
      md += `${char.appearance.physicalDescription || ''}\n\n`;

      if (char.appearance.height || char.appearance.build) {
        md += `- **Height:** ${char.appearance.height || 'Unknown'}\n`;
        md += `- **Build:** ${char.appearance.build || 'Unknown'}\n`;
      }
      if (char.appearance.hairColor) md += `- **Hair:** ${char.appearance.hairColor}\n`;
      if (char.appearance.eyeColor) md += `- **Eyes:** ${char.appearance.eyeColor}\n`;

      if (char.appearance.distinguishingFeatures.length > 0) {
        md += `\n**Distinguishing Features:**\n`;
        for (const feature of char.appearance.distinguishingFeatures) {
          md += `- ${feature}\n`;
        }
      }
      md += '\n';
    }

    // Personality
    if (char.personality) {
      md += `## Personality\n\n`;

      if (char.personality.traits.length > 0) {
        md += `**Traits:** ${char.personality.traits.join(', ')}\n\n`;
      }

      if (char.personality.strengths.length > 0) {
        md += `**Strengths:**\n`;
        for (const s of char.personality.strengths) md += `- ${s}\n`;
        md += '\n';
      }

      if (char.personality.weaknesses.length > 0) {
        md += `**Weaknesses:**\n`;
        for (const w of char.personality.weaknesses) md += `- ${w}\n`;
        md += '\n';
      }

      if (char.personality.fears.length > 0) {
        md += `**Fears:** ${char.personality.fears.join(', ')}\n\n`;
      }

      if (char.personality.desires.length > 0) {
        md += `**Desires:** ${char.personality.desires.join(', ')}\n\n`;
      }

      if (char.personality.quirks.length > 0) {
        md += `**Quirks:** ${char.personality.quirks.join(', ')}\n\n`;
      }
    }

    // Background
    if (char.background) {
      md += `## Background\n\n`;
      if (char.background.birthplace) md += `**Birthplace:** ${char.background.birthplace}\n`;
      if (char.background.occupation) md += `**Occupation:** ${char.background.occupation}\n`;
      if (char.background.socialClass) md += `**Social Class:** ${char.background.socialClass}\n`;
      if (char.background.education) md += `**Education:** ${char.background.education}\n`;
      md += `\n${char.background.history || ''}\n\n`;
    }

    // Powers & Skills
    if (char.powers.length > 0 || char.skills.length > 0) {
      md += `## Abilities\n\n`;

      if (char.powers.length > 0) {
        md += `### Powers\n`;
        for (const powerId of char.powers) {
          const power = this.registry.getEntity<PowerEntity>(powerId);
          if (power) {
            md += `- [[${power.name}]]\n`;
          } else {
            md += `- _Unknown Power (${powerId})_\n`;
          }
        }
        md += '\n';
      }

      if (char.skills.length > 0) {
        md += `### Skills\n`;
        for (const skill of char.skills) {
          md += `- **${skill.name}** (${skill.level})\n`;
        }
        md += '\n';
      }
    }

    // Relationships
    if (char.relationships.length > 0) {
      md += `## Relationships\n\n`;
      for (const rel of char.relationships) {
        const other = this.registry.getEntity<CharacterEntity>(rel.characterId);
        if (other) {
          md += `- **[[${other.name}]]** - ${rel.type}`;
          if (rel.status !== 'active') md += ` (${rel.status})`;
          if (rel.notes) md += ` - ${rel.notes}`;
          md += '\n';
        }
      }
      md += '\n';
    }

    // Affiliations
    if (char.factions.length > 0) {
      md += `## Affiliations\n\n`;
      for (const factionId of char.factions) {
        const faction = this.registry.getEntity<FactionEntity>(factionId);
        if (faction) {
          md += `- [[${faction.name}]]\n`;
        }
      }
      md += '\n';
    }

    // Speech Patterns
    if (char.speechPatterns.length > 0 || char.catchPhrases.length > 0) {
      md += `## Speech & Voice\n\n`;
      md += `**Vocabulary:** ${char.vocabulary}\n\n`;

      if (char.speechPatterns.length > 0) {
        md += `**Speech Patterns:**\n`;
        for (const pattern of char.speechPatterns) md += `- ${pattern}\n`;
        md += '\n';
      }

      if (char.catchPhrases.length > 0) {
        md += `**Catch Phrases:**\n`;
        for (const phrase of char.catchPhrases) md += `> "${phrase}"\n`;
        md += '\n';
      }
    }

    // Character Arc
    if (char.characterArc) {
      md += `## Character Arc\n\n`;
      md += `**Type:** ${char.characterArc.type}\n\n`;
      md += `**Starting State:** ${char.characterArc.startingState}\n\n`;
      if (char.characterArc.endingState) {
        md += `**Ending State:** ${char.characterArc.endingState}\n\n`;
      }

      if (char.characterArc.keyMoments.length > 0) {
        md += `### Key Moments\n\n`;
        for (const moment of char.characterArc.keyMoments) {
          md += `- **Chapter ${moment.chapter}:** ${moment.description}\n`;
        }
        md += '\n';
      }
    }

    // Appearances
    if (char.appearances.length > 0 && this.config.includeReferences) {
      md += `## Appearances\n\n`;
      for (const app of char.appearances.slice(0, 20)) {
        md += `- Chapter ${app.chapterNumber} (${app.role})`;
        if (app.notes) md += ` - ${app.notes}`;
        md += '\n';
      }
      if (char.appearances.length > 20) {
        md += `_...and ${char.appearances.length - 20} more appearances_\n`;
      }
      md += '\n';
    }

    // Notes
    if (char.notes.length > 0) {
      md += `## Notes\n\n`;
      for (const note of char.notes) {
        md += `- ${note}\n`;
      }
      md += '\n';
    }

    // Tags
    if (char.tags.length > 0) {
      md += `---\n**Tags:** ${char.tags.map(t => `#${t}`).join(' ')}\n`;
    }

    // Metadata
    if (this.config.includeMetadata) {
      md += this.generateMetadataSection(char);
    }

    return md;
  }

  private generateLocationMarkdown(loc: LocationEntity): string {
    let md = `# ${loc.name}\n\n`;

    // Quick reference
    md += `> **Type:** ${loc.locationType} | **Danger Level:** ${loc.dangerLevel}`;
    if (loc.population) md += ` | **Population:** ${loc.population.toLocaleString()}`;
    md += `\n\n`;

    // Aliases
    if (loc.aliases.length > 0) {
      md += `**Also known as:** ${loc.aliases.join(', ')}\n\n`;
    }

    // Description
    md += `## Description\n\n${loc.description || '_No description provided._'}\n\n`;

    // Physical Description
    if (loc.physicalDescription) {
      md += `## Physical Features\n\n${loc.physicalDescription}\n\n`;

      if (loc.climate) md += `- **Climate:** ${loc.climate}\n`;
      if (loc.terrain) md += `- **Terrain:** ${loc.terrain}\n`;
      if (loc.size) md += `- **Size:** ${loc.size}\n`;
      md += '\n';
    }

    // Atmosphere
    if (loc.atmosphere) {
      md += `## Atmosphere\n\n${loc.atmosphere}\n\n`;
    }

    // Landmarks
    if (loc.landmarks.length > 0) {
      md += `## Landmarks\n\n`;
      for (const landmark of loc.landmarks) {
        md += `- ${landmark}\n`;
      }
      md += '\n';
    }

    // Location Hierarchy
    const hierarchy = this.registry.getLocationHierarchy(loc.id);
    if (hierarchy.length > 1) {
      md += `## Location\n\n`;
      md += `**Part of:** ${hierarchy.slice(0, -1).map(l => `[[${l.name}]]`).join(' > ')}\n\n`;
    }

    // Child Locations
    if (loc.childLocations.length > 0) {
      md += `## Sub-Locations\n\n`;
      for (const childId of loc.childLocations) {
        const child = this.registry.getEntity<LocationEntity>(childId);
        if (child) {
          md += `- [[${child.name}]] (${child.locationType})\n`;
        }
      }
      md += '\n';
    }

    // Governance
    if (loc.government || loc.ruler) {
      md += `## Governance\n\n`;
      if (loc.government) md += `**Government:** ${loc.government}\n\n`;
      if (loc.ruler) {
        const ruler = this.registry.getEntity<CharacterEntity>(loc.ruler);
        if (ruler) {
          md += `**Ruler:** [[${ruler.name}]]\n\n`;
        }
      }
      if (loc.laws.length > 0) {
        md += `**Laws:**\n`;
        for (const law of loc.laws) {
          md += `- ${law}\n`;
        }
        md += '\n';
      }
    }

    // Resources & Trade
    if (loc.resources.length > 0 || loc.exports.length > 0 || loc.imports.length > 0) {
      md += `## Economy\n\n`;
      if (loc.resources.length > 0) {
        md += `**Resources:** ${loc.resources.join(', ')}\n\n`;
      }
      if (loc.exports.length > 0) {
        md += `**Exports:** ${loc.exports.join(', ')}\n\n`;
      }
      if (loc.imports.length > 0) {
        md += `**Imports:** ${loc.imports.join(', ')}\n\n`;
      }
    }

    // Inhabitants
    if (loc.inhabitants.length > 0) {
      md += `## Inhabitants\n\n`;
      for (const inhId of loc.inhabitants) {
        const entity = this.registry.getEntity(inhId);
        if (entity) {
          md += `- [[${entity.name}]]\n`;
        }
      }
      md += '\n';
    }

    // Hazards
    if (loc.hazards.length > 0) {
      md += `## Hazards\n\n`;
      for (const hazard of loc.hazards) {
        md += `- ${hazard}\n`;
      }
      md += '\n';
    }

    // Travel Routes
    if (loc.accessRoutes.length > 0) {
      md += `## Access Routes\n\n`;
      for (const route of loc.accessRoutes) {
        md += `- From **${route.from}** via ${route.method} (${route.duration})\n`;
      }
      md += '\n';
    }

    // History
    if (loc.historicalEvents.length > 0) {
      md += `## History\n\n`;
      if (loc.founded) md += `**Founded:** ${loc.founded}\n\n`;
      md += `### Timeline\n\n`;
      for (const event of loc.historicalEvents) {
        md += `- **${event.date}:** ${event.event}\n`;
      }
      md += '\n';
    }

    // Notes & Tags
    if (loc.notes.length > 0) {
      md += `## Notes\n\n`;
      for (const note of loc.notes) {
        md += `- ${note}\n`;
      }
      md += '\n';
    }

    if (loc.tags.length > 0) {
      md += `---\n**Tags:** ${loc.tags.map(t => `#${t}`).join(' ')}\n`;
    }

    if (this.config.includeMetadata) {
      md += this.generateMetadataSection(loc);
    }

    return md;
  }

  private generatePowerMarkdown(power: PowerEntity): string {
    let md = `# ${power.name}\n\n`;

    // Quick reference
    md += `> **Type:** ${power.powerType} | **Category:** ${power.category} | **Rarity:** ${power.rarity}\n\n`;

    // Description
    md += `## Description\n\n${power.description || '_No description provided._'}\n\n`;

    // Source & Requirements
    md += `## Source\n\n${power.source}\n\n`;

    if (power.requirements.length > 0) {
      md += `### Requirements\n\n`;
      for (const req of power.requirements) {
        md += `- ${req}\n`;
      }
      md += '\n';
    }

    // Effects
    if (power.effects.length > 0) {
      md += `## Effects\n\n`;
      for (const effect of power.effects) {
        md += `### ${effect.name} (${effect.power})\n\n`;
        md += `${effect.description}\n\n`;
      }
    }

    // Costs
    if (power.costs.length > 0) {
      md += `## Costs\n\n`;
      for (const cost of power.costs) {
        md += `- **${cost.type}:** ${cost.amount} - ${cost.description}\n`;
      }
      md += '\n';
    }

    // Limitations
    if (power.limitations.length > 0) {
      md += `## Limitations\n\n`;
      for (const limit of power.limitations) {
        md += `- ${limit}\n`;
      }
      md += '\n';
    }

    // Scaling/Levels
    if (power.canImprove && power.levels && power.levels.length > 0) {
      md += `## Power Levels\n\n`;
      for (const level of power.levels) {
        md += `### Level ${level.level}: ${level.name}\n\n`;
        md += `${level.description}\n`;
        if (level.unlockedAt) md += `\n*Unlocked: ${level.unlockedAt}*\n`;
        md += '\n';
      }
    }

    // Interactions
    if (power.synergies.length > 0 || power.counters.length > 0 || power.incompatible.length > 0) {
      md += `## Interactions\n\n`;

      if (power.synergies.length > 0) {
        md += `### Synergies\n`;
        for (const synId of power.synergies) {
          const syn = this.registry.getEntity<PowerEntity>(synId);
          if (syn) md += `- [[${syn.name}]]\n`;
        }
        md += '\n';
      }

      if (power.counters.length > 0) {
        md += `### Countered By\n`;
        for (const counterId of power.counters) {
          const counter = this.registry.getEntity<PowerEntity>(counterId);
          if (counter) md += `- [[${counter.name}]]\n`;
        }
        md += '\n';
      }

      if (power.incompatible.length > 0) {
        md += `### Incompatible With\n`;
        for (const incId of power.incompatible) {
          const inc = this.registry.getEntity<PowerEntity>(incId);
          if (inc) md += `- [[${inc.name}]]\n`;
        }
        md += '\n';
      }
    }

    // Known Users
    if (power.knownUsers.length > 0) {
      md += `## Known Users\n\n`;
      for (const userId of power.knownUsers) {
        const user = this.registry.getEntity<CharacterEntity>(userId);
        if (user) {
          md += `- [[${user.name}]]\n`;
        }
      }
      md += '\n';
    }

    // Visual & Side Effects
    if (power.visualManifestation) {
      md += `## Visual Manifestation\n\n${power.visualManifestation}\n\n`;
    }

    if (power.sideEffects.length > 0) {
      md += `## Side Effects\n\n`;
      for (const effect of power.sideEffects) {
        md += `- ${effect}\n`;
      }
      md += '\n';
    }

    // Notes & Tags
    if (power.notes.length > 0) {
      md += `## Notes\n\n`;
      for (const note of power.notes) {
        md += `- ${note}\n`;
      }
      md += '\n';
    }

    if (power.tags.length > 0) {
      md += `---\n**Tags:** ${power.tags.map(t => `#${t}`).join(' ')}\n`;
    }

    if (this.config.includeMetadata) {
      md += this.generateMetadataSection(power);
    }

    return md;
  }

  private generateItemMarkdown(item: ItemEntity): string {
    let md = `# ${item.name}\n\n`;

    // Quick reference
    md += `> **Type:** ${item.itemType} | **Rarity:** ${item.rarity}\n\n`;

    // Description
    md += `## Description\n\n${item.description || '_No description provided._'}\n\n`;

    // Physical Description
    if (item.physicalDescription) {
      md += `## Physical Appearance\n\n${item.physicalDescription}\n\n`;
      if (item.size) md += `- **Size:** ${item.size}\n`;
      if (item.weight) md += `- **Weight:** ${item.weight}\n`;
      if (item.material) md += `- **Material:** ${item.material}\n`;
      md += '\n';
    }

    // Properties
    if (item.properties.length > 0) {
      md += `## Properties\n\n`;
      for (const prop of item.properties) {
        md += `### ${prop.name}${prop.magical ? ' ✨' : ''}\n\n`;
        md += `${prop.description}\n\n`;
      }
    }

    // Powers
    if (item.powers.length > 0) {
      md += `## Magical Powers\n\n`;
      for (const powerId of item.powers) {
        const power = this.registry.getEntity<PowerEntity>(powerId);
        if (power) {
          md += `- [[${power.name}]]\n`;
        }
      }
      md += '\n';
    }

    // Usage
    if (item.requirements && item.requirements.length > 0) {
      md += `## Requirements\n\n`;
      for (const req of item.requirements) {
        md += `- ${req}\n`;
      }
      md += '\n';
    }

    if (item.usageInstructions) {
      md += `## Usage\n\n${item.usageInstructions}\n\n`;
    }

    // Value
    if (item.value) {
      md += `## Value\n\n${item.value}\n\n`;
    }

    // History
    md += `## History\n\n`;
    if (item.creator) {
      const creator = this.registry.getEntity<CharacterEntity>(item.creator);
      if (creator) {
        md += `**Created by:** [[${creator.name}]]`;
        if (item.creationDate) md += ` (${item.creationDate})`;
        md += '\n\n';
      }
    }

    if (item.previousOwners.length > 0) {
      md += `### Previous Owners\n\n`;
      for (const prev of item.previousOwners) {
        const owner = this.registry.getEntity<CharacterEntity>(prev.characterId);
        if (owner) {
          md += `- [[${owner.name}]] (${prev.period})\n`;
        }
      }
      md += '\n';
    }

    // Current Status
    md += `## Current Status\n\n`;
    if (item.currentOwner) {
      const owner = this.registry.getEntity<CharacterEntity>(item.currentOwner);
      if (owner) {
        md += `**Current Owner:** [[${owner.name}]]\n\n`;
      }
    }
    if (item.currentLocation) {
      const loc = this.registry.getEntity<LocationEntity>(item.currentLocation);
      if (loc) {
        md += `**Location:** [[${loc.name}]]\n\n`;
      }
    }

    // Notes & Tags
    if (item.notes.length > 0) {
      md += `## Notes\n\n`;
      for (const note of item.notes) {
        md += `- ${note}\n`;
      }
      md += '\n';
    }

    if (item.tags.length > 0) {
      md += `---\n**Tags:** ${item.tags.map(t => `#${t}`).join(' ')}\n`;
    }

    if (this.config.includeMetadata) {
      md += this.generateMetadataSection(item);
    }

    return md;
  }

  private generateFactionMarkdown(faction: FactionEntity): string {
    let md = `# ${faction.name}\n\n`;

    // Quick reference
    md += `> **Type:** ${faction.factionType} | **Influence:** ${faction.influence}`;
    if (faction.memberCount) md += ` | **Members:** ${faction.memberCount.toLocaleString()}`;
    md += `\n\n`;

    // Description
    md += `## Description\n\n${faction.description || '_No description provided._'}\n\n`;

    // Leadership
    md += `## Leadership\n\n`;
    if (faction.leader) {
      const leader = this.registry.getEntity<CharacterEntity>(faction.leader);
      if (leader) {
        md += `**Current Leader:** [[${leader.name}]]\n\n`;
      }
    }

    // Notable Members
    if (faction.notableMembers.length > 0) {
      md += `### Notable Members\n\n`;
      for (const memberId of faction.notableMembers) {
        const member = this.registry.getEntity<CharacterEntity>(memberId);
        if (member) {
          md += `- [[${member.name}]]\n`;
        }
      }
      md += '\n';
    }

    // Headquarters & Territory
    if (faction.headquarters) {
      const hq = this.registry.getEntity<LocationEntity>(faction.headquarters);
      if (hq) {
        md += `## Headquarters\n\n[[${hq.name}]]\n\n`;
      }
    }

    if (faction.territory.length > 0) {
      md += `### Territory\n\n`;
      for (const terId of faction.territory) {
        const ter = this.registry.getEntity<LocationEntity>(terId);
        if (ter) {
          md += `- [[${ter.name}]]\n`;
        }
      }
      md += '\n';
    }

    // Goals
    md += `## Goals\n\n`;
    if (faction.publicGoals.length > 0) {
      md += `### Public Goals\n\n`;
      for (const goal of faction.publicGoals) {
        md += `- ${goal}\n`;
      }
      md += '\n';
    }

    if (faction.secretGoals.length > 0) {
      md += `### Secret Goals\n\n`;
      for (const goal of faction.secretGoals) {
        md += `- ${goal}\n`;
      }
      md += '\n';
    }

    if (faction.methods.length > 0) {
      md += `### Methods\n\n`;
      for (const method of faction.methods) {
        md += `- ${method}\n`;
      }
      md += '\n';
    }

    // Membership
    if (faction.membershipRequirements.length > 0) {
      md += `## Membership Requirements\n\n`;
      for (const req of faction.membershipRequirements) {
        md += `- ${req}\n`;
      }
      md += '\n';
    }

    // Ranks
    if (faction.ranks.length > 0) {
      md += `## Ranks\n\n`;
      for (const rank of faction.ranks.sort((a, b) => a.level - b.level)) {
        md += `### ${rank.level}. ${rank.name}\n\n`;
        if (rank.privileges.length > 0) {
          md += `Privileges: ${rank.privileges.join(', ')}\n\n`;
        }
      }
    }

    // Relationships
    md += `## Relationships\n\n`;
    if (faction.allies.length > 0) {
      md += `### Allies\n`;
      for (const allyId of faction.allies) {
        const ally = this.registry.getEntity<FactionEntity>(allyId);
        if (ally) md += `- [[${ally.name}]]\n`;
      }
      md += '\n';
    }

    if (faction.enemies.length > 0) {
      md += `### Enemies\n`;
      for (const enemyId of faction.enemies) {
        const enemy = this.registry.getEntity<FactionEntity>(enemyId);
        if (enemy) md += `- [[${enemy.name}]]\n`;
      }
      md += '\n';
    }

    // Culture
    if (faction.symbols.length > 0 || faction.traditions.length > 0) {
      md += `## Culture\n\n`;
      if (faction.symbols.length > 0) {
        md += `**Symbols:** ${faction.symbols.join(', ')}\n\n`;
      }
      if (faction.traditions.length > 0) {
        md += `**Traditions:**\n`;
        for (const trad of faction.traditions) {
          md += `- ${trad}\n`;
        }
        md += '\n';
      }
    }

    // Resources
    if (faction.resources.length > 0) {
      md += `## Resources\n\n`;
      for (const res of faction.resources) {
        md += `- ${res}\n`;
      }
      md += '\n';
    }

    // History
    if (faction.majorEvents.length > 0) {
      md += `## History\n\n`;
      if (faction.founded) md += `**Founded:** ${faction.founded}\n`;
      if (faction.founder) {
        const founder = this.registry.getEntity<CharacterEntity>(faction.founder);
        if (founder) md += `**Founder:** [[${founder.name}]]\n`;
      }
      md += '\n';

      md += `### Major Events\n\n`;
      for (const event of faction.majorEvents) {
        md += `- **${event.date}:** ${event.event}\n`;
      }
      md += '\n';
    }

    // Notes & Tags
    if (faction.notes.length > 0) {
      md += `## Notes\n\n`;
      for (const note of faction.notes) {
        md += `- ${note}\n`;
      }
      md += '\n';
    }

    if (faction.tags.length > 0) {
      md += `---\n**Tags:** ${faction.tags.map(t => `#${t}`).join(' ')}\n`;
    }

    if (this.config.includeMetadata) {
      md += this.generateMetadataSection(faction);
    }

    return md;
  }

  private generateGenericMarkdown(entity: Entity): string {
    let md = `# ${entity.name}\n\n`;

    md += `> **Type:** ${entity.type} | **Status:** ${entity.status}\n\n`;

    if (entity.aliases.length > 0) {
      md += `**Also known as:** ${entity.aliases.join(', ')}\n\n`;
    }

    md += `## Description\n\n${entity.description || '_No description provided._'}\n\n`;

    if (entity.references.length > 0 && this.config.includeReferences) {
      md += `## References\n\n`;
      for (const ref of entity.references) {
        const refEntity = this.registry.getEntity(ref.id);
        if (refEntity) {
          md += `- [[${refEntity.name}]] (${ref.relationship})\n`;
        }
      }
      md += '\n';
    }

    if (entity.notes.length > 0) {
      md += `## Notes\n\n`;
      for (const note of entity.notes) {
        md += `- ${note}\n`;
      }
      md += '\n';
    }

    if (entity.tags.length > 0) {
      md += `---\n**Tags:** ${entity.tags.map(t => `#${t}`).join(' ')}\n`;
    }

    if (this.config.includeMetadata) {
      md += this.generateMetadataSection(entity);
    }

    return md;
  }

  // ==========================================================================
  // INDEX GENERATION
  // ==========================================================================

  generateIndexFiles(): void {
    // Master index
    this.generateMasterIndex();

    // Type-specific indexes
    for (const type of Object.values(EntityType)) {
      const entities = this.registry.getEntitiesByType(type);
      if (entities.length > 0) {
        this.generateTypeIndex(type, entities);
      }
    }
  }

  private generateMasterIndex(): void {
    let md = `# Story Entity Index\n\n`;
    md += `*Generated: ${new Date().toISOString()}*\n\n`;

    const stats = this.registry.getStats();
    md += `## Overview\n\n`;
    md += `- **Total Entities:** ${stats.totalEntities}\n`;
    md += `- **Pending Sync:** ${stats.pendingSync}\n`;
    md += `- **Average References:** ${stats.averageReferences}\n\n`;

    md += `## By Type\n\n`;
    for (const [type, count] of Object.entries(stats.byType)) {
      if (count > 0) {
        md += `- [${type}](./${type}/index.md): ${count} entities\n`;
      }
    }

    const indexPath = path.join(this.config.basePath, 'index.md');
    if (!fs.existsSync(this.config.basePath)) {
      fs.mkdirSync(this.config.basePath, { recursive: true });
    }
    fs.writeFileSync(indexPath, md);
  }

  private generateTypeIndex(type: EntityType, entities: Entity[]): void {
    let md = `# ${type.charAt(0).toUpperCase() + type.slice(1)} Index\n\n`;
    md += `*${entities.length} entities*\n\n`;

    // Sort alphabetically
    const sorted = [...entities].sort((a, b) => a.name.localeCompare(b.name));

    // Group by first letter
    const grouped: Record<string, Entity[]> = {};
    for (const entity of sorted) {
      const letter = entity.name[0].toUpperCase();
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(entity);
    }

    for (const letter of Object.keys(grouped).sort()) {
      md += `## ${letter}\n\n`;
      for (const entity of grouped[letter]) {
        const safeName = this.getSafeName(entity.name);
        md += `- [${entity.name}](./${safeName}.md)`;
        if (entity.status !== EntityStatus.ACTIVE) {
          md += ` _(${entity.status})_`;
        }
        md += '\n';
      }
      md += '\n';
    }

    const typeDir = path.join(this.config.basePath, type);
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }
    fs.writeFileSync(path.join(typeDir, 'index.md'), md);
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private getSafeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9-_\s]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 100);
  }

  private generateMetadataSection(entity: Entity): string {
    let md = `\n---\n\n`;
    md += `## Metadata\n\n`;
    md += `- **ID:** \`${entity.id}\`\n`;
    md += `- **Created:** ${entity.createdAt.toISOString()}\n`;
    md += `- **Updated:** ${entity.updatedAt.toISOString()}\n`;
    if (entity.createdInChapter) {
      md += `- **First Appearance:** Chapter ${entity.createdInChapter}\n`;
    }
    if (entity.lastAppearanceChapter) {
      md += `- **Last Appearance:** Chapter ${entity.lastAppearanceChapter}\n`;
    }
    md += `- **Sync Status:** ${entity.syncStatus}\n`;

    if (this.config.includeChangeHistory && entity.changeHistory.length > 0) {
      md += `\n### Change History\n\n`;
      for (const change of entity.changeHistory.slice(-10)) {
        md += `- ${change.timestamp.toISOString()}: \`${change.field}\` changed`;
        if (change.reason) md += ` (${change.reason})`;
        md += '\n';
      }
    }

    return md;
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export { EntityFileGenerator as default };
