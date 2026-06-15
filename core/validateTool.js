import { toolSchemas } from "./toolSchemas.js";

export function validateTool(
  toolName,
  args = {}
) {

  const schema =
    toolSchemas[toolName];

  if (!schema) {
    return {
      ok: false,
      error: `Unknown tool: ${toolName}`
    };
  }

  for (const field of schema.required || []) {

    if (
      args[field] === undefined ||
      args[field] === null
    ) {
      return {
        ok: false,
        error: `Missing required argument: ${field}`
      };
    }
  }

  return {
    ok: true
  };
}