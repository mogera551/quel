
import { all } from '../../node_modules/axios/index';
import { IPatternInfo, IPropInfo } from './types';

/**
 * constructorが指定されると、破綻するのでObjectではなくMapを使う
 */
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
  let info;
  return _cachePatternInfo.get(pattern) ?? (info = _getPatternInfo(pattern), _cachePatternInfo.set(pattern, info), info);
}

function _getPropInfo(name:string):IPropInfo {
  const elements = name.split(".");
  const patternElements = elements.slice(0);
  const wildcardIndexes:(number|undefined)[] = [];
  const paths = [];
  let lastIncompleteWildcardIndex = -1;
  let incompleteCount = 0;
  let completeCount = 0;
  for(let i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (element === "*") {
      wildcardIndexes.push(undefined);
      patternElements[i] = "*";
      lastIncompleteWildcardIndex = wildcardIndexes.length - 1;
      incompleteCount++;
    } else {
      const number = Number(element);
      if (!Number.isNaN(number)) {
        wildcardIndexes.push(number);
        patternElements[i] = "*";
        completeCount++;
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
    allComplete: completeCount === wildcardCount,
    allIncomplete: incompleteCount === wildcardCount,
  }, getPatternInfo(pattern));
}

export function getPropInfo(name:string):IPropInfo {
  let info;
  return _cachePropInfo.get(name) ?? (info = _getPropInfo(name), _cachePropInfo.set(name, info), info);
}