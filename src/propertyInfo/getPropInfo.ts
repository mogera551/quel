
import { IPropInfo, WildcardType } from './types';
import { getPatternInfo } from './getPatternInfo';
import { createLoopIndexes } from '../loopContext/createLoopIndexes';
import { ILoopIndexes, INamedLoopIndexes } from '../loopContext/types';

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
  let expandable = false;
  if (name[0] === "@") {
    name = name.slice(1);
    expandable = true;
  }
  const wildcardNamedLoopIndexes: INamedLoopIndexes = new Map;
  const elements = name.split(".");
  const tmpPatternElements = elements.slice();
  let wildcardLoopIndexes: ILoopIndexes | undefined = undefined;
  const paths = [];
  let incompleteCount = 0;
  let completeCount = 0;
  let lastPath = "";
  let wildcardCount = 0;
  let wildcardType: WildcardType = "none";
  for(let i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (element === "*") {
      wildcardLoopIndexes = createLoopIndexes(wildcardLoopIndexes, undefined);
      tmpPatternElements[i] = "*";
      incompleteCount++;
      wildcardCount++;
    } else {
      const number = Number(element);
      if (!Number.isNaN(number)) {
        wildcardLoopIndexes = createLoopIndexes(wildcardLoopIndexes, number);
        tmpPatternElements[i] = "*";
        completeCount++;
        wildcardCount++;
      }
    }
    lastPath += element;
    paths.push(lastPath);
    lastPath += (i < elements.length - 1 ? "." : "");
  }
  const pattern = tmpPatternElements.join(".");
  const patternInfo = getPatternInfo(pattern);
  let tmpWildcardLoopIndexes = wildcardLoopIndexes;
  for(let i = patternInfo.wildcardPaths.length - 1; i >= 0; i--) {
    if (typeof tmpWildcardLoopIndexes === "undefined") throw new Error(`_getPropInfo: tmpWildcardLoopIndexes is undefined.`);
    wildcardNamedLoopIndexes.set(patternInfo.wildcardPaths[i], tmpWildcardLoopIndexes);
    tmpWildcardLoopIndexes = tmpWildcardLoopIndexes?.parentLoopIndexes;
  }
  if (incompleteCount > 0 || completeCount > 0) {
    if (incompleteCount === wildcardCount) {
      wildcardType = "context";
    } else if (completeCount === wildcardCount) {
      wildcardType = "all";
    } else {
      wildcardType = "partial";
    }
  }

  return {
    name,
    expandable,
    pattern,
    elements,
    paths,
    wildcardCount,
    wildcardLoopIndexes,
    wildcardNamedLoopIndexes,
    patternElements: patternInfo.patternElements,
    patternPaths: patternInfo.patternPaths,
    wildcardPaths: patternInfo.wildcardPaths,
    wildcardType
  }
}

export function getPropInfo(name:string):IPropInfo {
  let info;
  return _cache.get(name) ?? (info = _getPropInfo(name), _cache.set(name, info), info);
}