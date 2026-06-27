import OpenAI from "openai";
// import "dotenv/config";

const client = new OpenAI({
  baseURL: "http://localhost:1234/v1",
  apiKey: "lm-studio"
});

export async function summarizeResults(
  userInput,
  results
) {
  const completion =
    await client.chat.completions.create({
      model: "qwen/qwen3-8b",
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