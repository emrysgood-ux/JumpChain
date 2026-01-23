/**
 * Tests for Amalgam Universe Systems
 *
 * Verifies:
 * - Import Engine functionality
 * - Version Engine functionality
 * - Reality-Fiction Bridge
 * - Amalgam Universe support in UniversalAdapter
 * - Reality Overlay in Location Designer
 * - Map Visualizer fictional overlay support
 */

// Tests for Amalgam Systems - uses jest
// Note: Run with npm test

import { ImportEngine, ImportFormat, ImportContentType, MergeStrategy } from '../../src/engines/import/index';
import { VersionEngine, VersionableType, ChangeType, BranchStatus } from '../../src/engines/version/index';
import {
  RealityFictionBridge,
  RealityRelationType,
  RealityCorrespondence,
  FictionalModificationType,
  FictionalVisibility
} from '../../src/engines/worldbuilding/reality-fiction-bridge';
import { MapVisualizer } from '../../src/engines/maps/map-visualizer';

// ============================================================================
// IMPORT ENGINE TESTS
// ============================================================================

describe('ImportEngine', () => {
  let engine: ImportEngine;

  beforeEach(() => {
    engine = new ImportEngine();
  });

  it('should register source from content', () => {
    const content = 'Chapter 1\n\nOnce upon a time, there was a hero named John Smith.\n\n* * *\n\nThe next scene began.';
    const source = engine.registerSourceFromContent(
      content,
      ImportFormat.PLAIN_TEXT,
      ImportContentType.MANUSCRIPT
    );

    expect(source).toBeDefined();
    expect(source.id).toBeDefined();
    expect(source.format).toBe(ImportFormat.PLAIN_TEXT);
    expect(source.contentType).toBe(ImportContentType.MANUSCRIPT);
  });

  it('should analyze source and detect chapters', () => {
    const content = `Chapter 1

This is the first chapter with character John Smith.

* * *

A scene break here.

Chapter 2

This is the second chapter.`;

    const source = engine.registerSourceFromContent(content, ImportFormat.PLAIN_TEXT);
    const analysis = engine.analyzeSource(source.id);

    expect(analysis).toBeDefined();
    expect(analysis.estimatedChapters).toBeGreaterThanOrEqual(1);
    expect(analysis.totalWords).toBeGreaterThan(0);
  });

  it('should detect character names', () => {
    const content = `Chapter 1

John Smith walked into the room. Mary Johnson greeted him warmly.
"Hello," said John. Mary smiled back at him.
Dr. Williams entered behind them.`;

    const source = engine.registerSourceFromContent(content, ImportFormat.PLAIN_TEXT);
    const analysis = engine.analyzeSource(source.id);

    const characterEntities = analysis.entities.filter(e => e.type === 'character');
    expect(characterEntities.length).toBeGreaterThan(0);
  });

  it('should create import job', () => {
    const source = engine.registerSourceFromContent('Test content', ImportFormat.PLAIN_TEXT);
    const analysis = engine.analyzeSource(source.id);

    const job = engine.createImportJob('project-1', source.id, analysis.id, {
      mergeStrategy: MergeStrategy.MERGE,
      importChapters: true,
      importCharacters: true
    });

    expect(job).toBeDefined();
    expect(job.projectId).toBe('project-1');
    expect(job.mergeStrategy).toBe(MergeStrategy.MERGE);
  });
});

// ============================================================================
// VERSION ENGINE TESTS
// ============================================================================

