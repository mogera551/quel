import { IPatternInfo } from './types';

/**
 * constructorが指定されると、破綻するのでObjectではなくMapを使う
 */
const _cache = new Map<string, IPatternInfo>();

function _getPatternInfo(pattern:string):IPatternInfo {
  const patternElements = pattern.split(".");
  const patternPaths = [];
  const wildcardPaths = [];
  for(let i = 0; i < patternElements.length; i++) {
    let patternPath = "";
    for(let j = 0; j <= i; j++) {
      patternPath += patternElements[j] + (j < i ? "." : "");
    }
    if (patternElements[i] === "*") {
      wildcardPaths.push(patternPath);
    }
    patternPaths.push(patternPath);
  }
  return {
    patternElements,
    patternPaths,
    wildcardPaths,
  }
}

export function getPatternInfo(pattern:string):IPatternInfo {
  let info;
  return _cache.get(pattern) ?? (info = _getPatternInfo(pattern), _cache.set(pattern, info), info);
}
