export default async (arr, limit, mapper) => {
  const result = [];
  let idx = 0;
  const arrLen = arr.length;

  const workers = Array.from({ length: Math.min(limit, arrLen) }, async () => {
    while (idx < arrLen) {
      const current = idx++;
      result[current] = await mapper(arr[current], current);
    }
  });

  await Promise.all(workers);
  return result;
};
