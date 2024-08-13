import "../nop";

import { GetDirectSymbol, SetDirectSymbol } from "../@symbols/dotNotation";

interface INewPropertyNameInfo {
  name: string; // プロパティ名
  isPrimitive: boolean; // プリミティブなプロパティ名かどうか
  isObjecct: boolean; // 階層構造のプロパティ名かどうか、ドットが含まれる（ワイルドカード、数字を含まない）場合
  isArray: boolean; // 配列のプロパティ名かどうか、ドットが含まれる（ワイルドカードもしくは数字を含む）場合
  isCompleteArray: boolean; // 配列プロパティで、ワイルドカードが含まれない場合
  isIncompleteArray: boolean; // 配列プロパティで、ワイルドカードが含まれる場合
  patternName: string; // パターン名、数字をワイルドカードに変換したプロパティ名
  indexes: (number)[]; // 数字、ワイルドカードの配列、ワイルドカードの場合は-1
}

interface INewPatternNameInfo {
  name: string; // パターン名
  pathNames: string[]; // パス配列、パターン名をドットで分解した配列
  parentPathNames: string[]; // 親パス配列、パス配列から最後の要素を除いた配列
  parentPath: string; // 親パス名、親パス配列をドットで結合したもの
  parentPaths: string[]; // 全ての親パスのリスト ex. "a.b.c.d"の場合、["a", "a.b", "a.b.c"]
  setOfParentPaths: Set<string>; // 全ての親パスのセット
  lastPathName: string; // パス配列の最後の要素
  regexp: RegExp; // パターン名をマッチするための正規表現
  level: number; // ワイルドカードの数
  wildcardNames: string[]; // ワイルドカードのリスト  ex. "a.*.c.*"の場合、["a.*", "a.*.c.*"]
}

interface IHandler {
  get lastIndexes():(number[]|undefined);
  get lastIndexesString():string;
  get stackIndexes():(number[]|undefined)[];
  pushIndexes(indexes:number[], callback:()=>void):void;
  getByPatternNameAndIndexes(target:Object, {patternName, indexes}:{patternName:string, indexes:number[]}, receiver:any):any;
  setByPatternNameAndIndexes(target:Object, {patternName, indexes, value}:{patternName:string, indexes:number[], value:any}, receiver:any):boolean;
  getValuesAndLevelIndex (target:Object, {propertyNameInfo, lastIndexes}:{propertyNameInfo:IPropertyNameInfo, lastIndexes:number[]}, receiver:any):{ values:any[], levelIndex:number, indexes:number[] };
  getExpandLastIndex:(target:Object, receiver:any) => (propertyName:string, lastIndexes:number[]) => any[];
  setExpandLastIndex:(target:Object, receiver:any) => (propertyName:string, lastIndexes:number[], value:(any|any[])) => boolean;
  getDirect:(target:Object, {patternName, indexes}:{patternName:string, indexes:number[]}, receiver:any) => () => any;
  setDirect:(target:Object, {patternName, indexes, value}:{patternName:string, indexes:number[], value:any}, receiver:any) => void;
  get(target:Object, prop:PropertyKey, receiver:any):any;
  set(target:Object, prop:PropertyKey, value:any, receiver:any):boolean;
}

interface IProxy {
  [GetDirectSymbol]:(patternName:string, indexes:number[]) => any;
  [SetDirectSymbol]:(patternName:string, indexes:number[], value:any) => boolean;
  $1:number;
  $2:number;
  $3:number;
  $4:number;
  $5:number;
  $6:number;
  $7:number;
  $8:number;
  $9:number;
  $10:number;
  $11:number;
  $12:number;
  $13:number;
  $14:number;
  $15:number;
  $16:number;
}