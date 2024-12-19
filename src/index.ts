#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { ReasoningEngine } from './engine.js';

// Initialize server
const server = new Server(
  {
    name: "mcp-reasoner",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize reasoning engine
const reasoningEngine = new ReasoningEngine();

// Track reasoning history (keeping for backward compatibility)
const thoughtHistory: Array<{
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
}> = [];

// Process input and ensure correct types
function processInput(input: unknown) {
  const data = input as Record<string, unknown>;
  const result = {
    thought: String(data.thought || ""),
    thoughtNumber: Number(data.thoughtNumber || 0),
    totalThoughts: Number(data.totalThoughts || 0),
    nextThoughtNeeded: Boolean(data.nextThoughtNeeded)
  };

  // Validate
  if (!result.thought) throw new Error("thought must be provided");
  if (result.thoughtNumber < 1) throw new Error("thoughtNumber must be >= 1");
  if (result.totalThoughts < 1) throw new Error("totalThoughts must be >= 1");

  return result;
}

// Register the tool
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "mcp-reasoner",
    description: "A systematic reasoning tool with beam search and thought evaluation",
    inputSchema: {
      type: "object",
      properties: {
        thought: {
          type: "string",
          description: "Current reasoning step"
        },
        thoughtNumber: {
          type: "integer",
          description: "Current step number",
          minimum: 1
        },
        totalThoughts: {
          type: "integer",
          description: "Total expected steps",
          minimum: 1
        },
        nextThoughtNeeded: {
          type: "boolean",
          description: "Whether another step is needed"
        }
      },
      required: ["thought", "thoughtNumber", "totalThoughts", "nextThoughtNeeded"]
    }
  }]
}));

// Handle requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "mcp-reasoner") {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ error: "Unknown tool", success: false })
      }],
      isError: true
    };
  }

  try {
    // Process and validate input
    const step = processInput(request.params.arguments);
    
    // Add to both history and reasoning engine
    thoughtHistory.push(step);
    const reasoningStep = reasoningEngine.addThought(
      step.thought,
      step.thoughtNumber,
      step.totalThoughts,
      step.nextThoughtNeeded
    );

    // Get reasoning stats
    const stats = reasoningEngine.getStats();

    // Return enhanced response
    const response = {
      thoughtNumber: step.thoughtNumber,
      totalThoughts: step.totalThoughts,
      nextThoughtNeeded: step.nextThoughtNeeded,
      thought: step.thought,
      historyLength: thoughtHistory.length,
      score: reasoningStep.score,
      stats: {
        averageScore: stats.averageScore,
        branchingFactor: stats.branchingFactor,
        bestScore: stats.bestScore
      }
    };

    return {
      content: [{
        type: "text",
        text: JSON.stringify(response)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
          success: false
        })
      }],
      isError: true
    };
  }
});

// Start server
const transport = new StdioServerTransport();
server.connect(transport).catch(error => {
  process.stderr.write(`Error starting server: ${error}\n`);
  process.exit(1);
});