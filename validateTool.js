import { toolSchemas }
from "./toolSchemas.js";

export function validateTool(
  tool,
  args
) {
  const required =
    toolSchemas[tool] || [];

  for (const field of required) {
    if (
      args[field] === undefined
    ) {
      throw new Error(
        `${tool} requires ${field}`
      );
    }
  }
}