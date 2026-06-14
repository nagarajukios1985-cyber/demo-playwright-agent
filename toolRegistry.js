import { runCommand } from "./tools/runCommand.js";
import { listFiles } from "./tools/listFiles.js";
import { readFile } from "./tools/readFile.js";
import { createFile } from "./tools/createFile.js";
import { editFile } from "./tools/editFile.js";

export const toolRegistry = {
  runCommand,
  listFiles,
  readFile,
  createFile,
  editFile,
};