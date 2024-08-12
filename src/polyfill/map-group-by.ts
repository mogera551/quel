if (typeof Map.groupBy === 'undefined') {
  Map.groupBy = function (arr:any[], fn:(item:any, index:number)=>any) {
    return arr.reduce((acc, item, index) => {
      const key = fn(item, index);
      if (!acc.has(key)) {
        acc.set(key, []);
      }
      acc.get(key).push(item);
      return acc;
    }, new Map());
  }
}
