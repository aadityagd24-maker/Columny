Project Context: Columny - Dynamic "Chat-to-Dashboard" Workspace
1. Project Overview
We are building a "Text-to-Relational" (Text2R) workspace named Columny, tailored for Go-To-Market (GTM) and sales teams. The application allows users to input unstructured conversational updates (e.g., "I sent the Short-Intro email to Hans at BMW in Germany today, and he replied in 20 minutes"). The AI autonomously extracts the entities, dynamically updates a database schema, and instantly renders interactive, filterable dashboards and tables.

2. Core Architecture & Tech Stack
Frontend: React.js using declarative, JSON-Schema-driven UI libraries (such as @ui-schema/ui-schema or @react-formgen/json-schema) to automatically generate UI components, tables, and charts directly from the data structure.

Backend & Database: PostgreSQL hosted on Supabase (or Firebase). It will use a hybrid storage model: standard relational columns for fixed dimensions (like id, created_at) and JSONB columns to store highly variable, dynamically evolving parameters without requiring manual database migrations.

AI Models: Gemini 1.5 Flash (or GPT-4o-mini) via API for high-speed, low-cost data extraction and SQL query generation.

3. The Processing Pipeline
Ingestion: The user submits unstructured text into the Columny chat interface.

Constrained Extraction: The AI processes the text using strict JSON Schema formats (Structured Outputs) to pull exact entities (e.g., Name, Company, Action, Time) ensuring 100% schema compliance.

Dynamic Schema Evolution: If the user mentions a completely new variable (e.g., "device type"), the system updates the logical schema and stores the new key safely inside the PostgreSQL JSONB column.

Self-Healing SQL Engine: To render charts, the AI translates the user's natural language into SQL. If the SQL query fails, the backend catches the PostgreSQL SQLSTATE error and feeds it back to the AI in an automatic retry loop until the query successfully returns data.

Dynamic UI Projection: The React frontend reads the updated schema and database results, instantly auto-generating new table columns, filter dropdowns, and visual charts.

4. CRITICAL RULES FOR THE AI CODING AGENT
Read-Only Execution: Any AI-generated SQL query used to fetch data for dashboards MUST be executed on a strictly read-only database connection at the driver level to prevent accidental DROP, UPDATE, or DELETE commands.

No Hardcoded UIs: The frontend must never have hardcoded table columns or chart axes. The UI must be entirely declarative and adapt dynamically to whatever JSON schema the backend provides.

Cost Efficiency: Rely heavily on caching. Do not make an LLM API call if the source data or query hasn't changed.

Step-by-Step Implementation: Implement one pipeline stage at a time. Write tests for the extraction step and confirm it works before moving to the database storage step, and so on.
