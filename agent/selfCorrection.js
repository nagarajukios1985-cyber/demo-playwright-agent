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

  /*
    If an edit fails because the target file is missing,
    inspect the project before trying another edit.
  */
  if (
    reflection?.suggestion ===
    "Use listFiles before editFile"
  ) {
    return {
      tool: "listFiles",
      arguments: {
        path: "."
      }
    };
  }

if (
    reflection?.suggestion ===
    "Inspect command error before retrying"
  ) {
    return null;
  }

  return null;
}