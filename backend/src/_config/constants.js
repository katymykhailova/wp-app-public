const operatorsByType = {
  number: ["=", "<>", ">", "<", ">=", "<=", "in", "not in"],
  string: ["=", "<>", "in", "not in", "like"],
  date: ["=", "<>", ">", "<", ">=", "<=", "in", "not in"],
  select: ["in"],
};

export { operatorsByType };
