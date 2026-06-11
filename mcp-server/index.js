import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";
import { MongoClient } from "mongodb";

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
// Initialize MongoDB Client
const mongoUri = process.env.MONGODB_URI;

let supabase;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

let mongoClient;
if (mongoUri) {
  mongoClient = new MongoClient(mongoUri);
}

const server = new Server(
  {
    name: "columny-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_dashboards",
        description: "List all Columny dashboards associated with the user",
        inputSchema: {
          type: "object",
          properties: {
            user_id: {
              type: "string",
              description: "The user's UUID",
            },
          },
          required: ["user_id"],
        },
      },
      {
        name: "get_dashboard_entries",
        description: "Get the recent logged entries for a specific Columny dashboard to provide insights",
        inputSchema: {
          type: "object",
          properties: {
            dashboard_id: {
              type: "string",
              description: "The UUID of the dashboard",
            },
            limit: {
              type: "number",
              description: "Number of entries to fetch (default 20)",
            },
          },
          required: ["dashboard_id"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (!supabase) {
    return {
      content: [
        {
          type: "text",
          text: "Supabase credentials are not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.",
        },
      ],
      isError: true,
    };
  }

  try {
    if (request.params.name === "get_dashboards") {
      const { user_id } = request.params.arguments;
      
      const { data, error } = await supabase
        .from("dashboards")
        .select("*")
        .eq("user_id", user_id);

      if (error) throw error;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    if (request.params.name === "get_dashboard_entries") {
      const { dashboard_id, limit = 20 } = request.params.arguments;
      
      if (!mongoClient) {
        return {
          content: [{ type: "text", text: "MongoDB is not configured. Please set MONGODB_URI to access the Unstructured Data Lake." }],
          isError: true,
        };
      }

      await mongoClient.connect();
      const db = mongoClient.db("columny_logs");
      const data = await db.collection("entries")
        .find({ dashboard_id })
        .sort({ created_at: -1 })
        .limit(limit)
        .toArray();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    throw new Error("Unknown tool");
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error executing tool: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Columny MCP Server running on stdio");
}

run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
