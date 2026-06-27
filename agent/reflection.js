export function reflect(toolName, result, error) {

  if (error) {

    if (error?.includes("ENOENT")) {

      if (toolName === "readFile") {
        return {
          lesson: "File does not exist",
          suggestion: "Use listFiles before readFile"
        };
      }

      if (toolName === "editFile") {
        return {
          lesson: "File does not exist",
          suggestion: "Use listFiles before editFile"
        };
      }
    }
    if (toolName === "runCommand") {
      return {
        lesson: "Command failed",
        suggestion: "Inspect command error before retrying"
      };
    }

    return {
      lesson: error,
      suggestion: "Try another approach"
    };
  }

  return {
    lesson: `${toolName} succeeded`,
    suggestion: "Continue task"
  };
}