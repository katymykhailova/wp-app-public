export default ({ filter, order, ...params }) => ({
  ...params,
  ...(filter && { filter: JSON.stringify(filter) }),
  ...(order && { order: JSON.stringify(order) }),
});
