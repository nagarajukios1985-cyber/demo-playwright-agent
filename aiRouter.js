import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// export async function chooseTool(input) {
//   const completion =
//     await client.chat.completions.create({
//       model: "openai/gpt-oss-20b:free",
//       messages: [
//         {
//           role: "system",
//           content: `
// You are a tool router.

// Available tools:
// runCommand
// listFiles
// readFile
// createFile
// editFile

// Return ONLY JSON.
// `,
//         },
//         {
//           role: "user",
//           content: input,
//         },
//       ],
//     });

// const raw =
//   completion.choices[0].message.content;

// const cleaned =
//   raw
//     .replace(/```json/g, "")
//     .replace(/```/g, "")
//     .trim();

// console.log("AI RAW:", raw);
// console.log("CLEANED:", cleaned);

// return JSON.parse(cleaned);
// }


export async function chooseTool(input) {
  let completion;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      completion =
        await client.chat.completions.create({
          model: "openai/gpt-oss-20b:free",
          messages: [
            {
              role: "system",
              content: `
You are a JSON tool router. You receive a user request and decide which tools to call.

Available tools:
- readFile: reads a file. Required arg: {"path": "file_path"}
- listFiles: lists files in a directory. Required arg: {"path": "directory_path"}
- createFile: creates/overwrites a file. Required args: {"path": "file_path", "content": "file_content"}
- editFile: edits a file. Required args: {"path": "file_path", "content": "new_content"}
- runCommand: runs a shell command. Required arg: {"command": "command_string"}

Rules:
1. Return ONLY a JSON array of tool calls. No markdown, no explanations, no code blocks.
2. Each item must have exactly: {"tool": "toolName", "arguments": {arg1: value1, ...}}
3. For multi-step requests, return multiple objects in the array.

Examples:
User: "read package.json and list files"
→ [{"tool":"readFile","arguments":{"path":"package.json"}},{"tool":"listFiles","arguments":{"path":"."}}]

User: "create a hello.js file with console log"
→ [{"tool":"createFile","arguments":{"path":"hello.js","content":"console.log('hello');"}}]

User: "show the contents of README.md"
→ [{"tool":"readFile","arguments":{"path":"README.md"}}]
`,
            },
            {
              role: "user",
              content: input,
            },
          ],
        });

      break;
    } catch (err) {
      if (err.status === 429) {
        console.log(
          `Retry ${attempt}/3: model busy`
        );

        await new Promise(
          resolve => setTimeout(resolve, 3000)
        );

        continue;
      }

      throw err;
    }
  }

  if (!completion) {
    throw new Error(
      "Model unavailable after retries"
    );
  }
  
  const raw =
    completion.choices[0].message.content;

  if (!raw) {
    throw new Error(
      "Model returned empty content"
    );
  }

  const cleaned =
  raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();


if (cleaned.includes("<|tool_call_begin|>")) {
  console.log("Tool-call format detected");
  return [];
}
    
console.log("AI RAW:", cleaned);

const parsed = JSON.parse(cleaned);

if (parsed.tool_calls) {
  return parsed.tool_calls;
}

if (parsed.function_calls) {
  return parsed.function_calls;
}

if (Array.isArray(parsed)) {
  return parsed;
}

return [parsed];

}