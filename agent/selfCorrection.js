export function selfCorrect(reflection) {

  console.log(
    "SELF CORRECT RECEIVED:",
    reflection
  );

  if (
    reflection?.suggestion ===
    "Use listFiles before readFile"
  ) {
    return {
      tool: "listFiles",
      arguments: {
        path: "."
      }
    };
  }

  return null;
}