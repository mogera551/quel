import { IDependentProps, Dependencies } from "./types";
import { getPatternInfo } from "../propertyInfo/getPatternInfo";

/**
 * $dependentPropsを表現
 */
class DependentProps implements IDependentProps {
  defaultProps: Set<string> = new Set;
  propsByRefProp: {[ key: string ]: Set<string>} = {};

  constructor(props: Dependencies) {
    this.#setDependentProps(props);
  }

  setDefaultProp(pattern: string): void {
    if (this.defaultProps.has(pattern)) return;
    const patternInfo = getPatternInfo(pattern);
    for(let i = patternInfo.patternPaths.length - 1; i >= 1; i--) {
      const parentPattern = patternInfo.patternPaths[i - 1];
      const pattern = patternInfo.patternPaths[i];
      this.propsByRefProp[parentPattern]?.add(pattern) ?? 
        (this.propsByRefProp[parentPattern] = new Set([pattern]));
      this.defaultProps.add(pattern);
    }
  }

  #setDependentProps(props:Dependencies):void {
    for(const [prop, refProps] of Object.entries(props)) {
      for(const refProp of refProps) {
        this.propsByRefProp[refProp]?.add(prop) ?? (this.propsByRefProp[refProp] = new Set([prop]));
      }
    }
  }
}

export function createDependentProps(props: Dependencies): IDependentProps {
  return new DependentProps(props);
}
