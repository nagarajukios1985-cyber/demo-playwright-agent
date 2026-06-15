export const toolSchemas = {

  readFile: {
    required: ["path"]
  },

  createFile: {
    required: ["path", "content"]
  },

  editFile: {
    required: ["path", "content"]
  },

  listFiles: {
    required: ["path"]
  },

  runCommand: {
    required: ["command"]
  }
};