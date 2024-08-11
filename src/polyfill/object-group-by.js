
if (typeof Object.groupBy === 'undefined') {
  Object.groupBy = function (array, key) {
    return array.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };
}