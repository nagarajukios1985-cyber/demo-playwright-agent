import { chooseTool } from "../aiRouter.js";
import { toolRegistry } from "../toolRegistry.js";
import { validateTool } from "../core/validateTool.js";
import { reflect } from "./reflection.js";
import { selfCorrect } from "./selfCorrection.js";
import { findFileInFolder } from "./findFile.js";
import { verify } from "./verify.js";


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

        if (result?.success === false) {
          throw new Error(
            result.error ||
            result.stderr ||
            "Tool reported failure"
          );
        }

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

        let recovered = false;

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

TASK NOT COMPLETE.

Analyze the correction result.

If the requested goal is not achieved,
choose another tool and continue.
`;

              /*
                Recursive Recovery v1
              
                If the first recovery listed the root folder, search each
                top-level directory for the missing filename.
              */
              if (
                correction.tool === "listFiles" &&
                correction.arguments?.path === "." &&
                toolCall.tool === "readFile" &&
                toolCall.arguments?.path
              ) {
                const missingFile = toolCall.arguments.path;

                const rootItems = Array.isArray(correctionResult)
                  ? correctionResult
                  : [];

                for (const item of rootItems) {
                  /*
                    Ignore obvious files. We only want likely folders.
                    This is a simple first version, not a perfect file detector.
                  */
                  if (item.includes(".")) {
                    continue;
                  }

                  try {
                    console.log(`\nSEARCHING FOLDER: ${item}`);

                    const folderFiles = await toolRegistry.listFiles({
                      path: item
                    });
                    console.log(`FILES INSIDE ${item}:`, folderFiles);
                    console.log("LOOKING FOR:", missingFile);

                    const recoveredPath = findFileInFolder(
                      missingFile,
                      item,
                      folderFiles
                    );

                    console.log("RECOVERED PATH:", recoveredPath);

                    if (recoveredPath) {
                      console.log(`\nFOUND FILE: ${recoveredPath}`);

                      const recoveredResult =
                        await toolRegistry.readFile({
                          path: recoveredPath
                        });

                      recovered = true;

                      console.log(`\nRECOVERED FILE RESULT:`);
                      console.log(recoveredResult);

                      addToolHistory({
                        tool: "readFile",
                        input: { path: recoveredPath },
                        output: recoveredResult
                      });

                      addSuccess({
                        tool: "readFile",
                        input: { path: recoveredPath }
                      });

                      history.push({
                        tool: "readFile",
                        result: recoveredResult,
                        recovered: true
                      });

                      context += `

RECURSIVE RECOVERY FOUND FILE:
${recoveredPath}

RECURSIVE RECOVERY RESULT:
${JSON.stringify(recoveredResult).slice(0, 2000)}

The requested file was found through folder search.
Use this result to answer the user.
`;

                      /*
                        Stop searching folders. The next agent-loop step will
                        send the recovered file content back to the AI.
                      */
                      break;
                    }
                  } catch (searchError) {
                    /*
                      Some entries may not be folders or may not be readable.
                      We skip them and continue the search.
                    */
                    console.log(
                      `Could not search ${item}: ${searchError.message}`
                    );
                  }
                }
              }
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
        if (!recovered) {
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
        } else {
          console.log(
            "\nOriginal path failed, but recursive recovery succeeded."
          );
        }
      }
    }
  }
  throw new Error(
    "Agent exceeded maximum steps"
  );

}