import { runAgent } from "./agentLoop.js";
import { toolRegistry } from "../toolRegistry.js";

export async function runFixLoop(input) {

  let attempt = 0;
  let context = input;

  while (attempt < 3) {

    console.log(`\n🔁 FIX ATTEMPT ${attempt + 1}`);

    const result = await runAgent(context);

    const last = result.history[result.history.length - 1];

    // if success
    if (!last?.result?.error) {
      return result;
    }

    // ❌ failure detected
    const error = last.result;

    console.log("❌ Error detected:", error);

    // send error back to AI
    context = `
Fix this Playwright failure:

${JSON.stringify(error)}

Original request:
${input}
`;

    attempt++;
  }

  throw new Error("Self-healing failed after 3 attempts");
}