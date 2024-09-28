import { utils } from "../utils";
import { getPropInfo } from "./getPropInfo";
import { Handler } from "./Handler";
import { GetExpandValuesFn } from "./types";
import { withIndexes as _withIndexes, IHandlerPartialForWithIndexes } from "./withIndexes";
import { getValue as _getValue, IHandlerPartialForGetValue } from "./getValue";
import { getValueWithoutIndexes as _getValueWithoutIndexes, IHandlerPartialForGetValueWithoutIndexes } from "./getValueWithoutIndexes";

type IHandlerPartial = Pick<Handler, "getLastIndexes">;

export type IHandlerPartialForGetExpandValues = IHandlerPartial & IHandlerPartialForWithIndexes & IHandlerPartialForGetValue & IHandlerPartialForGetValueWithoutIndexes;

export const getExpandValues = (handler: IHandlerPartialForGetExpandValues): GetExpandValuesFn => {
  const withIndexes = _withIndexes(handler);
  const getValue = _getValue(handler);
  const getValueWithoutIndexes = _getValueWithoutIndexes(handler);
  return function (
    target: object, 
    prop: string, 
    receiver: object
  ): any[] {
    // ex.
    // prop = "aaa.*.bbb.*.ccc", stack = { "aaa.*": [0] }
    // prop = "aaa.*.bbb.*.ccc", stack = { "aaa.*": [0], "aaa.*.bbb.*": [0,1] }
    // prop = "aaa.1.bbb.*.ccc", stack = { "aaa.*": [0], "aaa.*.bbb.*": [0,1] }
    // prop = "aaa.*.bbb.1.ccc", stack = { "aaa.*": [0], "aaa.*.bbb.*": [0,1] }
    const propInfo = getPropInfo(prop);
    let lastIndexes = undefined;
    for(let i = propInfo.wildcardPaths.length - 1; i >= 0; i--) {
      const wildcardPath = propInfo.wildcardPaths[i];
      lastIndexes = handler.getLastIndexes(wildcardPath);
      if (typeof lastIndexes !== "undefined") break;
    }
    lastIndexes = lastIndexes ?? [];
    let _lastIndex: number | undefined = undefined;
    const wildcardIndexes = propInfo.wildcardIndexes.map((i, index) => {
      if (typeof i === "undefined") {
        _lastIndex = index;
        return lastIndexes[index];
      } else {
        return i;
      }
    });
    const lastIndex = _lastIndex ?? (wildcardIndexes.length - 1);
    const wildcardPath = propInfo.wildcardPaths[lastIndex] ?? utils.raise(`wildcard path is undefined`);
    const wildcardPathInfo = getPropInfo(wildcardPath);
    const wildcardParentPath = wildcardPathInfo.paths[wildcardPathInfo.paths.length - 2] ?? utils.raise(`wildcard parent path is undefined`);
    const wildcardParentPathInfo = getPropInfo(wildcardParentPath);
    return withIndexes(
      propInfo, wildcardIndexes, () => {
      const parentValue = getValue(
        target, 
        wildcardParentPathInfo.patternPaths, 
        wildcardParentPathInfo.patternElements,
        wildcardIndexes, 
        wildcardParentPathInfo.paths.length - 1, 
        wildcardParentPathInfo.wildcardCount - 1, 
        receiver);
      if (!Array.isArray(parentValue)) utils.raise(`parent value is not array`);
      const values = [];
      for(let i = 0; i < parentValue.length; i++) {
        wildcardIndexes[lastIndex] = i;
        values.push(withIndexes(
          propInfo, wildcardIndexes, () => {
          return getValueWithoutIndexes(target, propInfo.pattern, receiver);
        }));
      }
      return values;
    });

  }
}
