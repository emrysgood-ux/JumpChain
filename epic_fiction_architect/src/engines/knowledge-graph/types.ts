/**
 * Knowledge Graph Type Definitions
 *
 * Entity-relationship graph with temporal awareness:
 * - Nodes represent story entities (characters, locations, objects, concepts)
 * - Edges represent relationships with validity periods
 * - Changes tracked over narrative time
 */

// ============================================================================
// Graph Node Types
// ============================================================================

export type NodeType =
  | 'character'
  | 'location'
  | 'object'
  | 'organization'
  | 'event'
  | 'concept'
  | 'ability'
  | 'species';

export interface GraphNode {
  nodeId: string;
  nodeType: NodeType;
  name: string;
  aliases: string[];

  // Properties (type-specific)
  properties: Record<string, unknown>;

  // Temporal validity
  introducedAt?: number;    // Story time when first appears
  removedAt?: number;       // Story time when removed/died/destroyed

  // Source tracking
  sourceSceneIds: string[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Graph Edge Types
// ============================================================================

export type EdgeType =
  // Character relationships
  | 'family'          // parent, child, sibling, spouse
  | 'romantic'        // dating, engaged, married, ex
  | 'friendship'      // friend, best_friend, acquaintance
  | 'professional'    // mentor, student, colleague, rival
  | 'antagonistic'    // enemy, nemesis, rival

  // Location relationships
  | 'located_at'      // character/object at location
  | 'owns'            // ownership
  | 'contains'        // location contains location/object

  // Event relationships
  | 'participated_in' // character participated in event
  | 'caused'          // entity caused event
  | 'resulted_from'   // entity resulted from event

  // Knowledge/ability relationships
  | 'knows'           // character knows fact/secret
  | 'has_ability'     // character has ability
  | 'member_of'       // character is member of organization

  // Object relationships
  | 'possesses'       // character possesses object
  | 'created'         // entity created object/concept

  // Concept relationships
  | 'related_to'      // general relationship
  | 'is_type_of'      // taxonomy relationship
  | 'opposes';        // conceptual opposition

export interface GraphEdge {
  edgeId: string;
  edgeType: EdgeType;

  // Connected nodes
  sourceNodeId: string;
  targetNodeId: string;

  // Relationship details
  subtype?: string;        // e.g., 'parent' for family, 'mentor' for professional
  strength: number;        // 0-1, relationship intensity
  sentiment: 'positive' | 'negative' | 'neutral' | 'complex';

  // Bidirectional info
  bidirectional: boolean;  // Is relationship symmetric?

  // Temporal validity
  validFrom: number;       // Story time when relationship starts
  validUntil?: number;     // Story time when relationship ends (if applicable)

  // Properties
  properties: Record<string, unknown>;

  // Source tracking
  sourceSceneIds: string[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Edge Change Tracking
// ============================================================================

export interface EdgeChange {
  changeId: string;
  edgeId: string;

  changeType: 'created' | 'modified' | 'ended';

  // When the change occurred
  storyTime: number;
  sceneId?: string;

  // What changed
  previousValues?: Partial<GraphEdge>;
  newValues?: Partial<GraphEdge>;

  // Why
  reason: string;

  timestamp: Date;
}

// ============================================================================
// Query Types
// ============================================================================

export interface GraphQuery {
  // Node selection
  nodeIds?: string[];
  nodeTypes?: NodeType[];
  nodeNamePattern?: string;    // Regex pattern

  // Edge selection
  edgeTypes?: EdgeType[];
  minStrength?: number;
  sentiments?: ('positive' | 'negative' | 'neutral' | 'complex')[];

  // Temporal filtering
  atTime?: number;             // Get state at specific time
  fromTime?: number;
  toTime?: number;

  // Graph traversal
  startNodeId?: string;
  maxDepth?: number;           // BFS/DFS depth limit
  direction?: 'outgoing' | 'incoming' | 'both';

  // Result options
  includeNodes?: boolean;
  includeEdges?: boolean;
  limit?: number;
}

export interface GraphQueryResult {
  nodes: GraphNode[];
  edges: GraphEdge[];

  // Query metadata
  queryTime: number;
  totalNodes: number;
  totalEdges: number;
}

// ============================================================================
// Subgraph Types
// ============================================================================

export interface Subgraph {
  subgraphId: string;
  name: string;
  description: string;

  // Nodes and edges in this subgraph
  nodeIds: string[];
  edgeIds: string[];

  // Temporal scope
  fromTime?: number;
  toTime?: number;

  // Statistics
  nodeCount: number;
  edgeCount: number;
  density: number;           // edges / (nodes * (nodes-1))

  createdAt: Date;
}

// ============================================================================
// Path Finding Types
// ============================================================================

export interface GraphPath {
  pathId: string;
  startNodeId: string;
  endNodeId: string;

  // Path nodes and edges in order
  nodeIds: string[];
  edgeIds: string[];

  // Path metrics
  length: number;            // Number of edges
  totalStrength: number;     // Sum of edge strengths
  averageStrength: number;   // Average edge strength

  // Temporal validity
  validAtTime?: number;      // Time when this path is valid
}

// ============================================================================
// Analysis Types
// ============================================================================

export interface NodeCentrality {
  nodeId: string;
  nodeName: string;

  // Centrality measures
  degree: number;            // Number of connections
  inDegree: number;          // Incoming connections
  outDegree: number;         // Outgoing connections
  betweenness?: number;      // Bridge importance (0-1)
  closeness?: number;        // Average distance to others (0-1)
  pageRank?: number;         // Importance by connection quality (0-1)
}

export interface CommunityDetection {
  communities: {
    communityId: string;
    nodeIds: string[];
    centralNodeId: string;   // Most central node in community
    density: number;
  }[];

  modularity: number;        // Quality of community division (0-1)
}

// ============================================================================
// Configuration
// ============================================================================

export interface KnowledgeGraphConfig {
  // Node settings
  autoCreateNodes: boolean;  // Auto-create referenced nodes
  mergeThreshold: number;    // Similarity threshold for merging nodes

  // Edge settings
  defaultStrength: number;
  bidirectionalTypes: EdgeType[];  // Types that are always bidirectional

  // Analysis settings
  computeCentrality: boolean;
  centralityUpdateFrequency: 'always' | 'manual' | 'periodic';

  // Temporal settings
  trackChanges: boolean;
}

export const defaultKnowledgeGraphConfig: KnowledgeGraphConfig = {
  autoCreateNodes: true,
  mergeThreshold: 0.9,

  defaultStrength: 0.5,
  bidirectionalTypes: ['family', 'romantic', 'friendship'],

  computeCentrality: true,
  centralityUpdateFrequency: 'periodic',

  trackChanges: true
};
