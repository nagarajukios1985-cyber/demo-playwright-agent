import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function summarizeResults(
  userInput,
  results
) {
  const completion =
    await client.chat.completions.create({
      model: "nex-agi/nex-n2-pro:free",
      messages: [
        {
          role: "system",
          content: `
You are an assistant.

Explain tool results to the user in a clear way.
Do not output JSON.
`,
        },
        {
          role: "user",
          content: `
User Request:
${userInput}

Tool Results:
${JSON.stringify(results, null, 2)}
`,
        },
      ],
    });

  return completion.choices[0].message.content;
}