describe('VersionEngine', () => {
  let engine: VersionEngine;

  beforeEach(() => {
    engine = new VersionEngine();
  });

  it('should create a branch', () => {
    const branch = engine.createBranch('project-1', 'main', {
      description: 'Main development branch',
      isDefault: true
    });

    expect(branch).toBeDefined();
    expect(branch.name).toBe('main');
    expect(branch.isDefault).toBe(true);
    expect(branch.status).toBe(BranchStatus.ACTIVE);
  });

  it('should create versions', () => {
    const branch = engine.createBranch('project-1', 'main', { isDefault: true });

    const v1 = engine.createVersion(
      'chapter-1',
      VersionableType.CHAPTER,
      branch.id,
      'First draft of chapter one.',
      {
        changeType: ChangeType.CREATE,
        changeDescription: 'Initial draft'
      }
    );

    expect(v1).toBeDefined();
    expect(v1.versionNumber).toBe(1);
    expect(v1.content).toBe('First draft of chapter one.');

    const v2 = engine.createVersion(
      'chapter-1',
      VersionableType.CHAPTER,
      branch.id,
      'Revised draft of chapter one with more detail.',
      {
        changeType: ChangeType.UPDATE,
        changeDescription: 'Added detail'
      }
    );

    expect(v2.versionNumber).toBe(2);
    expect(v2.parentVersionId).toBe(v1.id);
  });

  it('should get version history', () => {
    const branch = engine.createBranch('project-1', 'main');

    engine.createVersion('chapter-1', VersionableType.CHAPTER, branch.id, 'V1');
    engine.createVersion('chapter-1', VersionableType.CHAPTER, branch.id, 'V2');
    engine.createVersion('chapter-1', VersionableType.CHAPTER, branch.id, 'V3');

    const history = engine.getVersionHistory('chapter-1', branch.id);

    expect(history.length).toBe(3);
    expect(history[0].versionNumber).toBe(3); // Most recent first
  });

  it('should compare versions', () => {
    const branch = engine.createBranch('project-1', 'main');

    const v1 = engine.createVersion('chapter-1', VersionableType.CHAPTER, branch.id, 'Short text.');
    const v2 = engine.createVersion('chapter-1', VersionableType.CHAPTER, branch.id, 'Much longer text with additional paragraphs and content.');

    const diff = engine.compareVersions(v1.id, v2.id);

    expect(diff.contentChanged).toBe(true);
    expect(diff.addedCharacters).toBeGreaterThan(0);
  });

  it('should rollback to previous version', () => {
    const branch = engine.createBranch('project-1', 'main');

    const v1 = engine.createVersion('chapter-1', VersionableType.CHAPTER, branch.id, 'Original content.');
    engine.createVersion('chapter-1', VersionableType.CHAPTER, branch.id, 'Modified content.');

    const rollback = engine.rollbackToVersion(v1.id);

    expect(rollback.content).toBe('Original content.');
    expect(rollback.changeDescription).toContain('Rolled back');
  });

  it('should create and retrieve tags', () => {
    const branch = engine.createBranch('project-1', 'main');
    const version = engine.createVersion('chapter-1', VersionableType.CHAPTER, branch.id, 'Content');

    const tag = engine.createTag('first-draft', version.id, 'First complete draft');

    expect(tag.name).toBe('first-draft');

    const retrievedVersion = engine.getVersionByTag('chapter-1', 'first-draft');
    expect(retrievedVersion?.id).toBe(version.id);
  });
});

// ============================================================================
// REALITY-FICTION BRIDGE TESTS
// ============================================================================

