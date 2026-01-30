/**
 * Epic Fiction Architect - Timeline View Visualizer
 *
 * Interactive timeline visualization supporting:
 * - Narrative order (reading order)
 * - Chronological order (story time)
 * - Dual view (compare both)
 * - Emotional arc overlay
 * - Character presence tracking
 */

import type {
  TimelineItem,
  TimelineViewConfig,
  TimelineLane,
  EmotionalArcPoint,
  SVGExportOptions
} from './types';

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const defaultConfig: TimelineViewConfig = {
  mode: 'narrative',
  zoomLevel: 'chapter',
  showEmotionalArc: true,
  showCharacterPresence: false,
  showWordCounts: false,
  colorBy: 'status',
  orientation: 'horizontal',
  itemHeight: 30,
  padding: 10
};

// ============================================================================
// STATUS COLORS
// ============================================================================

const statusColors: Record<string, string> = {
  draft: '#FFA726',
  complete: '#66BB6A',
  'needs-revision': '#EF5350',
  idea: '#42A5F5',
  outline: '#AB47BC',
  'on-hold': '#78909C'
};

const emotionColors: Record<string, string> = {
  positive: '#4CAF50',
  negative: '#f44336',
  neutral: '#9E9E9E'
};

// ============================================================================
// TIMELINE VIEW ENGINE
// ============================================================================

export class TimelineView {
  private config: TimelineViewConfig;
  private items: TimelineItem[] = [];
  private _lanes: TimelineLane[] = []; // Reserved for character presence lanes
  private emotionalArc: EmotionalArcPoint[] = [];

