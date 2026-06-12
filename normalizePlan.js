export function normalizePlan(plan) {
  const args =
    plan.arguments ||
    plan.args ||
    plan.parameters ||
    (
      plan.action_input
        ? { path: plan.action_input }
        : {}
    );

  return {
    tool:
      plan.tool ||
      plan.type ||
      plan.name ||
      plan.command ||
      plan.action,
    arguments: {
      path:
        args.path ||
        args.filePath ||
        args.file_path ||
        args.directoryPath ||
        args.directory_path,

      content:
        args.content,

      command:
        args.command
    }
  };
}