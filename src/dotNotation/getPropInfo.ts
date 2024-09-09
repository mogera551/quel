
import { IPropInfo } from './types';
import { getPatternInfo } from './getPatternInfo';

/**
 * constructorが指定されると、破綻するのでObjectではなくMapを使う
 */
const _cache = new Map<string, IPropInfo>();

function _getPropInfo(name:string):IPropInfo {
  const elements = name.split(".");
  const patternElements = elements.slice(0);
  const wildcardIndexes:(number|undefined)[] = [];
  const paths = [];
  let lastIncompleteWildcardIndex = -1;
  let incompleteCount = 0;
  let completeCount = 0;
  let lastPath = "";
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
    lastPath += element;
    paths.push(lastPath);
    lastPath += (i < elements.length - 1 ? "." : "");
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
  return _cache.get(name) ?? (info = _getPropInfo(name), _cache.set(name, info), info);
}