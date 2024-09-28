import { utils } from "../utils";
import { getPropInfo } from "./getPropInfo";
import { Handler } from "./Handler";
import { SetExpandValuesFn } from "./types";
import { withIndexes as _withIndexes } from "./withIndexes";
import { getValue as _getValue } from "./getValue";
import { setValueWithoutIndexes as _setValueWithoutIndexes } from "./setValueWithoutIndexes";

type IHandlerPartial = Pick<Handler, "stackIndexes"|"stackNamedWildcardIndexes"|"cache"|"findPropertyCallback"|"getLastIndexes">;

export const setExpandValues = (handler: IHandlerPartial): SetExpandValuesFn => {
  const withIndexes = _withIndexes(handler);
  const getValue = _getValue(handler);
  const setValueWithoutIndexes = _setValueWithoutIndexes(handler);
  return function (
    target: object, 
    prop: string, 
    value: any, 
    receiver: object
  ) {
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
    withIndexes(
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
      for(let i = 0; i < parentValue.length; i++) {
        wildcardIndexes[lastIndex] = i;
        withIndexes(
          propInfo, wildcardIndexes, Array.isArray(value) ? 
          () => setValueWithoutIndexes(target, propInfo.pattern, value[i], receiver) :
          () => setValueWithoutIndexes(target, propInfo.pattern, value, receiver));
      }
    });
  }
}
