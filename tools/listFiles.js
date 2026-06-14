import fs from "fs";

export function listFiles({ path = "." } = {}) {
  return fs.readdirSync(path);
}