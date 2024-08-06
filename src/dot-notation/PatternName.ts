import { WILDCARD, DELIMITER } from "./Const";
import { IPatternNameInfo } from "./types";

function _getPatternNameInfo(name:string):IPatternNameInfo {
  const pathNames = name.split(DELIMITER);
  const parentPathNames = pathNames.slice(0, -1);
  const parentPaths = parentPathNames.reduce((paths:string[][], pathName:string):string[][] => { 
    paths.push(paths.at(-1)?.concat(pathName) ?? [pathName]);
    return paths;
  }, []).map((paths:string[]) => paths.join("."));
  const setOfParentPaths = new Set(parentPaths);
  const parentPath = parentPathNames.join(DELIMITER);
  const lastPathName = pathNames[pathNames.length - 1] ?? "";
  const regexp = new RegExp("^" + name.replaceAll(".", "\\.").replaceAll("*", "([0-9a-zA-Z_]*)") + "$");
  const level = pathNames.reduce((level, pathName) => level += (pathName === WILDCARD ? 1 : 0), 0);
  const isPrimitive = (pathNames.length === 1);
  const wildcardNames = [];
  for(let i = 0; i < pathNames.length; i++) {
    if (pathNames[i] === WILDCARD) {
      wildcardNames.push(pathNames.slice(0, i + 1).join("."));
    }
  }

  return {
    name,
    pathNames,
    parentPathNames,
    parentPaths,
    setOfParentPaths,
    parentPath,
    lastPathName,
    regexp,
    level,
    isPrimitive,
    wildcardNames,
  };
}

type PatternNameInfoCache = {
  [name:string]:IPatternNameInfo;
}

const _cache:PatternNameInfoCache = {};

export function getPatternNameInfo(name:string):IPatternNameInfo {
  return _cache[name] ?? (_cache[name] = _getPatternNameInfo(name));
}