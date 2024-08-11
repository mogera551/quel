
if (typeof Array.prototype.toSorted === 'undefined') {
  Array.prototype.toSorted = function() {
    return this.slice().sort();
  };
}