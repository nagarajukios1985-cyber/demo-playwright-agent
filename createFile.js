import fs from "fs";

export function createFile({ path, content }) {
  fs.writeFileSync(path, content);

  return {
    success: true,
    path,
  };
}