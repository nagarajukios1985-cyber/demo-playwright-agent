import { runCommand } from "./runCommand.js";
import { listFiles } from "./listFiles.js";
import { readFile } from "./readFile.js";
import { createFile } from "./createFile.js";
import { editFile } from "./editFile.js";

export const toolRegistry = {
  runCommand,
  listFiles,
  readFile,
  createFile,
  editFile,
};