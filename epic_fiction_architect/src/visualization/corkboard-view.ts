/**
 * Epic Fiction Architect - Corkboard View Visualizer
 *
 * Scrivener-style index card visualization supporting:
 * - Drag-and-drop reordering
 * - Color coding by status/POV/emotion
 * - Grouping by container (chapter, arc)
 * - Card connections for plot threads
 */

import type {
  IndexCard,
  CorkboardConfig,
  CardStatus,
  CardColorScheme,
  GridLayout,
  SVGExportOptions
} from './types';

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const defaultCardColors: CardColorScheme = {
  idea: '#64B5F6',
  outline: '#BA68C8',
  draft: '#FFB74D',
  revision: '#FF8A65',
  complete: '#81C784',
  'on-hold': '#90A4AE'
};

const defaultConfig: CorkboardConfig = {
  columns: 4,
  cardWidth: 180,
  cardHeight: 120,
  gap: 15,
  showSynopsis: true,
  showMetadata: false,
  showConnections: false,
  colorScheme: 'status',
  enableDragDrop: true,
  enableMultiSelect: false,
  sortBy: 'position'
};

// ============================================================================
// CORKBOARD VIEW ENGINE
// ============================================================================

export class CorkboardView {
  private config: CorkboardConfig;
  private cards: Map<string, IndexCard> = new Map();
  private selectedCards: Set<string> = new Set();
  private cardColors: CardColorScheme = defaultCardColors;

