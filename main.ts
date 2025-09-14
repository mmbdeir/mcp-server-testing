import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { Request, Response } from "express";
import { z } from "zod";

function getServer() {
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

  return server;
}

const app = express();
app.use(express.json());

app.post("/mcp", async (req: Request, res: Response) => {
  try {
    const server = getServer();

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      console.log("Request closed");
      transport.close();
      server.close();
    });

    await server.connect(transport);

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`MCP stateless Stremable HTTP Server listening on port ${PORT}`);
});
