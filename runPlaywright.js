import { execSync } from "child_process";

export function runPlaywright() {
  return execSync(
    "npx playwright test",
    { encoding: "utf8" }
  );
}