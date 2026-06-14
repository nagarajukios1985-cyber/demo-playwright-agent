// agentLoop.js

import { chooseTool } from "./aiRouter.js";
import { toolRegistry } from "./toolRegistry.js";
import { validateTool } from "./validateTool.js";

export async function runAgent(userInput) {

  let context = userInput;

  const history = [];

  for (let step = 0; step < 10; step++) {

    console.log(
      `\n=== AGENT STEP ${step + 1} ===`
    );

    const plan =
      await chooseTool(context);

    // AI says task complete
    if (plan.done) {
      return {
        answer: plan.answer,
        history
      };
    }

    const toolCall =
      Array.isArray(plan)
        ? plan[0]
        : plan;

    validateTool(toolCall);

    const result =
      await toolRegistry[
        toolCall.tool
      ](
        toolCall.arguments
      );

    history.push({
      tool: toolCall.tool,
      result
    });

    context += `

Tool Result:
${JSON.stringify(result)}
`;
  }

  throw new Error(
    "Agent exceeded maximum steps"
  );
}