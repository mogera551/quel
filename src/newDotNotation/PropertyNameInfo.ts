
import { INewPropertyNameInfo } from "./types";

function _getPropertyNameInfo(name:string):INewPropertyNameInfo {
  const indexes = [];
  const patternPropElements = [];
  let isIncomplete = false;
  let lastIncompleteIndex = -1;
  for(const propElement of name.split(".")) {
    const index = Number(propElement);
    if (isNaN(index)) {
      patternPropElements.push(propElement);
      if (propElement === "*") {
        indexes.push(-1);
        isIncomplete = true;
        lastIncompleteIndex = indexes.length - 1;
      }
    } else {
      indexes.push(index);
      patternPropElements.push("*");
    }
  }
  return {
    name,
    isPrimitive: (patternPropElements.length === 1),
    isObjecct: (patternPropElements.length > 1 && indexes.length === 0),
    isArray: (patternPropElements.length > 1 && indexes.length > 0),
    isCompleteArray: (patternPropElements.length > 1 && indexes.length > 0 && !isIncomplete),
    isIncompleteArray: (patternPropElements.length > 1 && indexes.length > 0 && isIncomplete),
    patternName: patternPropElements.join("."),
    indexes,
  };
}

type PropertyNameInfoCache = {
  [name:string]:INewPropertyNameInfo;
}

const _cache:PropertyNameInfoCache = {};

export function getPropertyNameInfo(name:string):INewPropertyNameInfo {
  return _cache[name] ?? (_cache[name] = _getPropertyNameInfo(name));
}