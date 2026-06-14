import { chooseTool } from "./aiRouter.js";
import { toolRegistry } from "./toolRegistry.js";

const input = process.argv.slice(2).join(" ");

if (!input) {
  console.log('Usage: node index.js "your command"');
  process.exit(1);
}

console.log("Ask:", input);

const decisions = await chooseTool(input);

for (const decision of decisions) {
  const toolFn = toolRegistry[decision.tool];

  if (!toolFn) {
    console.log("Tool not found:", decision.tool);
    continue;
  }

  const result = await toolFn(decision.arguments);

  console.log(`\n=== ${decision.tool} ===`);
  console.log(result);
}