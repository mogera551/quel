
if (typeof Array.prototype.toSorted === 'undefined') {
  Array.prototype.toSorted = function(compareFn?: (a: any, b: any) => number) { 
    return this.slice().sort(compareFn);
  };
}