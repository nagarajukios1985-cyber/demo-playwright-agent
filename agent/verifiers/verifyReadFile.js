export function verifyReadFile(input, result) {

  if (
    typeof result === "string" &&
    result.trim().length > 0
  ) {
    return {
      verified: true,
      message: "File content verified"
    };
  }

  return {
    verified: false,
    message: "File is empty"
  };

}