import { chooseTool } from "../aiRouter.js";
import { toolRegistry } from "../toolRegistry.js";
import { validateTool } from "../core/validateTool.js";

import {
  addFailure,
  addSuccess,
  addToolHistory,
  getMemory
} from "./memory.js";

export async function runAgent(userInput) {

  let context = userInput;

  const history = [];

  for (let step = 0; step < 10; step++) {

    console.log(
      `\n=== AGENT STEP ${step + 1} ===`
    );

    const memory = getMemory();

    const enrichedContext = `
USER REQUEST:
${context}

MEMORY:
${JSON.stringify(memory, null, 2)}
`;

    const plan =
      await chooseTool(enrichedContext);

    if (!plan) {
      throw new Error(
        "AI returned empty plan"
      );
    }

    // AI finished task
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

    if (!toolCall?.tool) {
      throw new Error(
        "Invalid tool format from AI"
      );
    }

    const validation =
      validateTool(
        toolCall.tool,
        toolCall.arguments
      );

    if (!validation.ok) {

      addFailure({
        tool: toolCall.tool,
        error: validation.error,
        input: toolCall.arguments
      });

      throw new Error(
        validation.error
      );
    }

    const toolFn =
      toolRegistry[toolCall.tool];

    if (!toolFn) {

      addFailure({
        tool: toolCall.tool,
        error: "Tool not registered",
        input: toolCall.arguments
      });

      throw new Error(
        `Tool not found: ${toolCall.tool}`
      );
    }

    let result;

    try {

      result =
        await toolFn(
          toolCall.arguments
        );

      addToolHistory({
        tool: toolCall.tool,
        input: toolCall.arguments,
        output: result
      });

      addSuccess({
        tool: toolCall.tool,
        input: toolCall.arguments
      });

      history.push({
        tool: toolCall.tool,
        result
      });

      context += `

TOOL EXECUTED:
${toolCall.tool}

RESULT:
${JSON.stringify(result).slice(0, 2000)}
`;

    } catch (error) {

      addFailure({
        tool: toolCall.tool,
        error: error.message,
        input: toolCall.arguments
      });

      history.push({
        tool: toolCall.tool,
        error: error.message
      });

      context += `

TOOL FAILED:
${toolCall.tool}

ERROR:
${error.message}
`;

      console.log(
        `Tool failed: ${error.message}`
      );

      continue;
    }
  }

  throw new Error(
    "Agent exceeded maximum steps"
  );
}