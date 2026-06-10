# Columny MCP Server

The Columny MCP (Model Context Protocol) Server allows you to securely expose your Columny CRM data directly to AI agents like Claude Desktop or Google Gen AI.

## Features
- `get_dashboards`: Lists all Columny dashboards you've created.
- `get_dashboard_entries`: Fetches the recently logged, AI-structured entries from a specific dashboard, allowing the Agent to answer complex queries about your business data.

## Setup for Claude Desktop

1. Make sure you have Node.js installed.
2. In this folder (`mcp-server`), run `npm install`.
3. Open your Claude Desktop configuration file:
   - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
4. Add the Columny MCP server to the `mcpServers` object:

```json
{
  "mcpServers": {
    "columny": {
      "command": "node",
      "args": [
        "C:/absolute/path/to/Columny/mcp-server/index.js"
      ],
      "env": {
        "SUPABASE_URL": "YOUR_SUPABASE_URL",
        "SUPABASE_ANON_KEY": "YOUR_SUPABASE_ANON_KEY"
      }
    }
  }
}
```

5. Restart Claude Desktop.
6. You can now ask Claude questions like: "Use my Columny server to check my recent entries on dashboard [ID] and give me a summary of my sales calls."
