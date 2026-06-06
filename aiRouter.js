import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function chooseTool(input) {
  const completion =
    await client.chat.completions.create({
      model: "moonshotai/kimi-k2.6:free",
      messages: [
        {
          role: "system",
          content: `
You are a tool router.

Available tools:
runCommand
listFiles
readFile
createFile
editFile

Return ONLY JSON.
`,
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

  // const raw =
  //   completion.choices[0].message.content;

const cleaned =
  raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

console.log("CLEANED:", cleaned);

return JSON.parse(cleaned);
}