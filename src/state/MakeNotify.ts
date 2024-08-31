import { GetDependentPropsApiSymbol } from "./symbols";
import { IPropertyAccess } from "../binding/types";
import { getPatternInfo } from "../dotNotation/PropInfo";
import { IStateProxy } from "./types";
import { PropertyAccess } from "../binding/PropertyAccess";
import { GetDirectSymbol } from "../dotNotation/symbols";

export function makeNotifyForDependentProps(state:IStateProxy, propertyAccess:IPropertyAccess, setOfSavePropertyAccessKeys:Set<string> = new Set([])):IPropertyAccess[] {
  const { propInfo, indexes } = propertyAccess;
  const propertyAccessKey = propInfo.pattern + "\t" + indexes.toString();
  if (setOfSavePropertyAccessKeys.has(propertyAccessKey)) return [];
  setOfSavePropertyAccessKeys.add(propertyAccessKey);
  const dependentProps = state[GetDependentPropsApiSymbol]();
  const setOfProps = dependentProps.propsByRefProp[propInfo.pattern];
  const propertyAccesses = [];
  if (typeof setOfProps === "undefined") return [];
  for(const prop of setOfProps) {
    const curPropertyNameInfo = getPatternInfo(prop);
    if (indexes.length < curPropertyNameInfo.wildcardPaths.length) {
      //if (curPropName.setOfParentPaths.has(propName.name)) continue;
      const listOfIndexes = expandIndexes(state, new PropertyAccess(prop, indexes));
      propertyAccesses.push(...listOfIndexes.map(indexes => new PropertyAccess(prop, indexes)));
    } else {
      const notifyIndexes = indexes.slice(0, curPropertyNameInfo.wildcardPaths.length);
      propertyAccesses.push(new PropertyAccess(prop, notifyIndexes));
    }
    propertyAccesses.push(...makeNotifyForDependentProps(state, new PropertyAccess(prop, indexes), setOfSavePropertyAccessKeys));
  }
  return propertyAccesses;
}

function expandIndexes(state:IStateProxy, propertyAccess:IPropertyAccess):number[][] {
  const { propInfo, pattern, indexes } = propertyAccess;
  if (propInfo.wildcardCount === indexes.length) {
    return [ indexes ];
  } else if (propInfo.wildcardCount < indexes.length) {
    return [ indexes.slice(0, propInfo.wildcardCount) ];
  } else {
    const getValuesFn = state[GetDirectSymbol];
    /**
     * 
     * @param {string} parentName 
     * @param {number} elementIndex 
     * @param {number[]} loopIndexes 
     * @returns {number[][]}
     */
    const traverse = (parentName:string, elementIndex:number, loopIndexes:number[]):number[][] => {
      const parentNameDot = parentName !== "" ? (parentName + ".") : parentName;
      const element = propInfo.elements[elementIndex];
      const isTerminate = (propInfo.elements.length - 1) === elementIndex;
      if (isTerminate) {
        if (element === "*") {
          const indexes = [];
          const len = getValuesFn(parentName, loopIndexes).length;
          for(let i = 0; i < len; i++) {
            indexes.push(loopIndexes.concat(i));
          }
          return indexes;
        } else {
          return [ loopIndexes ];
        }
      } else {
        const currentName = parentNameDot + element;
        if (element === "*") {
          if (loopIndexes.length < indexes.length) {
            return traverse(currentName, elementIndex + 1, indexes.slice(0, loopIndexes.length + 1));
          } else {
            const indexes = [];
            const len = getValuesFn(parentName, loopIndexes).length;
            for(let i = 0; i < len; i++) {
              indexes.push(...traverse(currentName, elementIndex + 1, loopIndexes.concat(i)));
            }
            return indexes;
          }
        } else {
          return traverse(currentName, elementIndex + 1, loopIndexes);
        }
      }
    };
    const listOfIndexes = traverse("", 0, []);
    return listOfIndexes;
  }
}
