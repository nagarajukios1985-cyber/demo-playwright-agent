import { verifierRegistry } from "./verifiers/verifierRegistry.js";

export function verify(toolName, input, result) {

  const verifier =
    verifierRegistry[toolName];

  if (!verifier) {
    return {
      verified: true,
      message: "Verification not implemented yet"
    };
  }

  return verifier(
    input,
    result
  );
}