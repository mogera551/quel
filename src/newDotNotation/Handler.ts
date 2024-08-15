import { utils } from "../utils";
import { StackSymbol } from "./Const";
import { getPatternNameInfo } from "./PatternNameInfo";
import { getPropertyNameInfo } from "./PropertyNameInfo";
import { INewHandler, INewPatternNameInfo, INewPropertyNameInfo } from "./types";


class Handler  {
  _get(
    target: object,
    name: string, 
    indexes: number[],
    receiver: any // todo: receiverの型を調べる
  ):any {
    const propertyInfo = getPropertyNameInfo(name);
    if (propertyInfo.isPrimitive) {
      return Reflect.get(this, name);
    }

    if (Reflect.has(target, name)) {
      return Reflect.get(target, name, receiver);
    }
    const patternInfo = getPatternNameInfo(name);
    if (propertyInfo.isObjecct) {
      const parentValue = this._get(target, patternInfo.parentPath, indexes, receiver);
      return Reflect.get(parentValue, patternInfo.lastPathName, receiver);
    }
    if (propertyInfo.isCompleteArray) {
      return this._get(target, propertyInfo.patternName, propertyInfo.indexes, receiver);
    } else {

    }

  }

  stackIndexes: number[][] = [];
  _stackSymbol(indexes:number[], callback:()=>any):any {
    this.stackIndexes.push(indexes);
    try {
      return callback();
    } finally {
      this.stackIndexes.pop();
    }
  }

}