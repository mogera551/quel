import "../types.js";
import { Handler, PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { Symbols } from "../Symbols.js";

export class ViewModelHandlerBase extends Handler {
  /** @type {Component} */
  #component;
  get component() {
    return this.#component;
  }

  /** @type {import("./DependentProps.js").DependentProps} */
  #dependentProps;
  get dependentProps() {
    return this.#dependentProps;
  }

  /** @type {Set<string>} */
  #setOfAccessorProperties;
  get setOfAccessorProperties() {
    return this.#setOfAccessorProperties;
  }

  /**
   * 
   * @param {Component} component 
   * @param {Set<string>} setOfAccessorProperties
   * @param {import("./DependentProps.js").DependentProps} dependentProps
   */
  constructor(component, setOfAccessorProperties, dependentProps) {
    super();
    this.#component = component;
    this.#setOfAccessorProperties = setOfAccessorProperties;
    this.#dependentProps = dependentProps;
  }

  /**
   * 更新処理をキューイングする
   * @param {ViewModel} target 
   * @param {Proxy} thisArg 
   * @param {any[]} argumentArray 
   */
  addProcess(target, thisArg, argumentArray) {
    this.#component.updator?.addProcess(target, thisArg, argumentArray);
  }

  /**
   * 更新情報をキューイングする
   * @param {ViewModel} target 
   * @param {PropertyAccess} propertyAccess 
   * @param {Proxy} receiver 
   */
  addNotify(target, propertyAccess, receiver) {
    this.#component.updator?.addUpdatedStateProperty(Object.assign({}, propertyAccess));
  }

  /**
   * 
   * @param {ViewModel} viewModel 
   * @param {PropertyAccess} propertyAccess
   * @param {Set<PropertyAccess>} setOfSavePropertyAccessKeys 
   * @returns {PropertyAccess[]}
   */
  static makeNotifyForDependentProps(viewModel, propertyAccess, setOfSavePropertyAccessKeys = new Set([])) {
    const { propName, indexes } = propertyAccess;
    const propertyAccessKey = propName.name + "\t" + indexes.toString();
    if (setOfSavePropertyAccessKeys.has(propertyAccessKey)) return [];
    setOfSavePropertyAccessKeys.add(propertyAccessKey);
    const dependentProps = viewModel[Symbols.getDependentProps]();
    const setOfProps = dependentProps.setOfPropsByRefProp.get(propName.name);
    const propertyAccesses = [];
    if (typeof setOfProps === "undefined") return [];
    for(const prop of setOfProps) {
      const curPropName = PropertyName.create(prop);
      if (indexes.length < curPropName.level) {
        //if (curPropName.setOfParentPaths.has(propName.name)) continue;
        const listOfIndexes = ViewModelHandlerBase.expandIndexes(viewModel, { propName:curPropName, indexes });
        propertyAccesses.push(...listOfIndexes.map(indexes => ({ propName:curPropName, indexes })));
      } else {
        const notifyIndexes = indexes.slice(0, curPropName.level);
        propertyAccesses.push({ propName:curPropName, indexes:notifyIndexes });
      }
      propertyAccesses.push(...this.makeNotifyForDependentProps(viewModel, { propName:curPropName, indexes }, setOfSavePropertyAccessKeys));
    }
    return propertyAccesses;
  }

  /**
   * 
   * @param {ViewModel} viewModel 
   * @param {PropertyAccess} propertyAccess
   * @param {number[]} indexes 
   * @returns {number[][]}
   */
  static expandIndexes(viewModel, propertyAccess) {
    const { propName, indexes } = propertyAccess;
    if (propName.level === indexes.length) {
      return [ indexes ];
    } else if (propName.level < indexes.length) {
      return [ indexes.slice(0, propName.level) ];
    } else {
      const getValuesFn = viewModel[Symbols.directlyGet];
      /**
       * 
       * @param {string} parentName 
       * @param {number} elementIndex 
       * @param {number[]} loopIndexes 
       * @returns {number[][]}
       */
      const traverse = (parentName, elementIndex, loopIndexes) => {
        const parentNameDot = parentName !== "" ? (parentName + ".") : parentName;
        const element = propName.pathNames[elementIndex];
        const isTerminate = (propName.pathNames.length - 1) === elementIndex;
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
}