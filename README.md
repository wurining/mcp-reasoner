# MCP Reasoner

A Model Context Protocol (MCP) reasoner implementation with multiple reasoning strategies including Beam Search and Monte Carlo Tree Search (MCTS).

## Features

- Multiple reasoning strategies:
  - **Beam Search**: Maintains a fixed-width beam of most promising paths
  - **Monte Carlo Tree Search**: Uses simulation-based search for complex reasoning
- Flexible strategy switching during runtime
- Comprehensive metrics and statistics
- Efficient state management with LRU caching
- TypeScript implementation with full type safety

## Installation

```bash
npm install mcp-reasoner
```

## Usage

```typescript
import { Reasoner, ReasoningStrategy } from 'mcp-reasoner';

// Create a new reasoner instance
const reasoner = new Reasoner();

// Use with default strategy (Beam Search)
const response = await reasoner.processThought({
  thought: "Initial thought",
  thoughtNumber: 1,
  totalThoughts: 3,
  nextThoughtNeeded: true
});

// Switch to MCTS strategy
reasoner.setStrategy(ReasoningStrategy.MCTS);

// Continue reasoning with MCTS
const nextResponse = await reasoner.processThought({
  thought: "Next thought",
  thoughtNumber: 2,
  totalThoughts: 3,
  nextThoughtNeeded: true,
  parentId: response.nodeId
});

// Get statistics
const stats = await reasoner.getStats();
console.log(stats);

// Get best reasoning path
const bestPath = await reasoner.getBestPath();
console.log(bestPath);
```

## Reasoning Strategies

### Beam Search

The Beam Search strategy maintains a fixed-width beam of the most promising paths through the reasoning space. At each step:

- Evaluates new thoughts
- Keeps top N paths based on scoring
- Prunes less promising branches
- Optimizes for both exploration and exploitation

Configuration options in `CONFIG`:
- `beamWidth`: Number of paths to maintain (default: 3)
- `minScore`: Minimum score threshold (default: 0.5)

### Monte Carlo Tree Search (MCTS)

MCTS uses simulation-based search to explore the reasoning space efficiently:

1. **Selection**: Choose promising nodes using UCT
2. **Expansion**: Create new thought nodes
3. **Simulation**: Random rollouts to estimate value
4. **Backpropagation**: Update node statistics

Configuration options in `CONFIG`:
- `maxDepth`: Maximum simulation depth (default: 5)
- `numSimulations`: Simulations per step (default: 50)

## Evaluation Metrics

Thoughts are evaluated based on multiple factors:

- Logical progression and coherence
- Complexity and depth of reasoning
- Mathematical/logical expressions
- Parent-child relationship strength
- Completion status

## API Reference

### Reasoner Class

Main interface for reasoning operations:

```typescript
class Reasoner {
  constructor();
  
  async processThought(request: ReasoningRequest): Promise<ReasoningResponse>;
  async getStats(): Promise<ReasoningStats>;
  async getBestPath(): Promise<ThoughtNode[]>;
  setStrategy(strategy: ReasoningStrategy): void;
  getAvailableStrategies(): ReasoningStrategy[];
}
```

### Types

```typescript
interface ReasoningRequest {
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  parentId?: string;
  strategyType?: string;
}

interface ReasoningResponse {
  nodeId: string;
  thought: string;
  score: number;
  depth: number;
  isComplete: boolean;
  nextThoughtNeeded: boolean;
  possiblePaths?: number;
  bestScore?: number;
  strategyUsed?: string;
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
