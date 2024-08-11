
import { AccessorPropertiesSymbol, DependenciesSymbol, GetDependentPropsApiSymbol } from "./Const";
import { Handler } from "../dot-notation/Handler";
import { DependentProps } from "./DependentProps";
import { IState } from "../@types/state";
import { IComponent } from "../@types/component";
import { ILoopContext } from "../@types/loopContext";
import { IPropertyAccess } from "../binding/Binding";
import { PropertyAccess } from "../binding/PropertyAccess";
import { getPatternNameInfo } from "../dot-notation/PatternName";
import { GetDirectSymbol } from "../dot-notation/Const";

export class StateBaseHandler extends Handler  {
  #accessorProperties:Set<string>;
  get accessorProperties(): Set<string> {
    return this.#accessorProperties;
  }

  #dependencies:DependentProps;
  get dependencies(): DependentProps {
    return this.#dependencies;
  }

  #component:IComponent; 
  get component(): IComponent {
    return this.#component;
  }

  constructor(component:IComponent, accessorProperties: Set<string>, dependencies: DependentProps) {
    super();
    this.#component = component;
    this.#accessorProperties = accessorProperties;
    this.#dependencies = dependencies;
  }

  get(target: Object, prop: PropertyKey, receiver: IState): any {
    if (prop === AccessorPropertiesSymbol) {
      return this.#accessorProperties;
    } else if (prop === DependenciesSymbol) {
      return this.#dependencies;
    }
    return Reflect.get(target, prop, receiver);
  }

  ownKeys(target: Object): (string|symbol)[] {
    return Reflect.ownKeys(target).concat([
      AccessorPropertiesSymbol, 
      DependenciesSymbol
    ]);
  }

  has(target: Object, prop: PropertyKey): boolean {
    return Reflect.has(target, prop) || prop === AccessorPropertiesSymbol || prop === DependenciesSymbol;
  }

  addProcess(process:()=>void, target:Object, indexes:number[]):void {
    // todo: ここに処理を追加
    this.component.updator.addProcess(target, thisArg, argumentArray);
  }

  addNotify(target:Object, {propertyName, indexes}:{propertyName:string, indexes:number[]}, receiver:IState) {
    // todo: ここに処理を追加
    this.#component.updator?.addUpdatedStateProperty(Object.assign({}, propertyAccess));
  }

  clearCache() {
  }

  directlyCallback(loopContext:ILoopContext, callback:()=>Promise<void>) {
  }

  static makeNotifyForDependentProps(state:IState, propertyAccess:IPropertyAccess, setOfSavePropertyAccessKeys:Set<string> = new Set([])):IPropertyAccess[] {
    const { patternNameInfo, indexes } = propertyAccess;
    const propertyAccessKey = patternNameInfo.name + "\t" + indexes.toString();
    if (setOfSavePropertyAccessKeys.has(propertyAccessKey)) return [];
    setOfSavePropertyAccessKeys.add(propertyAccessKey);
    const dependentProps = state[GetDependentPropsApiSymbol]();
    const setOfProps = dependentProps.propsByRefProp.get(patternNameInfo.name);
    const propertyAccesses = [];
    if (typeof setOfProps === "undefined") return [];
    for(const prop of setOfProps) {
      const curPropertyNameInfo = getPatternNameInfo(prop);
      if (indexes.length < curPropertyNameInfo.level) {
        //if (curPropName.setOfParentPaths.has(propName.name)) continue;
        const listOfIndexes = StateBaseHandler.expandIndexes(state, new PropertyAccess(curPropertyNameInfo.name, indexes));
        propertyAccesses.push(...listOfIndexes.map(indexes => new PropertyAccess(curPropertyNameInfo.name, indexes)));
      } else {
        const notifyIndexes = indexes.slice(0, curPropertyNameInfo.level);
        propertyAccesses.push(new PropertyAccess(curPropertyNameInfo.name, notifyIndexes));
      }
      propertyAccesses.push(...this.makeNotifyForDependentProps(state, new PropertyAccess(curPropertyNameInfo.name, indexes), setOfSavePropertyAccessKeys));
    }
    return propertyAccesses;
  }

  static expandIndexes(state:IState, propertyAccess:IPropertyAccess):number[][] {
    const { patternNameInfo, patternName, indexes } = propertyAccess;
    if (patternNameInfo.level === indexes.length) {
      return [ indexes ];
    } else if (patternNameInfo.level < indexes.length) {
      return [ indexes.slice(0, patternNameInfo.level) ];
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
        const element = patternNameInfo.pathNames[elementIndex];
        const isTerminate = (patternNameInfo.pathNames.length - 1) === elementIndex;
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