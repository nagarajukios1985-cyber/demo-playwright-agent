import { chooseTool } from "./aiRouter.js";
import { toolRegistry } from "./toolRegistry.js";
import { normalizePlan } from "./normalizePlan.js";
import { validateTool } from "./validateTool.js";
import "dotenv/config";

const userInput =
  "read package.json and list files";
const rawPlans =
  await chooseTool(userInput);
const plans = rawPlans.map(normalizePlan);

for (const plan of plans) {
  validateTool(plan);

  const result =
    await toolRegistry[plan.tool](
      plan.arguments
    );

  console.log(result);
}