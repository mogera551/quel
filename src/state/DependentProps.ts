import { IDependentProps, Dependencies } from "../@types/types";
import { getPropInfo } from "../dotNotation/PropInfo";

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
    const propInfo = getPropInfo(prop);
    for(let i = propInfo.patternPaths.length - 1; i >= 1; i--) {
      const parentPattern = propInfo.patternPaths[i - 1];
      const pattern = propInfo.patternPaths[i];
      this.#propsByRefProp.get(parentPattern)?.add(pattern) ?? 
        this.#propsByRefProp.set(parentPattern, new Set([pattern]));
      this.#defaultProps.add(pattern);
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
