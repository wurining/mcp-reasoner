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
git clone https://github.com/frgmt0/mcp-reasoner.git
cd mcp-reasoner
npm install
npm run build

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
