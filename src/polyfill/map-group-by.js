if (typeof Map.groupBy === 'undefined') {
  Map.groupBy = function (arr, fn) {
    return arr.reduce((acc, item) => {
      const key = fn(item);
      if (!acc.has(key)) {
        acc.set(key, []);
      }
      acc.get(key).push(item);
      return acc;
    }, new Map());
  }
}
