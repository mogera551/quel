
import { IPropInfo } from './types';

const _cache = new Map<string, IPropInfo>();

function _getPropInfo(name:string):IPropInfo {
  const elements = name.split(".");
  const patternElements = elements.slice(0);
  const wildcardIndexes:(number|undefined)[] = [];
  const paths = [];
  const patternPaths = [];
  const wildcardPaths = [];
  let lastIncompleteWildcardIndex = -1;
  for(let i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (element === "*") {
      wildcardIndexes.push(undefined);
      patternElements[i] = "*";
      lastIncompleteWildcardIndex = wildcardIndexes.length - 1;
    } else {
      const number = Number(element);
      if (!Number.isNaN(number)) {
        wildcardIndexes.push(number);
        patternElements[i] = "*";
      }
    }
    paths.push(elements.slice(0, i + 1).join("."));
    patternPaths.push(patternElements.slice(0, i + 1).join("."));
    if (patternElements[i] === "*") {
      wildcardPaths.push(patternPaths[i]);
    }
  }
  const pattern = patternElements.join(".");
  const wildcardCount = wildcardIndexes.length;
  return {
    name,
    pattern,
    elements,
    patternElements,
    paths,
    patternPaths,
    wildcardPaths,
    wildcardCount,
    wildcardIndexes,
    lastIncompleteWildcardIndex,
  }
}

export function getPropInfo(name:string):IPropInfo {
  if (_cache.has(name)) {
    return _cache.get(name)!;
  }
  const propInfo = _getPropInfo(name);
  _cache.set(name, propInfo);
  return propInfo;
}