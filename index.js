import { chooseTool } from "./aiRouter.js";
import { toolRegistry } from "./toolRegistry.js";
import { normalizePlan } from "./normalizePlan.js";
import { validateTool } from "./validateTool.js";
import "dotenv/config";

const plans = [
  {
    tool: "readFile",
    arguments: {
      path: "package.json"
    }
  },
  {
    tool: "listFiles",
    arguments: {
      path: "."
    }
  }
];

for (const plan of plans) {
  const result =
    await toolRegistry[plan.tool](
      plan.arguments
    );

  console.log(result);
}