export const CONFIG = {
    beamWidth: 3, // Keep top 3 paths
    maxDepth: 5, // Reasonable depth limit
    minScore: 0.5, // Threshold for path viability
    temperature: 0.7, // For thought diversity
    cacheSize: 1000 // LRU cache size
};
