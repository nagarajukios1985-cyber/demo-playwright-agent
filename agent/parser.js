export function parseAIResponse(raw) {

  const cleaned =
    raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

  console.log(
    "AI RAW:",
    cleaned
  );

  const parsed =
    JSON.parse(cleaned);

  if (
    parsed.done === true
  ) {
    return parsed;
  }

  if (parsed.tool_calls) {
    return parsed.tool_calls;
  }

  if (parsed.function_calls) {
    return parsed.function_calls;
  }

  if (Array.isArray(parsed)) {
    return parsed;
  }

  return [parsed];
}