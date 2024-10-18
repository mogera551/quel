import { GetDependentPropsApiSymbol } from "../state/symbols";
import { getPatternInfo } from "../dotNotation/getPatternInfo";
import { IStatePropertyAccessor, IStateProxy, IStates } from "../state/types";
import { GetByPropInfoSymbol } from "../dotNotation/symbols";
import { createStatePropertyAccessor } from "../state/createStatePropertyAccessor";
import { getPropInfo } from "../dotNotation/getPropInfo";
import { ILoopIndexes } from "../loopContext/types";
import { createLoopIndexes } from "../loopContext/createLoopIndexes";
import { createNamedLoopIndexesFromAccessor } from "../loopContext/createNamedLoopIndexes";

function expandStateProperty(
  state:IStateProxy, 
  accessor:IStatePropertyAccessor, 
  updatedStatePropertiesSet:Set<string>,
  expandedPropertyAccessKeys:Set<string> = new Set([])
):IStatePropertyAccessor[] {
  const { pattern, loopIndexes } = accessor;
  const propertyAccessKey = pattern + "\t" + (loopIndexes?.toString() ?? "");

  // すでに展開済みの場合は何もしない
  if (expandedPropertyAccessKeys.has(propertyAccessKey)) return [];
  // 展開済みとしてマーク
  expandedPropertyAccessKeys.add(propertyAccessKey);

  // 依存関係を記述したプロパティ（$dependentProps）を取得
  const dependentProps = state[GetDependentPropsApiSymbol]();
  const props = dependentProps.propsByRefProp[pattern];
  if (typeof props === "undefined") return [];

  const propertyAccesses: IStatePropertyAccessor[] = [];
  const indexesKey: string[] = [];
  const curIndexes = [];
  for(let i = 0; i < (loopIndexes?.size ?? 0); i++) {
    curIndexes.push(loopIndexes?.at(i));
    indexesKey.push(curIndexes.toString());
  }

  for(const prop of props) {
    const curPropertyNameInfo = getPatternInfo(prop);

    // 親の配列が更新されている場合は、子の展開は不要
    const updatedParentArray = curPropertyNameInfo.wildcardPaths.some((wildcardPath, index) => {
      const propInfo = getPatternInfo(wildcardPath);
      const parentPath = propInfo.patternPaths.at(-2);
      const key = parentPath + "\t" + (indexesKey[index - 1] ?? "");
      return updatedStatePropertiesSet.has(key);
    });
    if (updatedParentArray) {
      continue;
    }

    if ((loopIndexes?.size ?? 0) < curPropertyNameInfo.wildcardPaths.length) {
      // ワイルドカードのインデックスを展開する
      const listOfIndexes = expandIndexes(state, createStatePropertyAccessor(prop, loopIndexes));
      propertyAccesses.push(...listOfIndexes.map(loopIndexes => createStatePropertyAccessor(prop, loopIndexes)));
    } else {
      // ワイルドカードのインデックスを展開する必要がない場合
      const notifyIndexes = loopIndexes?.truncate(curPropertyNameInfo.wildcardPaths.length);
      propertyAccesses.push(createStatePropertyAccessor(prop, notifyIndexes));
    }

    // 再帰的に展開
    propertyAccesses.push(...expandStateProperty(state, createStatePropertyAccessor(prop, loopIndexes), updatedStatePropertiesSet, expandedPropertyAccessKeys));
  }
  return propertyAccesses;
}

function expandIndexes(
  state:IStateProxy, 
  statePropertyAccessor:IStatePropertyAccessor
):ILoopIndexes[] {
  const { pattern, loopIndexes } = statePropertyAccessor;
  if (typeof loopIndexes === "undefined") return [];
  const propInfo = getPropInfo(pattern);
  if (propInfo.wildcardCount === loopIndexes.size) {
    return [ loopIndexes ];
  } else if (propInfo.wildcardCount < loopIndexes.size) {
    return [ loopIndexes.truncate(propInfo.wildcardCount) as ILoopIndexes ];
  } else {
    const getValuesLength = (name:string, loopIndexes:ILoopIndexes | undefined) => {
      const accessor = createStatePropertyAccessor(name, loopIndexes);
      const namedLoopIndexes = createNamedLoopIndexesFromAccessor(accessor);
      return state.updator?.namedLoopIndexesStack?.setNamedLoopIndexes(namedLoopIndexes, () => {
        return state[GetByPropInfoSymbol](propInfo).length;
      });
    }
    const traverse = (parentName:string, elementIndex:number, _loopIndexes:ILoopIndexes | undefined):ILoopIndexes[] => {
      const parentNameDot = parentName !== "" ? (parentName + ".") : parentName;
      const element = propInfo.elements[elementIndex];
      const isTerminate = (propInfo.elements.length - 1) === elementIndex;
      if (isTerminate) {
        // 終端の場合
        if (element === "*") {
          const indexesArray: ILoopIndexes[] = [];
          const len = getValuesLength(parentName, _loopIndexes);
          for(let i = 0; i < len; i++) {
            indexesArray.push(createLoopIndexes(_loopIndexes, i));
          }
          return indexesArray;
        } else {
          return (typeof _loopIndexes !== "undefined") ? [ _loopIndexes ] : [];
        }
      } else {
        // 終端でない場合
        const currentName = parentNameDot + element;
        if (element === "*") {
          if (loopIndexes.size < (_loopIndexes?.size ?? 0)) {
            return traverse(currentName, elementIndex + 1, _loopIndexes?.truncate(loopIndexes.size + 1));
          } else {
            const indexesArray = [];
            const len = getValuesLength(parentName, _loopIndexes);
            for(let i = 0; i < len; i++) {
                indexesArray.push(...traverse(currentName, elementIndex + 1, createLoopIndexes(_loopIndexes, i)));
            }
            return indexesArray;
          }
        } else {
          return traverse(currentName, elementIndex + 1, loopIndexes);
        }
      }
    };
    return traverse("", 0, undefined);
  }
}

export function expandStateProperties(
  states: IStates, 
  updatedStateProperties: IStatePropertyAccessor[]
): IStatePropertyAccessor[] {
  // expand state properties
  const expandedStateProperties = updatedStateProperties.slice(0);
  const updatedStatePropertiesSet = new Set(updatedStateProperties.map(prop => prop.pattern + "\t" + (prop.loopIndexes?.toString() ?? "") ));
  for(let i = 0; i < updatedStateProperties.length; i++) {
    expandedStateProperties.push.apply(expandedStateProperties, expandStateProperty(
      states.current, updatedStateProperties[i], updatedStatePropertiesSet
    ));
  }
  return expandedStateProperties;
}
