import { toolSchemas }
from "./toolSchemas.js";

export function validateTool(
  plan
) {
  const tool =
    plan.tool;

  const args =
    plan.arguments || {};

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