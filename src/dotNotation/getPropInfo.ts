
import { IPropInfo } from './types';
import { getPatternInfo } from './getPatternInfo';
import { createLoopIndexes } from '../loopContext/createLoopIndexes';
import { ILoopIndexes, INamedLoopIndexes } from '../loopContext/types';

/**
 * constructorが指定されると、破綻するのでObjectではなくMapを使う
 */
const _cache = new Map<string, IPropInfo>();

export class PropInfo implements IPropInfo {
  name: string;
  pattern: string;
  elements: string[];
  paths: string[];
  wildcardCount: number;
  wildcardLoopIndexes: ILoopIndexes | undefined;
  wildcardNamedLoopIndexes: INamedLoopIndexes;
  allComplete: boolean;
  allIncomplete: boolean;
  patternElements: string[];
  patternPaths: string[];
  wildcardPaths: string[];
  constructor(
    name: string,
    pattern: string,
    elements: string[],
    paths: string[],
    wildcardCount: number,
    wildcardLoopIndexes: ILoopIndexes | undefined,
    wildcardNamedLoopIndexes: INamedLoopIndexes,
    allComplete: boolean,
    allIncomplete: boolean,
    patternElements: string[],
    patternPaths: string[],
    wildcardPaths: string[]
    ) {
    this.name = name;
    this.pattern = pattern;
    this.elements = elements;
    this.paths = paths;
    this.wildcardCount = wildcardCount;
    this.wildcardLoopIndexes = wildcardLoopIndexes;
    this.wildcardNamedLoopIndexes = wildcardNamedLoopIndexes;
    this.allComplete = allComplete;
    this.allIncomplete = allIncomplete;
    this.patternElements = patternElements;
    this.patternPaths = patternPaths;
    this.wildcardPaths = wildcardPaths;
  }
}

/**
 * プロパティ情報を取得します
 * @param name プロパティ名
 * @returns {IPropInfo} プロパティ情報
 */
function _getPropInfo(name:string):IPropInfo {
  const wildcardNamedLoopIndexes: INamedLoopIndexes = new Map;
  const elements = name.split(".");
  const tmpPatternElements = elements.slice();
  let wildcardLoopIndexes: ILoopIndexes | undefined = undefined;
  const paths = [];
  let incompleteCount = 0;
  let completeCount = 0;
  let lastPath = "";
  let wildcardCount = 0;
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
  const patternInfo = getPatternInfo(name);
  let tmpWildcardLoopIndexes = wildcardLoopIndexes;
  for(let i = patternInfo.wildcardPaths.length - 1; i >= 0; i--) {
    if (typeof tmpWildcardLoopIndexes === "undefined") throw new Error(`_getPropInfo: tmpWildcardLoopIndexes is undefined.`);
    wildcardNamedLoopIndexes.set(patternInfo.wildcardPaths[i], tmpWildcardLoopIndexes);
    tmpWildcardLoopIndexes = tmpWildcardLoopIndexes?.parentLoopIndexes;
  }

  return new PropInfo(
    name,
    pattern,
    elements,
    paths,
    wildcardCount,
    wildcardLoopIndexes,
    wildcardNamedLoopIndexes,
    completeCount === wildcardCount,
    incompleteCount === wildcardCount,
    patternInfo.patternElements,
    patternInfo.patternPaths,
    patternInfo.wildcardPaths
  )
}

export function getPropInfo(name:string):IPropInfo {
  let info;
  return _cache.get(name) ?? (info = _getPropInfo(name), _cache.set(name, info), info);
}