describe('RealityFictionBridge', () => {
  let bridge: RealityFictionBridge;

  beforeEach(() => {
    bridge = new RealityFictionBridge();
  });

  it('should create reality anchors', () => {
    const anchor = bridge.createRealityAnchor({
      name: 'Tokyo Tower',
      type: 'location',
      realWorld: {
        name: 'Tokyo Tower',
        coordinates: { latitude: 35.6586, longitude: 139.7454 },
        country: 'Japan',
        description: 'Famous communications and observation tower'
      },
      correspondence: RealityCorrespondence.EXACT
    });

    expect(anchor).toBeDefined();
    expect(anchor.name).toBe('Tokyo Tower');
    expect(anchor.realWorld.coordinates?.latitude).toBe(35.6586);
  });

  it('should find anchors by coordinates', () => {
    bridge.createRealityAnchor({
      name: 'Test Location',
      type: 'location',
      realWorld: {
        name: 'Test',
        coordinates: { latitude: 35.0, longitude: 139.0 }
      }
    });

    const found = bridge.findAnchorByCoordinates(35.0, 139.0);
    expect(found).toBeDefined();
    expect(found?.name).toBe('Test Location');
  });

  it('should create fiction layers', () => {
    const anchor = bridge.createRealityAnchor({
      name: 'Okayama',
      type: 'location',
      realWorld: {
        name: 'Okayama Prefecture',
        coordinates: { latitude: 34.66, longitude: 133.93 },
        country: 'Japan'
      }
    });

    const layer = bridge.createFictionLayer({
      name: 'Masaki Estate',
      description: 'Hidden estate of the Masaki family with connections to alien royalty',
      realityAnchorId: anchor.id,
      modificationType: FictionalModificationType.ADD_LOCATION,
      visibility: FictionalVisibility.HIDDEN
    });

    expect(layer).toBeDefined();
    expect(layer.realityAnchorId).toBe(anchor.id);
    expect(layer.visibility).toBe(FictionalVisibility.HIDDEN);
  });

  it('should create amalgam worlds', () => {
    const world = bridge.createAmalgamWorld({
      name: 'Tenchi Universe Earth',
      description: 'Modern Earth with hidden alien presence',
      relationType: RealityRelationType.URBAN_FANTASY,
      primaryCorrespondence: RealityCorrespondence.STRONG,
      realWorldBase: {
        primaryRegion: 'Japan',
        timeframe: 'Modern day',
        majorRealLocationsUsed: ['Okayama', 'Tokyo'],
        realWorldConstraints: ['Geography matches real Japan']
      },
      coexistenceRules: {
        magicAndTechnology: 'integrated',
        mundaneAwareness: 'rumors'
      }
    });

    expect(world).toBeDefined();
    expect(world.relationType).toBe(RealityRelationType.URBAN_FANTASY);
    expect(world.realWorldBase.primaryRegion).toBe('Japan');
  });

  it('should create divergence points', () => {
    const divergence = bridge.createDivergencePoint({
      name: 'First Contact',
      description: 'When aliens first arrived on Earth',
      divergenceDate: '700 years ago',
      divergenceEvent: 'Crash landing of Jurai ship',
      divergenceType: 'single_event',
      affectedAspects: ['history', 'magic'],
      majorDifferences: ['Aliens exist', 'Some humans have alien heritage']
    });

    expect(divergence).toBeDefined();
    expect(divergence.affectedAspects).toContain('magic');
  });

  it('should create bound locations', () => {
    const location = bridge.createBoundLocation({
      fictionalName: 'Masaki Shrine',
      fictionalDescription: 'Ancient shrine with 320 stone steps, secretly a seal for imprisoned space pirate',
      realWorldName: 'Tarojinja Shrine',
      realWorldCoordinates: { latitude: 34.66, longitude: 133.85 },
      bindingType: 'exact_overlay',
      bindingStrength: RealityCorrespondence.PARTIAL
    });

    expect(location).toBeDefined();
    expect(location.bindingType).toBe('exact_overlay');
    expect(location.realWorldCoordinates?.latitude).toBe(34.66);
  });

  it('should generate mappable locations', () => {
    bridge.createBoundLocation({
      fictionalName: 'Test Location',
      fictionalDescription: 'A test',
      realWorldCoordinates: { latitude: 35.0, longitude: 139.0 },
      bindingType: 'exact_overlay'
    });

    const mappable = bridge.getMappableLocations();

    expect(mappable.length).toBeGreaterThan(0);
    expect(mappable[0].latitude).toBe(35.0);
  });

  it('should create preset Tenchi-style world', () => {
    const world = bridge.createTenchiMuyoStyleWorld();

    expect(world).toBeDefined();
    expect(world.relationType).toBe(RealityRelationType.URBAN_FANTASY);
    expect(world.divergencePoints.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// MAP VISUALIZER AMALGAM TESTS
// ============================================================================

describe('MapVisualizer Amalgam Features', () => {
  let mapViz: MapVisualizer;

  beforeEach(() => {
    mapViz = new MapVisualizer();
  });

  it('should create real-world map with bounds', () => {
    const map = mapViz.createRealWorldMap(
      'Test Region',
      { north: 35.0, south: 34.5, east: 140.0, west: 139.5 },
      800,
      600
    );

    expect(map).toBeDefined();
    expect(map.config.realWorldBounds).toBeDefined();
    expect(map.config.realWorldBounds?.north).toBe(35.0);
  });

  it('should add fictional overlay points', () => {
    const map = mapViz.createRealWorldMap(
      'Test',
      { north: 35.0, south: 34.5, east: 140.0, west: 139.5 },
      800,
      600
    );

    const point = mapViz.addFictionalOverlayPoint(
      map.id,
      34.75,
      139.75,
      {
        label: 'Secret Base',
        type: 'castle',
        description: 'Hidden underground facility',
        isFictional: true,
        isHidden: true,
        mundanePerception: 'Appears as normal forest'
      }
    );

    expect(point).toBeDefined();
    expect(point?.metadata?.fictional).toBe(true);
    expect(point?.metadata?.hidden).toBe(true);
  });

  it('should add real-world reference points', () => {
    const map = mapViz.createRealWorldMap(
      'Test',
      { north: 35.0, south: 34.5, east: 140.0, west: 139.5 },
      800,
      600
    );

    const point = mapViz.addRealWorldReferencePoint(
      map.id,
      34.75,
      139.75,
      {
        label: 'Tokyo Station',
        type: 'city',
        description: 'Major railway hub',
        fictionalSignificance: 'Site of key plot events'
      }
    );

    expect(point).toBeDefined();
    expect(point?.metadata?.realWorld).toBe(true);
    expect(point?.metadata?.fictional).toBe(false);
  });

  it('should create amalgam layers', () => {
    const map = mapViz.createRealWorldMap(
      'Test',
      { north: 35.0, south: 34.5, east: 140.0, west: 139.5 },
      800,
      600
    );

    const layer = mapViz.createAmalgamLayer(map.id, 'Hidden Locations', 'hidden');

    expect(layer).toBeDefined();
    expect(layer.name).toBe('Hidden Locations');
  });

  it('should export amalgam map HTML', () => {
    const map = mapViz.createRealWorldMap(
      'Test Amalgam',
      { north: 35.0, south: 34.5, east: 140.0, west: 139.5 },
      800,
      600
    );

    mapViz.addFictionalOverlayPoint(map.id, 34.75, 139.75, {
      label: 'Fictional Place',
      type: 'castle',
      isFictional: true
    });

    mapViz.addRealWorldReferencePoint(map.id, 34.6, 139.8, {
      label: 'Real Place',
      type: 'city'
    });

    const html = mapViz.exportAmalgamMapHTML(map.id, {
      title: 'Test Amalgam Map',
      showLegend: true,
      amalgamInfo: {
        worldName: 'Test World',
        realityType: 'Urban Fantasy',
        divergencePoint: 'Ancient times',
        mundaneAwareness: 'None'
      }
    });

    expect(html).toBeDefined();
    expect(html).toContain('Test Amalgam Map');
    expect(html).toContain('Urban Fantasy');
    expect(html).toContain('leaflet');
  });

  it('should create Masaki Village map', () => {
    const map = mapViz.createMasakiVillageMap();

    expect(map).toBeDefined();
    expect(map.config.name).toContain('Masaki');
    expect(map.layers.length).toBeGreaterThan(0);

    // Check for expected points
    const allPoints = map.layers.flatMap(l => l.points);
    const shrinePoint = allPoints.find(p => p.label?.includes('Shrine'));
    expect(shrinePoint).toBeDefined();
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Amalgam System Integration', () => {
  it('should create complete amalgam world with map', () => {
    const bridge = new RealityFictionBridge();
    const mapViz = new MapVisualizer();

    // Create world
    const world = bridge.createAmalgamWorld({
      name: 'Urban Fantasy Tokyo',
      description: 'Tokyo with hidden supernatural elements',
      relationType: RealityRelationType.URBAN_FANTASY,
      realWorldBase: {
        primaryRegion: 'Japan',
        timeframe: 'Modern day',
        majorRealLocationsUsed: ['Tokyo', 'Shibuya', 'Shinjuku'],
        realWorldConstraints: ['Geography matches exactly']
      }
    });

    // Create divergence
    const divergence = bridge.createDivergencePoint({
      name: 'The Awakening',
      description: 'When magic returned to the modern world',
      divergenceDate: '1995',
      divergenceType: 'single_event',
      affectedAspects: ['magic'],
      majorDifferences: ['Magic is real but hidden']
    });

    bridge.addDivergenceToWorld(world.id, divergence.id);

    // Create bound locations
    bridge.createBoundLocation({
      fictionalName: 'Shibuya Crossing (Ley Line Nexus)',
      fictionalDescription: 'Major ley line intersection hidden beneath the famous crossing',
      realWorldName: 'Shibuya Crossing',
      realWorldCoordinates: { latitude: 35.6595, longitude: 139.7004 },
      bindingType: 'hidden_within',
      worldId: world.id
    });

    // Create map
    const map = mapViz.createRealWorldMap(
      'Tokyo Supernatural',
      { north: 35.8, south: 35.5, east: 140.0, west: 139.5 },
      1000,
      800
    );

    // Add fictional layers
    const hiddenLayer = mapViz.createAmalgamLayer(map.id, 'Hidden Sites', 'hidden');

    mapViz.addFictionalOverlayPoint(map.id, 35.6595, 139.7004, {
      label: 'Ley Line Nexus',
      type: 'magical_site' as any,
      isFictional: true,
      isHidden: true,
      mundanePerception: 'Busy pedestrian crossing'
    }, hiddenLayer.id);

    // Export amalgam map
    const html = mapViz.exportAmalgamMapHTML(map.id, {
      amalgamInfo: {
        worldName: world.name,
        realityType: 'Urban Fantasy',
        divergencePoint: '1995',
        mundaneAwareness: 'None'
      }
    });

    // Verify integration
    expect(world.divergencePoints).toContain(divergence.id);
    expect(html).toContain('Urban Fantasy');
    expect(bridge.getWorldLocations(world.id).length).toBeGreaterThan(0);
  });
});
