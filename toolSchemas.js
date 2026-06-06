  export const toolSchemas = {
  readFile: ["path"],

  listFiles: ["path"],

  createFile: [
    "path",
    "content",
  ],

  editFile: [
    "path",
    "content",
  ],

  runCommand: [
    "command",
  ],
};