import fs from "fs";

export function editFile({ path, content }) {
  fs.writeFileSync(path, content);

  return {
    success: true,
    path,
    message: "File updated",
  };
}