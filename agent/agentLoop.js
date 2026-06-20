import { chooseTool } from "../aiRouter.js";
import { toolRegistry } from "../toolRegistry.js";
import { validateTool } from "../core/validateTool.js";
import { reflect } from "./reflection.js";
import { selfCorrect } from "./selfCorrection.js";


import {
  addFailure,
  addSuccess,
  addToolHistory,
  addReflection,
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
    console.log(
      "\nMEMORY:",
      JSON.stringify(memory, null, 2)
    );

    const enrichedContext = `
USER REQUEST:
${context}

MEMORY:
${JSON.stringify(memory, null, 2)}
`;

console.log(
  "\nCONTEXT SENT TO AI:\n",
  enrichedContext
);


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

    const toolCalls =
      Array.isArray(plan)
        ? plan
        : [plan];

    for (const toolCall of toolCalls) {

      if (!toolCall?.tool) {
        console.log("Invalid tool format");
        continue;
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

        console.log(validation.error);

        continue;
      }

      const toolFn =
        toolRegistry[toolCall.tool];

      if (!toolFn) {

        addFailure({
          tool: toolCall.tool,
          error: "Tool not registered",
          input: toolCall.arguments
        });

        console.log(
          `Tool not found: ${toolCall.tool}`
        );

        continue;
      }

      try {

        const result =
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

        const reflection =
          reflect(
            toolCall.tool,
            result,
            null
          );

        addReflection(reflection);

        history.push({
          tool: toolCall.tool,
          result
        });

        context += `

TOOL:
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

        const reflection =
          reflect(
            toolCall.tool,
            null,
            error.message
          );

        addReflection(reflection);

        const correction =
          selfCorrect(reflection);

        if (correction) {

          console.log(
            "\nSELF CORRECTION:"
          );

          console.log(
            JSON.stringify(
              correction,
              null,
              2
            )
          );

          const correctionTool =
            toolRegistry[
            correction.tool
            ];

          if (correctionTool) {

            console.log(
              "\nCORRECTION TOOL FOUND"
            );
            try {

              const correctionResult =
                await correctionTool(
                  correction.arguments
                );

              console.log(
                "\nCORRECTION RESULT:"
              );

              console.log(
                correctionResult
              );

              context += `

CORRECTION TOOL:
${correction.tool}

CORRECTION RESULT:
${JSON.stringify(correctionResult).slice(0, 2000)}
`;


            } catch (err) {

              console.log(
                "\nCORRECTION ERROR:"
              );

              console.log(err);

            }

          }

          context += `

SELF CORRECTION:
${JSON.stringify(correction)}
`;
        }

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
      }
    }
  }

  throw new Error(
    "Agent exceeded maximum steps"
  );

}