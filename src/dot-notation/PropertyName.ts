
import { IPropertyNameInfo } from "./types";

function _getPropertyNameInfo(name:string):IPropertyNameInfo {
  const indexes = [];
  const patternPropElements = [];
  let isIncomplete = false;
  let lastIncompleteIndex = -1;
  for(const propElement of name.split(".")) {
    const index = Number(propElement);
    if (isNaN(index)) {
      patternPropElements.push(propElement);
      if (propElement === "*") {
        indexes.push(undefined);
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
    isDotted: (patternPropElements.length > 1),
    hasWildcard: (indexes.length > 0),
    patternName: patternPropElements.join("."),
    isIncomplete,
    indexes,
    lastIncompleteIndex,
  };
}

type PropertyNameInfoCache = {
  [name:string]:IPropertyNameInfo;
}

const _cache:PropertyNameInfoCache = {};

export function getPropertyNameInfo(name:string):IPropertyNameInfo {
  return _cache[name] ?? (_cache[name] = _getPropertyNameInfo(name));
}