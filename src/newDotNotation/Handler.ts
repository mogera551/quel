import { utils } from "../utils";
import { StackSymbol } from "./Const";
import { getPatternNameInfo } from "./PatternNameInfo";
import { getPropertyNameInfo } from "./PropertyNameInfo";
import { INewHandler, INewPatternNameInfo, INewPropertyNameInfo } from "./types";



class Handler  {
  _get(
    target: object,
    name: string,
    receiver: any, // todo:
  ):any {
    // すでにスタックにインデックスは積まれている

  }

  


  _get_old(
    target: object,
    name: string, 
    receiver: any // todo: receiverの型を調べる
  ):any {
    const propertyInfo = getPropertyNameInfo(name);
    if (propertyInfo.isPrimitive) {
      return Reflect.get(target, name, receiver);
    }

    if (Reflect.has(target, name)) {
      return Reflect.get(target, name, receiver);
    }
    const patternInfo = getPatternNameInfo(name);
    if (propertyInfo.isObjecct) {
      const parentValue = this._get(target, patternInfo.parentPath, receiver);
      return Reflect.get(parentValue, patternInfo.lastPathName, receiver);
    }
    if (propertyInfo.isCompleteArray) {
      return this._stackIndexes(propertyInfo.indexes, (indexes) => {
        const parentValue = this._get(target, patternInfo.parentPath, receiver);
        if (patternInfo.lastPathName === "*") {
          return Reflect.get(parentValue, indexes[patternInfo.level], receiver);
        } else {
          return Reflect.get(parentValue, patternInfo.lastPathName, receiver);
        }
      });
    } else {

    }

  }

  stackIndexes: number[][] = [];
  _stackIndexes(indexes:number[], callback:(indexes:number[])=>any):any {
    this.stackIndexes.push(indexes);
    try {
      return callback(indexes);
    } finally {
      this.stackIndexes.pop();
    }
  }

  get _lastIndexes():number[] {
    return this.stackIndexes[this.stackIndexes.length - 1];
  }
}