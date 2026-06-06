export function normalizePlan(plan) {
  return {
    tool:
      plan.tool ||
      plan.name ||
      plan.command ||
      plan.action,

    arguments:
      plan.arguments ||
      plan.args ||
      plan.parameters ||
      (
        plan.action_input
          ? { path: plan.action_input }
          : {}
      )
  };
}