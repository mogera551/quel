import { getPatternNameInfo } from "../dot-notation/PatternName";
import { getPropertyNameInfo } from "../dot-notation/PropertyName";
import { IDependentProps, Dependencies } from "../@types/state";

/**
 * $dependentPropsを表現
 */

export class DependentProps implements IDependentProps {
  #defaultProps:Set<string> = new Set;
  #propsByRefProp:Map<string,Set<string>> = new Map;

  constructor(props:Dependencies) {
    this.setDependentProps(props);
  }

  get propsByRefProp():Map<string,Set<string>> {
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
