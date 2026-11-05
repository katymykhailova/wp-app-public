const operatorsByType = {
  number: ["=", "<>", ">", "<", ">=", "<=", "in", "not in"],
  text: ["=", "<>", "in", "not in", "like"],
  date: ["=", "<>", ">", "<", ">=", "<=", "in", "not in"],
  select: ["in"],
};

export { operatorsByType };
