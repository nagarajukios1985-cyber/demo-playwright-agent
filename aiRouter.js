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
          model: "nex-agi/nex-n2-pro:free",
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
- When enough information exists, return done=true
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

  if (!completion) {
    throw new Error(
      "Model unavailable after retries"
    );
  }

  const message =
    completion.choices[0].message;

  console.log(
    "MESSAGE:",
    JSON.stringify(
      message,
      null,
      2
    )
  );

  const raw =
    message?.content;

  if (!raw?.trim()) {

    throw new Error(
      "Model returned empty content"
    );
  }

  return parseAIResponse(raw);
}