  constructor(config: Partial<TimelineViewConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Set timeline items
   */
  setItems(items: TimelineItem[]): void {
    this.items = items;
  }

  /**
   * Set character presence lanes
   */
  setLanes(lanes: TimelineLane[]): void {
    this._lanes = lanes;
  }

  /**
   * Get character presence lanes
   */
  getLanes(): TimelineLane[] {
    return this._lanes;
  }

  /**
   * Set emotional arc data
   */
  setEmotionalArc(arc: EmotionalArcPoint[]): void {
    this.emotionalArc = arc;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<TimelineViewConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get items sorted by narrative order
   */
  getNarrativeOrder(): TimelineItem[] {
    return [...this.items].sort((a, b) => a.narrativeOrder - b.narrativeOrder);
  }

  /**
   * Get items sorted by chronological order (story time)
   */
  getChronologicalOrder(): TimelineItem[] {
    return [...this.items].sort((a, b) => a.storyTimeNumeric - b.storyTimeNumeric);
  }

  /**
   * Get items filtered by zoom level
   */
  getFilteredItems(): TimelineItem[] {
    switch (this.config.zoomLevel) {
      case 'scene':
        return this.items.filter(i => i.type === 'scene');
      case 'chapter':
        return this.items.filter(i => ['scene', 'chapter'].includes(i.type));
      case 'arc':
        return this.items.filter(i => i.type === 'milestone');
      default:
        return this.items;
    }
  }

  /**
   * Get item color based on color scheme
   */
  getItemColor(item: TimelineItem): string {
    switch (this.config.colorBy) {
      case 'status':
        return statusColors[item.status] || '#9E9E9E';
      case 'emotion':
        if (item.emotionalIntensity !== undefined) {
          if (item.emotionalIntensity > 0.6) return emotionColors.positive;
          if (item.emotionalIntensity < 0.4) return emotionColors.negative;
        }
        return emotionColors.neutral;
      case 'pov':
        // Generate color from POV character ID hash
        if (item.characters.length > 0) {
          return this.stringToColor(item.characters[0]);
        }
        return '#9E9E9E';
      case 'location':
        if (item.location) {
          return this.stringToColor(item.location);
        }
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  }

  /**
   * Generate a consistent color from a string
   */
  private stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 50%)`;
  }

  /**
   * Render timeline to SVG
   */
  renderToSVG(options: Partial<SVGExportOptions> = {}): string {
    const sortedItems = this.config.mode === 'chronological'
      ? this.getChronologicalOrder()
      : this.getNarrativeOrder();

    const filteredItems = sortedItems.filter(item => {
      if (this.config.zoomLevel === 'scene') return item.type === 'scene';
      if (this.config.zoomLevel === 'chapter') return ['scene', 'chapter'].includes(item.type);
      return true;
    });

    const width = options.width || 1000;
    const height = options.height || 400;
    const padding = this.config.padding;
    const itemHeight = this.config.itemHeight;

    const svgLines: string[] = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
      `  <rect width="100%" height="100%" fill="#fafafa"/>`,
      '  <defs>',
      '    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">',
      '      <polygon points="0 0, 10 3.5, 0 7" fill="#666"/>',
      '    </marker>',
      '  </defs>'
    ];

    // Draw axis
    const axisY = height - 50;
    svgLines.push(`  <line x1="${padding}" y1="${axisY}" x2="${width - padding}" y2="${axisY}" stroke="#666" stroke-width="2" marker-end="url(#arrowhead)"/>`);

    // Calculate item positions
    const contentWidth = width - 2 * padding;
    const itemWidth = Math.max(contentWidth / filteredItems.length - 5, 20);

    // Draw items
    svgLines.push('  <g class="timeline-items">');

    filteredItems.forEach((item, index) => {
      const x = padding + (index * (itemWidth + 5));
      const y = axisY - itemHeight - 20;
      const color = this.getItemColor(item);

      // Item rectangle
      svgLines.push(
        `    <rect x="${x}" y="${y}" width="${itemWidth}" height="${itemHeight}" fill="${color}" rx="3" ry="3"/>`
      );

      // Item title (truncated)
      const truncatedTitle = item.title.length > 15 ? item.title.slice(0, 12) + '...' : item.title;
      svgLines.push(
        `    <text x="${x + itemWidth / 2}" y="${y + itemHeight / 2 + 4}" text-anchor="middle" font-size="10" fill="white">${this.escapeXml(truncatedTitle)}</text>`
      );

      // Time label below
      svgLines.push(
        `    <text x="${x + itemWidth / 2}" y="${axisY + 15}" text-anchor="middle" font-size="8" fill="#666">${this.escapeXml(item.storyTime.slice(0, 10))}</text>`
      );
    });

    svgLines.push('  </g>');

    // Draw emotional arc if enabled
    if (this.config.showEmotionalArc && this.emotionalArc.length > 0) {
      svgLines.push('  <g class="emotional-arc">');

      const arcY = 50;
      const arcHeight = 40;

      // Draw arc line
      let pathD = `M ${padding} ${arcY + arcHeight / 2}`;
      this.emotionalArc.forEach((point, i) => {
        const x = padding + point.position * contentWidth;
        const y = arcY + arcHeight * (1 - point.intensity);
        pathD += i === 0 ? ` L ${x} ${y}` : ` L ${x} ${y}`;
      });

      svgLines.push(
        `    <path d="${pathD}" fill="none" stroke="#2196F3" stroke-width="2" opacity="0.7"/>`
      );

      // Draw points
      this.emotionalArc.forEach((point) => {
        const x = padding + point.position * contentWidth;
        const y = arcY + arcHeight * (1 - point.intensity);
        const color = emotionColors[point.type] || emotionColors.neutral;
        svgLines.push(
          `    <circle cx="${x}" cy="${y}" r="4" fill="${color}"/>`
        );
      });

      svgLines.push('  </g>');
    }

    // Legend
    svgLines.push('  <g class="legend" transform="translate(10, 10)">');
    Object.entries(statusColors).forEach(([status, color], i) => {
      svgLines.push(
        `    <rect x="${i * 80}" y="0" width="12" height="12" fill="${color}"/>`,
        `    <text x="${i * 80 + 16}" y="10" font-size="10" fill="#333">${status}</text>`
      );
    });
    svgLines.push('  </g>');

    svgLines.push('</svg>');

    return svgLines.join('\n');
  }

  /**
   * Render to interactive HTML
   */
  renderToHTML(): string {
    const itemsJson = JSON.stringify(this.items);
    const arcJson = JSON.stringify(this.emotionalArc);
    const configJson = JSON.stringify(this.config);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Timeline View</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, sans-serif; background: #fafafa; }
    .controls { padding: 10px; background: #fff; border-bottom: 1px solid #ddd; display: flex; gap: 10px; }
    .controls select, .controls button { padding: 5px 10px; }
    .timeline-container { padding: 20px; overflow-x: auto; }
    .timeline { display: flex; gap: 5px; min-width: max-content; }
    .timeline-item {
      min-width: 80px;
      padding: 10px;
      border-radius: 4px;
      color: white;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .timeline-item:hover { transform: translateY(-5px); }
    .timeline-item .title { font-weight: bold; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .timeline-item .time { font-size: 10px; opacity: 0.8; margin-top: 5px; }
    .emotional-arc { height: 60px; margin-bottom: 20px; background: #e3f2fd; border-radius: 4px; position: relative; }
    .arc-point { position: absolute; width: 8px; height: 8px; border-radius: 50%; transform: translate(-50%, -50%); }
    .tooltip {
      position: fixed;
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 10px;
      border-radius: 4px;
      font-size: 12px;
      max-width: 300px;
      display: none;
      z-index: 1000;
    }
  </style>
</head>
<body>
  <div class="controls">
    <select id="mode">
      <option value="narrative">Narrative Order</option>
      <option value="chronological">Chronological Order</option>
    </select>
    <select id="colorBy">
      <option value="status">Color by Status</option>
      <option value="emotion">Color by Emotion</option>
      <option value="pov">Color by POV</option>
    </select>
    <button onclick="exportSVG()">Export SVG</button>
  </div>
  <div class="timeline-container">
    <div class="emotional-arc" id="arc"></div>
    <div class="timeline" id="timeline"></div>
  </div>
  <div class="tooltip" id="tooltip"></div>

  <script>
    const items = ${itemsJson};
    const emotionalArc = ${arcJson};
    let config = ${configJson};

    const statusColors = {
      draft: '#FFA726',
      complete: '#66BB6A',
      'needs-revision': '#EF5350',
      idea: '#42A5F5',
      outline: '#AB47BC',
      'on-hold': '#78909C'
    };

    function getItemColor(item) {
      if (config.colorBy === 'status') return statusColors[item.status] || '#9E9E9E';
      if (config.colorBy === 'emotion') {
        if (item.emotionalIntensity > 0.6) return '#4CAF50';
        if (item.emotionalIntensity < 0.4) return '#f44336';
        return '#9E9E9E';
      }
      if (config.colorBy === 'pov' && item.characters.length > 0) {
        return stringToColor(item.characters[0]);
      }
      return '#9E9E9E';
    }

    function stringToColor(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return 'hsl(' + (Math.abs(hash % 360)) + ', 70%, 50%)';
    }

    function render() {
      const sorted = config.mode === 'chronological'
        ? [...items].sort((a, b) => a.storyTimeNumeric - b.storyTimeNumeric)
        : [...items].sort((a, b) => a.narrativeOrder - b.narrativeOrder);

      const timeline = document.getElementById('timeline');
      timeline.innerHTML = sorted.map(item => \`
        <div class="timeline-item" style="background: \${getItemColor(item)}"
             data-item='\${JSON.stringify(item)}'
             onmouseover="showTooltip(event, this)"
             onmouseout="hideTooltip()">
          <div class="title">\${item.title}</div>
          <div class="time">\${item.storyTime.slice(0, 10)}</div>
        </div>
      \`).join('');

      // Render emotional arc
      const arcContainer = document.getElementById('arc');
      const arcWidth = arcContainer.offsetWidth;
      arcContainer.innerHTML = emotionalArc.map(point => \`
        <div class="arc-point" style="
          left: \${point.position * 100}%;
          top: \${(1 - point.intensity) * 100}%;
          background: \${point.type === 'positive' ? '#4CAF50' : point.type === 'negative' ? '#f44336' : '#9E9E9E'};
        "></div>
      \`).join('');
    }

    function showTooltip(event, el) {
      const item = JSON.parse(el.dataset.item);
      const tooltip = document.getElementById('tooltip');
      tooltip.innerHTML = \`
        <strong>\${item.title}</strong><br>
        Type: \${item.type}<br>
        Status: \${item.status}<br>
        Time: \${item.storyTime}<br>
        Characters: \${item.characters.join(', ') || 'None'}<br>
        \${item.wordCount ? 'Words: ' + item.wordCount : ''}
      \`;
      tooltip.style.display = 'block';
      tooltip.style.left = event.pageX + 10 + 'px';
      tooltip.style.top = event.pageY + 10 + 'px';
    }

    function hideTooltip() {
      document.getElementById('tooltip').style.display = 'none';
    }

    document.getElementById('mode').addEventListener('change', e => {
      config.mode = e.target.value;
      render();
    });

    document.getElementById('colorBy').addEventListener('change', e => {
      config.colorBy = e.target.value;
      render();
    });

    function exportSVG() {
      alert('SVG export would be generated here');
    }

    render();
  </script>
</body>
</html>`;
  }

  /**
   * Get timeline statistics
   */
  getStatistics(): {
    totalItems: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    totalWordCount: number;
    avgEmotionalIntensity: number;
  } {
    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    let totalWordCount = 0;
    let emotionSum = 0;
    let emotionCount = 0;

    for (const item of this.items) {
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;
      byType[item.type] = (byType[item.type] || 0) + 1;
      totalWordCount += item.wordCount || 0;

      if (item.emotionalIntensity !== undefined) {
        emotionSum += item.emotionalIntensity;
        emotionCount++;
      }
    }

    return {
      totalItems: this.items.length,
      byStatus,
      byType,
      totalWordCount,
      avgEmotionalIntensity: emotionCount > 0 ? emotionSum / emotionCount : 0
    };
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

export default TimelineView;
