
export interface PropertyNameInfo {
  name: string; // name property
  isPrimitive: boolean; // true if name don't has dot, wildcard
  isDotted: boolean; // true if name has dot
  hasWildcard: boolean; // true if name has wildcard
  patternName: string; // name with wildcard
  indexes: (number|undefined)[]; // indexes of wildcard
  isIncomplete: boolean; // true if name has wildcard at the end
  lastIncompleteIndex: number; // last index of wildcard
}
