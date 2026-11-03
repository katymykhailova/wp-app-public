export const operatorsByType = {
  select: [{ key: "in", label: "in" }],
  number: [
    { key: "=", label: "=" },
    { key: ">", label: ">" },
    { key: "<", label: "<" },
    { key: ">=", label: "≥" },
    { key: "<=", label: "≤" },
    { key: "<>", label: "≠" },
  ],
  string: [
    { key: "=", label: "=" },
    { key: "like", label: "enthält" },
  ],
};
