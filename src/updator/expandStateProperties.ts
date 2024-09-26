import { GetDependentPropsApiSymbol } from "../state/symbols";
import { IPropertyAccess } from "../binding/types";
import { getPatternInfo } from "../dotNotation/getPatternInfo";
import { IStateProxy, IStates } from "../state/types";
import { createPropertyAccess } from "../binding/createPropertyAccess";
import { GetDirectSymbol } from "../dotNotation/symbols";

function expandStateProperty(
  state:IStateProxy, 
  propertyAccess:IPropertyAccess, 
  updatedStatePropertiesSet:Set<string>,
  expandedPropertyAccessKeys:Set<string> = new Set([])
):IPropertyAccess[] {
  const { propInfo, indexes } = propertyAccess;
  const propertyAccessKey = propInfo.pattern + "\t" + indexes.toString();

  // すでに展開済みの場合は何もしない
  if (expandedPropertyAccessKeys.has(propertyAccessKey)) return [];
  // 展開済みとしてマーク
  expandedPropertyAccessKeys.add(propertyAccessKey);

  // 依存関係を記述したプロパティ（$dependentProps）を取得
  const dependentProps = state[GetDependentPropsApiSymbol]();
  const props = dependentProps.propsByRefProp[propInfo.pattern];
  if (typeof props === "undefined") return [];

  const propertyAccesses = [];
  const indexesKey: string[] = [];
  const curIndexes = [];
  for(let i = 0; i < indexes.length; i++) {
    curIndexes.push(indexes[i]);
    indexesKey.push(curIndexes.toString());
  }

  for(const prop of props) {
    const curPropertyNameInfo = getPatternInfo(prop);

    // 親の配列が更新されている場合は、子の展開は不要
    const updatedParentArray = curPropertyNameInfo.wildcardPaths.some((wildcardPath, index) => {
      const propInfo = getPatternInfo(wildcardPath);
      const parentPath = propInfo.patternPaths[propInfo.patternPaths.length - 2];
      const key = parentPath + "\t" + (indexesKey[index - 1] ?? "");
      return updatedStatePropertiesSet.has(key);
    });
    if (updatedParentArray) {
      continue;
    }

    if (indexes.length < curPropertyNameInfo.wildcardPaths.length) {
      // ワイルドカードのインデックスを展開する
      const listOfIndexes = expandIndexes(state, createPropertyAccess(prop, indexes));
      propertyAccesses.push(...listOfIndexes.map(indexes => createPropertyAccess(prop, indexes)));
    } else {
      // ワイルドカードのインデックスを展開する必要がない場合
      const notifyIndexes = indexes.slice(0, curPropertyNameInfo.wildcardPaths.length);
      propertyAccesses.push(createPropertyAccess(prop, notifyIndexes));
    }

    // 再帰的に展開
    propertyAccesses.push(...expandStateProperty(state, createPropertyAccess(prop, indexes), updatedStatePropertiesSet, expandedPropertyAccessKeys));
  }
  return propertyAccesses;
}

function expandIndexes(
  state:IStateProxy, 
  propertyAccess:IPropertyAccess
):number[][] {
  const { propInfo, indexes } = propertyAccess;
  if (propInfo.wildcardCount === indexes.length) {
    return [ indexes ];
  } else if (propInfo.wildcardCount < indexes.length) {
    return [ indexes.slice(0, propInfo.wildcardCount) ];
  } else {
    const getValuesLength = (name:string, indexes:number[]) => state[GetDirectSymbol](name, indexes).length;
    const traverse = (parentName:string, elementIndex:number, loopIndexes:number[]):number[][] => {
      const parentNameDot = parentName !== "" ? (parentName + ".") : parentName;
      const element = propInfo.elements[elementIndex];
      const isTerminate = (propInfo.elements.length - 1) === elementIndex;
      if (isTerminate) {
        // 終端の場合
        if (element === "*") {
          const indexesArray: number[][] = [];
          const len = getValuesLength(parentName, loopIndexes);
          for(let i = 0; i < len; i++) {
            indexesArray.push(loopIndexes.concat(i));
          }
          return indexesArray;
        } else {
          return [ loopIndexes ];
        }
      } else {
        // 終端でない場合
        const currentName = parentNameDot + element;
        if (element === "*") {
          if (loopIndexes.length < indexes.length) {
            return traverse(currentName, elementIndex + 1, indexes.slice(0, loopIndexes.length + 1));
          } else {
            const indexesArray = [];
            const len = getValuesLength(parentName, loopIndexes);
            for(let i = 0; i < len; i++) {
                indexesArray.push(...traverse(currentName, elementIndex + 1, loopIndexes.concat(i)));
            }
            return indexesArray;
          }
        } else {
          return traverse(currentName, elementIndex + 1, loopIndexes);
        }
      }
    };
    return traverse("", 0, []);
  }
}

export function expandStateProperties(
  states: IStates, 
  updatedStateProperties: IPropertyAccess[]
): IPropertyAccess[] {
  // expand state properties
  const expandedStateProperties = updatedStateProperties.slice(0);
  const updatedStatePropertiesSet = new Set(updatedStateProperties.map(prop => prop.propInfo.pattern + "\t" + prop.indexes.toString()));
  for(let i = 0; i < updatedStateProperties.length; i++) {
    expandedStateProperties.push.apply(expandedStateProperties, expandStateProperty(
      states.current, updatedStateProperties[i], updatedStatePropertiesSet
    ));
  }
  return expandedStateProperties;
}
