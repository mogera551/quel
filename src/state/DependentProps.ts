//import "../types.js";
//import { PropertyName } from "../../modules/dot-notation/dot-notation.js";

import { getPatternNameInfo } from "../dot-notation/PatternName";
import { getPropertyNameInfo } from "../dot-notation/PropertyName";

/**
 * $dependentPropsを表現
 */

type DependentPropsStore = Map<string,Set<string>>;
export class DependentProps {
  #defaultProps:Set<string> = new Set;
  #propsByRefProp:DependentPropsStore = new Map;

  constructor(props:Dependencies) {
    this.setDependentProps(props);
  }

  get propsByRefProp():DependentPropsStore {
    return this.#propsByRefProp;
  }

  hasDefaultProp(prop:string):boolean {
    return this.#defaultProps.has(prop);
  }

  addDefaultProp(prop:string):void {
    const propertyNameInfo = getPropertyNameInfo(prop);
    let patternNameInfo = getPatternNameInfo(propertyNameInfo.patternName);
    while(patternNameInfo.parentPath !== "") {
      const parentPatternNameInfo = getPatternNameInfo(patternNameInfo.parentPath);
      if (!this.#defaultProps.has(patternNameInfo.name)) {
        this.#propsByRefProp.get(parentPatternNameInfo.name)?.add(patternNameInfo.name) ?? 
          this.#propsByRefProp.set(parentPatternNameInfo.name, new Set([patternNameInfo.name]));
        this.#defaultProps.add(patternNameInfo.name);
      }
      patternNameInfo = parentPatternNameInfo;
    }
  }

  setDependentProps(props:Dependencies):void {
    for(const [prop, refProps] of Object.entries(props)) {
      for(const refProp of refProps) {
        this.#propsByRefProp.get(refProp)?.add(prop) ?? this.#propsByRefProp.set(refProp, new Set([prop]));
      }
    }
  }

}
