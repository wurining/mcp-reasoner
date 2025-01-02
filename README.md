# MCP Reasoner
A systematic reasoning MCP server implementation for Claude Desktop featuring both Beam Search and Monte Carlo Tree Search (MCTS) capabilities.

<a href="https://glama.ai/mcp/servers/7o94y2zl9v">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/7o94y2zl9v/badge" />
</a>

## Features
- Dual search strategies:
  - Beam search with configurable width
  - MCTS for complex decision spaces
- Thought scoring and evaluation
- Tree-based reasoning paths
- Statistical analysis of reasoning process
- MCP protocol compliance

## Installation
```bash
git clone https://github.com/Jacck/mcp-reasoner.git
cd mcp-reasoner
npm install
npm run build
```

## Configuration
Add to Claude Desktop config:
```json
{
  "mcpServers": {
    "mcp-reasoner": {
      "command": "node",
      "args": ["path/to/mcp-reasoner/dist/index.js"],
    }
  }
}
```

## Search Strategies

### Beam Search
- Maintains fixed-width set of most promising paths
- Optimal for step-by-step reasoning
- Best for: Mathematical problems, logical puzzles

### Monte Carlo Tree Search
- Simulation-based exploration of decision space
- Balances exploration and exploitation
- Best for: Complex problems with uncertain outcomes

  **Note** Monte Carlo Tree Search allowed claude to perform really well on the Arc AGI benchmark (scored 6/10 on a the public test), whereas beam search yielded a (3/10) on the same puzzles.
  I'd argue for super complex tasks you'd want to direct claude to utilize the MCTS strategy over the beam search.

## Algorithm Details
1. Search Strategy Selection
   - Beam Search: Evaluates and ranks multiple solution paths
   - MCTS: Uses UCT for node selection and random rollouts

2. Thought Scoring Based On:
   - Detail level
   - Mathematical expressions
   - Logical connectors
   - Parent-child relationship strength

3. Process Management
   - Tree-based state tracking
   - Statistical analysis of reasoning
   - Progress monitoring

## Use Cases
- Mathematical problems
- Logical puzzles
- Step-by-step analysis
- Complex problem decomposition
- Decision tree exploration
- Strategy optimization

## Future Implementations
- Implement New Algorithms
    - Iterative Deepening Depth-First Search (IDDFS)
    - Alpha-Beta Pruning

## License
MIT
