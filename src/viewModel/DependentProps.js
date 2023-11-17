import "../types.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";

/**
 * $dependentPropsを表現
 */
export class DependentProps {
  /** @type {Map<string,Set<string>>} */
  #setOfPropsByRefProp = new Map;
  /** @type {Map<string,Set<string>>} */
  get setOfPropsByRefProp() {
    return this.#setOfPropsByRefProp;
  }

  /**
   * 
   * @param {{prop:string,refProps:string[]}} props 
   * @returns {void}
   */
  setDependentProps(props) {
    for(const [prop, refProps] of Object.entries(props)) {
      for(const refProp of refProps) {
        this.#setOfPropsByRefProp.get(refProp)?.add(prop) ?? this.#setOfPropsByRefProp.set(refProp, new Set([prop]));
      }
    }
  }

}
