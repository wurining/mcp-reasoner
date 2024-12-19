export interface ThoughtNode {
  id: string;
  thought: string;
  score: number;
  depth: number;
  children: string[];  // Store child IDs
  parentId?: string;   // Store parent ID
  isComplete: boolean;
}

export interface ReasoningRequest {
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  parentId?: string;   // For branching thoughts
}

export interface ReasoningResponse {
  nodeId: string;
  thought: string;
  score: number;
  depth: number;
  isComplete: boolean;
  nextThoughtNeeded: boolean;
  possiblePaths?: number;
  bestScore?: number;
}

export const CONFIG = {
  beamWidth: 3,     // Keep top 3 paths
  maxDepth: 5,      // Reasonable depth limit
  minScore: 0.5,    // Threshold for path viability
  temperature: 0.7, // For thought diversity
  cacheSize: 1000   // LRU cache size
} as const;