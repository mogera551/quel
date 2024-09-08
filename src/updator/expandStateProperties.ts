import { GetDependentPropsApiSymbol } from "../state/symbols";
import { IPropertyAccess } from "../binding/types";
import { getPatternInfo } from "../dotNotation/PropInfo";
import { IStateProxy, IStates } from "../state/types";
import { PropertyAccess } from "../binding/PropertyAccess";
import { GetDirectSymbol } from "../dotNotation/symbols";

function expandStateProperty(state:IStateProxy, propertyAccess:IPropertyAccess, expandedPropertyAccessKeys:Set<string> = new Set([])):IPropertyAccess[] {
  const { propInfo, indexes } = propertyAccess;
  const propertyAccessKey = propInfo.pattern + "\t" + indexes.toString();
  if (expandedPropertyAccessKeys.has(propertyAccessKey)) return [];
  expandedPropertyAccessKeys.add(propertyAccessKey);
  
  const dependentProps = state[GetDependentPropsApiSymbol]();
  const props = dependentProps.propsByRefProp[propInfo.pattern];
  if (typeof props === "undefined") return [];
  const propertyAccesses = [];
  for(const prop of props) {
    const curPropertyNameInfo = getPatternInfo(prop);
    if (indexes.length < curPropertyNameInfo.wildcardPaths.length) {
      //if (curPropName.setOfParentPaths.has(propName.name)) continue;
      const listOfIndexes = expandIndexes(state, new PropertyAccess(prop, indexes));
      propertyAccesses.push(...listOfIndexes.map(indexes => new PropertyAccess(prop, indexes)));
    } else {
      const notifyIndexes = indexes.slice(0, curPropertyNameInfo.wildcardPaths.length);
      propertyAccesses.push(new PropertyAccess(prop, notifyIndexes));
    }
    propertyAccesses.push(...expandStateProperty(state, new PropertyAccess(prop, indexes), expandedPropertyAccessKeys));
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
    const traverse = (parentName:string, elementIndex:number, loopIndexes:number[]):number[][] => {
      const parentNameDot = parentName !== "" ? (parentName + ".") : parentName;
      const element = propInfo.elements[elementIndex];
      const isTerminate = (propInfo.elements.length - 1) === elementIndex;
      if (isTerminate) {
        if (element === "*") {
          const indexesArray = [];
          const len = getValuesFn(parentName, loopIndexes).length;
          for(let i = 0; i < len; i++) {
            indexesArray.push([...loopIndexes, i]);
          }
          return indexesArray;
        } else {
          return [ loopIndexes ];
        }
      } else {
        const currentName = parentNameDot + element;
        if (element === "*") {
          if (loopIndexes.length < indexes.length) {
            return traverse(currentName, elementIndex + 1, indexes.slice(0, loopIndexes.length + 1));
          } else {
            const indexesArray = [];
            const len = getValuesFn(parentName, loopIndexes).length;
            for(let i = 0; i < len; i++) {
                indexesArray.push(...traverse(currentName, elementIndex + 1, [...loopIndexes, i]));
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

export function expandStateProperties(states:IStates, updatedStateProperties:IPropertyAccess[]):IPropertyAccess[] {
  // expand state properties
  const expandedStateProperties = updatedStateProperties.slice(0);
  for(let i = 0; i < updatedStateProperties.length; i++) {
    expandedStateProperties.push.apply(expandStateProperty(
      states.current, updatedStateProperties[i]
    ));
  }
  return expandedStateProperties;
}
