export function chooseTool(input) {
  const text = input.toLowerCase();

  if (text.includes("file")) {
    return {
      tool: "listFiles",
      args: "."
    };
  }

  return {
    tool: "runCommand",
    args: input
  };
}