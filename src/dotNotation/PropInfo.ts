
import { IPatternInfo, IPropInfo } from '../@types/dotNotation';

const _cachePropInfo = new Map<string, IPropInfo>();
const _cachePatternInfo = new Map<string, IPatternInfo>();

function _getPatternInfo(pattern:string):IPatternInfo {
  const patternElements = pattern.split(".");
  const patternPaths = [];
  const wildcardPaths = [];
  for(let i = 0; i < patternElements.length; i++) {
    const patternElement = patternElements[i];
    if (patternElement === "*") {
      wildcardPaths.push(patternElements.slice(0, i + 1).join("."));
    }
    patternPaths.push(patternElements.slice(0, i + 1).join("."));
  }
  return {
    patternElements,
    patternPaths,
    wildcardPaths,
  }
}

export function getPatternInfo(pattern:string):IPatternInfo {
  if (_cachePatternInfo.has(pattern)) {
    return _cachePatternInfo.get(pattern)!;
  }
  const patternInfo = _getPatternInfo(pattern);
  _cachePatternInfo.set(pattern, patternInfo);
  return patternInfo;
}

function _getPropInfo(name:string):IPropInfo {
  const elements = name.split(".");
  const patternElements = elements.slice(0);
  const wildcardIndexes:(number|undefined)[] = [];
  const paths = [];
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
  }
  const pattern = patternElements.join(".");
  const wildcardCount = wildcardIndexes.length;
  return Object.assign({
    name,
    pattern,
    elements,
    patternElements,
    paths,
    wildcardCount,
    wildcardIndexes,
    lastIncompleteWildcardIndex,
  }, getPatternInfo(pattern));
}

export function getPropInfo(name:string):IPropInfo {
  if (_cachePropInfo.has(name)) {
    return _cachePropInfo.get(name)!;
  }
  const propInfo = _getPropInfo(name);
  _cachePropInfo.set(name, propInfo);
  return propInfo;
}