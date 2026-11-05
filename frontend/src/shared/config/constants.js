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
  text: [
    { key: "=", label: "=" },
    { key: "like", label: "enthält" },
  ],
};
