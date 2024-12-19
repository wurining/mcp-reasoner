#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import chalk from 'chalk';

class ReasonerServer {
  constructor() {
    this.thoughts = [];
    this.branches = {};
  }

  validateInput(input) {
    const data = input;
    
    if (!data.thought || typeof data.thought !== 'string') {
      throw new Error('Invalid thought: must be a string');
    }
    if (!data.thoughtNumber || typeof data.thoughtNumber !== 'number') {
      throw new Error('Invalid thoughtNumber: must be a number');
    }
    if (!data.totalThoughts || typeof data.totalThoughts !== 'number') {
      throw new Error('Invalid totalThoughts: must be a number');
    }
    if (typeof data.nextThoughtNeeded !== 'boolean') {
      throw new Error('Invalid nextThoughtNeeded: must be a boolean');
    }
    return true;
  }

  formatThought(thoughtData) {
    const { thoughtNumber, totalThoughts, thought } = thoughtData;
    const prefix = chalk.blue('🤔 Reasoning');
    const header = `${prefix} ${thoughtNumber}/${totalThoughts}`;
    const border = '─'.repeat(Math.max(header.length, thought.length) + 4);

    return `
┌${border}┐
│ ${header.padEnd(border.length - 2)} │
├${border}┤
│ ${thought.padEnd(border.length - 2)} │
└${border}┘`;
  }

  processThought(input) {
    try {
      this.validateInput(input);
      
      // Adjust total thoughts if needed
      if (input.thoughtNumber > input.totalThoughts) {
        input.totalThoughts = input.thoughtNumber;
      }

      // Add to history
      this.thoughts.push(input);

      // Format and display
      const formattedThought = this.formatThought(input);
      console.error(formattedThought);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            thoughtNumber: input.thoughtNumber,
            totalThoughts: input.totalThoughts,
            nextThoughtNeeded: input.nextThoughtNeeded,
            thoughtCount: this.thoughts.length
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: error.message,
            status: 'failed'
          }, null, 2)
        }],
        isError: true
      };
    }
  }
}

const REASONER_TOOL = {
  name: "reasoner",
  description: "A reasoning engine that helps break down and analyze problems step by step",
  inputSchema: {
    type: "object",
    properties: {
      thought: {
        type: "string",
        description: "The current reasoning step"
      },
      thoughtNumber: {
        type: "integer",
        description: "Current step number",
        minimum: 1
      },
      totalThoughts: {
        type: "integer",
        description: "Estimated total steps needed",
        minimum: 1
      },
      nextThoughtNeeded: {
        type: "boolean",
        description: "Whether another step is needed"
      }
    },
    required: ["thought", "thoughtNumber", "totalThoughts", "nextThoughtNeeded"]
  }
};

// Initialize MCP server
const server = new Server(
  {
    name: "reasoner-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const reasonerServer = new ReasonerServer();

// Register tool listing handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [REASONER_TOOL],
}));

// Register tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "reasoner") {
    return reasonerServer.processThought(request.params.arguments);
  }

  return {
    content: [{
      type: "text",
      text: `Unknown tool: ${request.params.name}`
    }],
    isError: true
  };
});

// Start the server
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Reasoner MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});