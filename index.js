import { runFixLoop } from "./agent/fixLoop.js";

const input = process.argv.slice(2).join(" ");

if (!input) {
  console.log('Usage: node index.js "your command"');
  process.exit(1);
}

console.log("Ask:", input);

const result = await runFixLoop(input);

console.log("\n=== FINAL RESULT ===");
console.log(JSON.stringify(result, null, 2));