
export interface PatternNameInfo {
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
