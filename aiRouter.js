import OpenAI from "openai";
import "dotenv/config";
import { parseAIResponse } from "./agent/parser.js"

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function chooseTool(input) {
  let completion;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      completion =
        await client.chat.completions.create({
          model: "qwen/qwen3-8b",
          messages: [
            {
              role: "system",
              content: `
You are an autonomous coding agent.

Available tools:

- readFile
- listFiles
- createFile
- editFile
- runCommand

You must respond with ONLY valid JSON.

If information is needed, call a tool:

[
  {
    "tool": "readFile",
    "arguments": {
      "path": "package.json"
    }
  }
]

When the task is complete:

{
  "done": true,
  "answer": "final answer here"
}

Rules:

- Return JSON only
- No markdown
- No explanations
- No code blocks
- Use tools whenever information is missing

- Do not return done=true
  if a tool can still be used.

- If a file is missing,
  analyze previous tool results
  and continue searching.

- Only return done=true
  when the user's goal is achieved
  or no further action is possible.
`
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

  if (
    !completion ||
    !completion.choices ||
    completion.choices.length === 0
  ) {
    throw new Error(
      "Model returned no choices"
    );
  }
  const message =
    completion.choices[0].message;

  const raw =
    message?.content;

  if (!raw?.trim()) {

    throw new Error(
      "Model returned empty content"
    );
  }

  return parseAIResponse(raw);
}