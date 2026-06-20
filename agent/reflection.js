export function reflect(toolName, result, error) {

  if (error) {

    if (error.includes("ENOENT")) {
      return {
        lesson: "File does not exist",
        suggestion:
          "Use listFiles before readFile"
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