  constructor(config: Partial<CorkboardConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Set cards
   */
  setCards(cards: IndexCard[]): void {
    this.cards.clear();
    for (const card of cards) {
      this.cards.set(card.id, card);
    }
  }

  /**
   * Get all cards
   */
  getCards(): IndexCard[] {
    return Array.from(this.cards.values());
  }

  /**
   * Get a specific card
   */
  getCard(id: string): IndexCard | undefined {
    return this.cards.get(id);
  }

  /**
   * Update a card
   */
  updateCard(id: string, updates: Partial<IndexCard>): boolean {
    const card = this.cards.get(id);
    if (!card) return false;

    this.cards.set(id, { ...card, ...updates });
    return true;
  }

  /**
   * Move a card to a new position
   */
  moveCard(cardId: string, newPosition: { row: number; col: number }): void {
    const card = this.cards.get(cardId);
    if (card) {
      card.position = newPosition;
    }
  }

  /**
   * Get card color based on color scheme
   */
  getCardColor(card: IndexCard): string {
    switch (this.config.colorScheme) {
      case 'status':
        return this.cardColors[card.status] || '#9E9E9E';
      case 'pov':
        if (card.metadata.povCharacter) {
          return this.stringToColor(card.metadata.povCharacter);
        }
        return '#9E9E9E';
      case 'emotion':
        if (card.metadata.emotionalBeat) {
          return this.getEmotionColor(card.metadata.emotionalBeat);
        }
        return '#9E9E9E';
      case 'custom':
        return card.color;
      default:
        return '#9E9E9E';
    }
  }

  /**
   * Get emotion-based color
   */
  private getEmotionColor(emotion: string): string {
    const emotionColors: Record<string, string> = {
      joy: '#FFEB3B',
      sadness: '#2196F3',
      anger: '#F44336',
      fear: '#9C27B0',
      surprise: '#FF9800',
      disgust: '#4CAF50',
      tension: '#E91E63',
      relief: '#00BCD4'
    };
    return emotionColors[emotion.toLowerCase()] || '#9E9E9E';
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
    return `hsl(${hue}, 60%, 65%)`;
  }

  /**
   * Get cards for a specific container
   */
  getCardsForContainer(containerId: string): IndexCard[] {
    return this.getCards().filter(c => c.containerId === containerId);
  }

  /**
   * Get sorted cards based on configuration
   */
  getSortedCards(): IndexCard[] {
    const cards = this.getCards();

    switch (this.config.sortBy) {
      case 'position':
        return cards.sort((a, b) => {
          if (a.position.row !== b.position.row) {
            return a.position.row - b.position.row;
          }
          return a.position.col - b.position.col;
        });
      case 'status':
        const statusOrder = ['idea', 'outline', 'draft', 'revision', 'complete', 'on-hold'];
        return cards.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));
      case 'wordCount':
        return cards.sort((a, b) => (b.metadata.wordCount || 0) - (a.metadata.wordCount || 0));
      case 'dueDate':
        return cards.sort((a, b) => {
          const dateA = a.metadata.dueDate ? new Date(a.metadata.dueDate).getTime() : Infinity;
          const dateB = b.metadata.dueDate ? new Date(b.metadata.dueDate).getTime() : Infinity;
          return dateA - dateB;
        });
      default:
        return cards;
    }
  }

  /**
   * Get grid layout
   */
  getGridLayout(): GridLayout {
    const sortedCards = this.getSortedCards();
    const { columns, cardWidth, cardHeight, gap } = this.config;

    // Assign positions to cards without explicit positions
    let row = 0;
    let col = 0;

    for (const card of sortedCards) {
      if (card.position.row === -1 || card.position.col === -1) {
        card.position = { row, col };
        col++;
        if (col >= columns) {
          col = 0;
          row++;
        }
      }
    }

    const rows = Math.max(...sortedCards.map(c => c.position.row)) + 1;
    const cols = columns;
    const totalWidth = cols * cardWidth + (cols - 1) * gap;
    const totalHeight = rows * cardHeight + (rows - 1) * gap;

    return {
      cards: sortedCards,
      rows,
      cols,
      totalWidth,
      totalHeight
    };
  }

  /**
   * Select a card
   */
  selectCard(id: string): void {
    if (this.config.enableMultiSelect) {
      this.selectedCards.add(id);
    } else {
      this.selectedCards.clear();
      this.selectedCards.add(id);
    }
  }

  /**
   * Deselect a card
   */
  deselectCard(id: string): void {
    this.selectedCards.delete(id);
  }

  /**
   * Get selected cards
   */
  getSelectedCards(): IndexCard[] {
    return Array.from(this.selectedCards)
      .map(id => this.cards.get(id))
      .filter((c): c is IndexCard => c !== undefined);
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.selectedCards.clear();
  }

  /**
   * Render to SVG
   */
  renderToSVG(options: Partial<SVGExportOptions> = {}): string {
    const layout = this.getGridLayout();
    const { cardWidth, cardHeight, gap, showSynopsis, showMetadata } = this.config;

    const padding = 20;
    const width = options.width || layout.totalWidth + padding * 2;
    const height = options.height || layout.totalHeight + padding * 2;

    const svgLines: string[] = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
      `  <rect width="100%" height="100%" fill="#d7ccc8"/>`, // Cork-like background
      '  <defs>',
      '    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">',
      '      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>',
      '    </filter>',
      '  </defs>',
      '  <g class="cards">'
    ];

    for (const card of layout.cards) {
      const x = padding + card.position.col * (cardWidth + gap);
      const y = padding + card.position.row * (cardHeight + gap);
      const color = this.getCardColor(card);
      const isSelected = this.selectedCards.has(card.id);

      // Card shadow and background
      svgLines.push(`    <g class="card" data-id="${card.id}">`);
      svgLines.push(
        `      <rect x="${x}" y="${y}" width="${cardWidth}" height="${cardHeight}" ` +
        `fill="${color}" rx="4" ry="4" filter="url(#shadow)" ` +
        `stroke="${isSelected ? '#1976D2' : '#fff'}" stroke-width="${isSelected ? 3 : 1}"/>`
      );

      // Pin at top
      svgLines.push(
        `      <circle cx="${x + cardWidth / 2}" cy="${y - 5}" r="6" fill="#E53935"/>`,
        `      <circle cx="${x + cardWidth / 2}" cy="${y - 5}" r="3" fill="#fff" opacity="0.5"/>`
      );

      // Title
      const truncatedTitle = card.title.length > 20 ? card.title.slice(0, 17) + '...' : card.title;
      svgLines.push(
        `      <text x="${x + 10}" y="${y + 20}" font-size="12" font-weight="bold" fill="#333">${this.escapeXml(truncatedTitle)}</text>`
      );

      // Synopsis (if enabled)
      if (showSynopsis && card.synopsis) {
        const synopsisLines = this.wrapText(card.synopsis, cardWidth - 20, 10);
        synopsisLines.slice(0, 4).forEach((line, i) => {
          svgLines.push(
            `      <text x="${x + 10}" y="${y + 38 + i * 14}" font-size="10" fill="#555">${this.escapeXml(line)}</text>`
          );
        });
      }

      // Metadata (if enabled)
      if (showMetadata) {
        const metaY = y + cardHeight - 20;
        if (card.metadata.wordCount) {
          svgLines.push(
            `      <text x="${x + 10}" y="${metaY}" font-size="9" fill="#666">${card.metadata.wordCount} words</text>`
          );
        }
        svgLines.push(
          `      <rect x="${x + cardWidth - 50}" y="${metaY - 10}" width="40" height="14" rx="2" fill="#fff" opacity="0.5"/>`,
          `      <text x="${x + cardWidth - 30}" y="${metaY}" font-size="9" fill="#333" text-anchor="middle">${card.status}</text>`
        );
      }

      svgLines.push('    </g>');
    }

    svgLines.push('  </g>');

    // Draw connections if enabled
    if (this.config.showConnections) {
      svgLines.push('  <g class="connections" opacity="0.5">');

      for (const card of layout.cards) {
        if (card.connections) {
          for (const targetId of card.connections) {
            const target = this.cards.get(targetId);
            if (target) {
              const x1 = padding + card.position.col * (cardWidth + gap) + cardWidth / 2;
              const y1 = padding + card.position.row * (cardHeight + gap) + cardHeight / 2;
              const x2 = padding + target.position.col * (cardWidth + gap) + cardWidth / 2;
              const y2 = padding + target.position.row * (cardHeight + gap) + cardHeight / 2;

              svgLines.push(
                `    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#795548" stroke-width="2" stroke-dasharray="5,5"/>`
              );
            }
          }
        }
      }

      svgLines.push('  </g>');
    }

    svgLines.push('</svg>');

    return svgLines.join('\n');
  }

  /**
   * Render to interactive HTML
   */
  renderToHTML(): string {
    const cardsJson = JSON.stringify(this.getCards());
    const configJson = JSON.stringify(this.config);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Corkboard View</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, sans-serif; background: #d7ccc8; min-height: 100vh; }
    .controls { padding: 10px; background: #fff; border-bottom: 1px solid #ddd; display: flex; gap: 10px; flex-wrap: wrap; }
    .controls select, .controls button { padding: 5px 10px; }
    .corkboard {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 15px;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 4px;
      padding: 15px;
      min-height: 120px;
      cursor: grab;
      box-shadow: 2px 2px 6px rgba(0,0,0,0.2);
      position: relative;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .card:hover { transform: translateY(-3px); box-shadow: 3px 5px 10px rgba(0,0,0,0.3); }
    .card.selected { outline: 3px solid #1976D2; }
    .card.dragging { opacity: 0.5; cursor: grabbing; }
    .card::before {
      content: '';
      position: absolute;
      top: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 12px;
      height: 12px;
      background: #E53935;
      border-radius: 50%;
      box-shadow: inset 2px 2px 4px rgba(255,255,255,0.4);
    }
    .card .title { font-weight: bold; margin-bottom: 8px; font-size: 14px; }
    .card .synopsis { font-size: 11px; color: #555; line-height: 1.4; }
    .card .meta { position: absolute; bottom: 10px; left: 15px; right: 15px; font-size: 10px; color: #666; display: flex; justify-content: space-between; }
    .card .status { background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 3px; }
    .tooltip {
      position: fixed;
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 10px;
      border-radius: 4px;
      font-size: 12px;
      max-width: 250px;
      display: none;
      z-index: 1000;
    }
  </style>
</head>
<body>
  <div class="controls">
    <select id="colorBy">
      <option value="status">Color by Status</option>
      <option value="pov">Color by POV</option>
      <option value="emotion">Color by Emotion</option>
    </select>
    <select id="sortBy">
      <option value="position">Sort by Position</option>
      <option value="status">Sort by Status</option>
      <option value="wordCount">Sort by Word Count</option>
    </select>
    <button onclick="exportSVG()">Export SVG</button>
  </div>
  <div class="corkboard" id="corkboard"></div>
  <div class="tooltip" id="tooltip"></div>

  <script>
    let cards = ${cardsJson};
    let config = ${configJson};

    const statusColors = {
      idea: '#64B5F6',
      outline: '#BA68C8',
      draft: '#FFB74D',
      revision: '#FF8A65',
      complete: '#81C784',
      'on-hold': '#90A4AE'
    };

    function stringToColor(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return 'hsl(' + (Math.abs(hash % 360)) + ', 60%, 65%)';
    }

    function getCardColor(card) {
      if (config.colorScheme === 'status') return statusColors[card.status] || '#9E9E9E';
      if (config.colorScheme === 'pov' && card.metadata.povCharacter) {
        return stringToColor(card.metadata.povCharacter);
      }
      return '#9E9E9E';
    }

    function render() {
      // Sort cards
      let sortedCards = [...cards];
      if (config.sortBy === 'status') {
        const order = ['idea', 'outline', 'draft', 'revision', 'complete', 'on-hold'];
        sortedCards.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
      } else if (config.sortBy === 'wordCount') {
        sortedCards.sort((a, b) => (b.metadata.wordCount || 0) - (a.metadata.wordCount || 0));
      }

      const corkboard = document.getElementById('corkboard');
      corkboard.innerHTML = sortedCards.map(card => \`
        <div class="card" style="background: \${getCardColor(card)}" data-id="\${card.id}"
             draggable="true" onclick="selectCard('\${card.id}')"
             ondragstart="dragStart(event)" ondragend="dragEnd(event)"
             ondragover="dragOver(event)" ondrop="drop(event)">
          <div class="title">\${card.title}</div>
          <div class="synopsis">\${card.synopsis.slice(0, 80)}\${card.synopsis.length > 80 ? '...' : ''}</div>
          <div class="meta">
            <span>\${card.metadata.wordCount || 0} words</span>
            <span class="status">\${card.status}</span>
          </div>
        </div>
      \`).join('');
    }

    let selectedCardId = null;
    function selectCard(id) {
      document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
      const card = document.querySelector('[data-id="' + id + '"]');
      if (card) card.classList.add('selected');
      selectedCardId = id;
    }

    let draggedId = null;
    function dragStart(e) {
      draggedId = e.target.dataset.id;
      e.target.classList.add('dragging');
    }
    function dragEnd(e) {
      e.target.classList.remove('dragging');
    }
    function dragOver(e) {
      e.preventDefault();
    }
    function drop(e) {
      e.preventDefault();
      const targetId = e.target.closest('.card')?.dataset.id;
      if (draggedId && targetId && draggedId !== targetId) {
        const draggedIdx = cards.findIndex(c => c.id === draggedId);
        const targetIdx = cards.findIndex(c => c.id === targetId);
        const [dragged] = cards.splice(draggedIdx, 1);
        cards.splice(targetIdx, 0, dragged);
        render();
      }
    }

    document.getElementById('colorBy').addEventListener('change', e => {
      config.colorScheme = e.target.value;
      render();
    });

    document.getElementById('sortBy').addEventListener('change', e => {
      config.sortBy = e.target.value;
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
   * Get corkboard statistics
   */
  getStatistics(): {
    totalCards: number;
    byStatus: Record<CardStatus, number>;
    byType: Record<string, number>;
    totalWordCount: number;
    avgWordCount: number;
    completionRate: number;
  } {
    const cards = this.getCards();
    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    let totalWordCount = 0;

    for (const card of cards) {
      byStatus[card.status] = (byStatus[card.status] || 0) + 1;
      byType[card.type] = (byType[card.type] || 0) + 1;
      totalWordCount += card.metadata.wordCount || 0;
    }

    const completedCount = byStatus['complete'] || 0;
    const completionRate = cards.length > 0 ? completedCount / cards.length : 0;

    return {
      totalCards: cards.length,
      byStatus: byStatus as Record<CardStatus, number>,
      byType,
      totalWordCount,
      avgWordCount: cards.length > 0 ? Math.round(totalWordCount / cards.length) : 0,
      completionRate: Math.round(completionRate * 100)
    };
  }

  /**
   * Wrap text to fit width
   */
  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    const charsPerLine = Math.floor(maxWidth / (fontSize * 0.6));

    for (const word of words) {
      if ((currentLine + ' ' + word).length > charsPerLine) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      }
    }
    if (currentLine) lines.push(currentLine);

    return lines;
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

export default CorkboardView;
