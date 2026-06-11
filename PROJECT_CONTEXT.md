# Project Context: Columny - Agentic "Chat-to-Dashboard" Workspace

## 1. Project Overview
Columny is a "Text-to-Relational" agentic workspace tailored for sales teams, founders, and creators. The application eliminates manual data entry by allowing users to input unstructured conversational updates (e.g., "I sent the intro email to Hans at BMW today"). The AI autonomously extracts the entities, dynamically updates the database schema, and logs the data to multiple isolated dashboards in real time. 

The application features a dual-mode chat interface:
- **Build Mode:** The AI acts as a database administrator, logging data and executing schema edits.
- **Consult Mode:** The AI acts as an analytical advisor, answering questions and surfacing business insights without mutating the database.

## 2. Core Architecture & Tech Stack
- **Frontend:** React.js and Vite using a lightning-fast, custom glassmorphism CSS architecture (no heavy UI libraries).
- **Primary Backend & Database:** Supabase (PostgreSQL) handling user auth, real-time data syncing, and the strict schema evolution via the `schema_registry` and `entries` tables.
- **Sidecar Data Lake:** MongoDB Atlas serves as an unstructured agentic data lake, natively mirroring all logged entries for scalable long-term memory.
- **Agentic Engine:** Supabase Edge Functions integrated with the **Gemini 2.5 Flash** API (via an OpenAI-compatible proxy) to handle intent routing, data extraction, and dynamic schema execution.
- **MCP Integration:** An official, standalone **Model Context Protocol (MCP)** Node.js server that securely exposes the user's Columny data to local desktop AI agents (like Claude Desktop).

## 3. The Processing Pipeline
1. **Ingestion & Intent Routing:** The user submits unstructured text. The AI determines the exact "Intent" (e.g., `LOG_DATA`, `DATA_COMMAND`, `GENERATE_INSIGHTS`).
2. **Constrained Extraction:** The AI processes the text using strict JSON Schema formats to pull exact entities ensuring 100% schema compliance.
3. **Dynamic Schema Evolution:** If the user logs a new variable or issues a schema command (e.g., "delete the company column"), the AI autonomously executes a Data Definition Language (DDL) equivalent by modifying the user's isolated `schema_registry`.
4. **Sidecar Mirroring:** Validated entries are logged to the structured Supabase Postgres database and simultaneously pushed to the MongoDB unstructured data lake.
5. **Real-time Projection:** The React frontend subscribes to Supabase real-time events, instantly auto-generating new table columns, dynamic charts (Bar, Donut, etc.), and Key Performance Indicator (KPI) ribbons based on the new schema and data.

## 4. CRITICAL RULES FOR THE AI CODING AGENT
- **Strict Mode Separation:** Ensure the strict boundary between Build Mode (mutable) and Consult Mode (immutable/read-only) is preserved in both the frontend message filtering and the backend edge functions.
- **No Hardcoded UIs:** The frontend must never have hardcoded table columns or chart axes. The UI must adapt dynamically to the `schema_registry`.
- **Bulletproof Undo Logic:** Any new data insertion paths must be fully compatible with the 1-step Undo context, ensuring users can safely revert AI actions.
- **Simplicity & Performance:** Prefer pure CSS and minimal dependencies. Do not introduce bloated libraries unless absolutely necessary.
