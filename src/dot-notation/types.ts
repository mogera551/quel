
export interface IPropertyNameInfo {
  name: string; // name property
  isPrimitive: boolean; // true if name don't has dot, wildcard
  isDotted: boolean; // true if name has dot
  hasWildcard: boolean; // true if name has wildcard
  patternName: string; // name with wildcard
  indexes: (number|undefined)[]; // indexes of wildcard
  isIncomplete: boolean; // true if name has wildcard at the end
  lastIncompleteIndex: number; // last index of wildcard
}

export interface IPatternNameInfo {
  name: string; // name property
  pathNames: string[]; // array, from separating name property by dot
  parentPathNames: string[]; // pathNames without last element
  parentPath: string; // join parentPathNames by dot
  parentPaths: string[]; // list of all parent paths
  setOfParentPaths: Set<string>; // set of parentPaths
  lastPathName: string; // last path name
  regexp: RegExp; // regular expression for matching name property
  level: number; // number of wildcard in pathNames
  isPrimitive: boolean; // true if pathNames has only one element
  wildcardNames: string[]; // list of wildcard names
}
