
import { IPropInfo } from './types';
import { getPatternInfo } from './getPatternInfo';
import { createLoopIndexes } from '../loopContext/createLoopIndexes';
import { ILoopIndexes } from '../loopContext/types';

/**
 * constructorが指定されると、破綻するのでObjectではなくMapを使う
 */
const _cache = new Map<string, IPropInfo>();

/**
 * プロパティ情報を取得します
 * @param name プロパティ名
 * @returns {IPropInfo} プロパティ情報
 */
function _getPropInfo(name:string):IPropInfo {
  const elements = name.split(".");
  const patternElements = elements.slice(0);
  const wildcardIndexes:(number|undefined)[] = [];
  let wildcardLoopIndexes: ILoopIndexes | undefined = undefined;
  const paths = [];
  let lastIncompleteWildcardIndex = -1;
  let incompleteCount = 0;
  let completeCount = 0;
  let lastPath = "";
  let wildcardCount = 0;
  for(let i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (element === "*") {
      wildcardLoopIndexes = createLoopIndexes(wildcardLoopIndexes, undefined);
      wildcardIndexes.push(undefined);
      patternElements[i] = "*";
      lastIncompleteWildcardIndex = wildcardIndexes.length - 1;
      incompleteCount++;
      wildcardCount++;
    } else {
      const number = Number(element);
      if (!Number.isNaN(number)) {
        wildcardLoopIndexes = createLoopIndexes(wildcardLoopIndexes, number);
        wildcardIndexes.push(number);
        patternElements[i] = "*";
        completeCount++;
        wildcardCount++;
      }
    }
    lastPath += element;
    paths.push(lastPath);
    lastPath += (i < elements.length - 1 ? "." : "");
  }
  const pattern = patternElements.join(".");
//  const wildcardCount = wildcardIndexes.length;
  return Object.assign({
    name,
    pattern,
    elements,
    patternElements,
    paths,
    wildcardCount,
    wildcardIndexes,
    wildcardLoopIndexes,
    lastIncompleteWildcardIndex,
    allComplete: completeCount === wildcardCount,
    allIncomplete: incompleteCount === wildcardCount,
  }, getPatternInfo(pattern));
}

export function getPropInfo(name:string):IPropInfo {
  let info;
  return _cache.get(name) ?? (info = _getPropInfo(name), _cache.set(name, info), info);
}