import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { z } from "zod";

const server = new McpServer({
  name: "fact-of-random-number",
  version: "1.0.0",
});

console.log("Starting MCP server...");

server.registerTool(
  "get_fact_of_random_number",
  {
    title: "Fact of a random number",
    description: "Retrieves a fact of a random number",
  },
  async () => {
    const response = await fetch("http://numbersapi.com/random");
    const factText = await response.text();
    return {
      content: [
        {
          type: "text",
          text: `Fact: ${factText}`,
        },
      ],
    };
  }
);

async function init() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

init();
