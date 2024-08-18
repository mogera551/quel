import { getPropInfo } from "./PropInfo";
import { IPropInfo } from "./types";

const getValue = (
  target:object, 
  propInfo:IPropInfo, 
  wildcardIndexes:number[], 
  receiver:object, 
) => (pathIndex:number, wildcardIndex:number):any => {
  const path = propInfo.paths[pathIndex];
  if (path in target) {
    return Reflect.get(target, path, receiver);
  }
  const pattern = propInfo.patternPaths[pathIndex];
  if (path !== pattern) {
    if (pattern in target) {
      return Reflect.get(target, pattern, receiver);
    }
  }
  if (pathIndex === 0) return undefined; 
  const element = propInfo.patternElements[pathIndex];
  const isWildcard = element === "*";
  const parentValue = getValue(target, propInfo, wildcardIndexes, receiver)(pathIndex - 1, wildcardIndex - (isWildcard ? 1 : 0));
  if (isWildcard) {
    return parentValue[wildcardIndexes[wildcardIndex]];
  } else {
    return parentValue[element];
  }
}


export class Handler {
  _stackIndexes:number[][] = [];
  get lastStackIndexes():number[] {
    return this._stackIndexes[this._stackIndexes.length - 1] ?? [];
  }
  withIndexes(indexes:number[], callback:()=>void):any {
    this._stackIndexes.push(indexes);
    try {
      return callback();
    } finally {
      this._stackIndexes.pop();
    }
  }
  
  _get(target:object, prop:string, receiver:object) {
    const propInfo = getPropInfo(prop);
    const lastStackIndexes = this.lastStackIndexes;
    const wildcardIndexes = propInfo.wildcardIndexes.map((i, index) => i ?? lastStackIndexes[index]);
    const _getValue = getValue(target, propInfo, wildcardIndexes, receiver);
    return this.withIndexes(wildcardIndexes, () => {
      return _getValue(propInfo.paths.length - 1, propInfo.wildcardCount - 1);
    });
  }

  _set(target:object, prop:string, value:any, receiver:object):boolean {
    const propInfo = getPropInfo(prop);
    if (propInfo.elements.length === 1) {
      Reflect.set(target, prop, value, receiver);
    } else {
      const lastStackIndexes = this.lastStackIndexes;
      const wildcardIndexes = propInfo.wildcardIndexes.map((i, index) => i ?? lastStackIndexes[index]);
      const _getValue = getValue(target, propInfo, wildcardIndexes, receiver);
      return this.withIndexes(wildcardIndexes, () => {
        const lastPatternElement = propInfo.patternElements[propInfo.patternElements.length - 1];
        const lastElement = propInfo.elements[propInfo.elements.length - 1];
        const parentValue = _getValue(propInfo.paths.length - 2, propInfo.wildcardCount - (lastPatternElement === "*" ? 1 : 0) - 1);
        if (lastPatternElement === "*") {
          parentValue[wildcardIndexes[wildcardIndexes.length - 1]] = value;
        } else {
          parentValue[lastElement] = value;
        }
        return true;
      });
    }
    return true;
  }



}
