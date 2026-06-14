// testModels.js

import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const models = [
  "openai/gpt-oss-20b:free",
  "meta-llama/llama-3.3-8b-instruct:free",
  "mistralai/mistral-small-3.2-24b-instruct:free"
];

for (const model of models) {
  try {
    console.log("\nTesting:", model);

    const response =
      await client.chat.completions.create({
        model,
        messages: [
          {
            role: "user",
            content: "Say hello"
          }
        ]
      });

 console.log(
  "MESSAGE OBJECT:",
  JSON.stringify(
    response.choices[0].message,
    null,
    2
  )
);
  } catch (err) {
    console.log(
      "FAILED:",
      err.message
    );
  }
}