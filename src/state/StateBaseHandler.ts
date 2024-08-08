
import { AccessorPropertiesSymbol, DependenciesSymbol } from "./Const";
import { Handler } from "../dot-notation/Handler";
import { DependentProps } from "./DependentProps";
import { IState } from "./types";

export class StateBaseHandler extends Handler  {
  #accessorProperties:Set<string>;
  get accessorProperties(): Set<string> {
    return this.#accessorProperties;
  }

  #dependencies:DependentProps;
  get dependencies(): DependentProps {
    return this.#dependencies;
  }

  // todo: HTMLElementをComponentに変更
  #component:HTMLElement; 
  get component(): HTMLElement {
    return this.#component;
  }

  // todo: HTMLElementをComponentに変更
  constructor(component:HTMLElement, accessorProperties: Set<string>, dependencies: DependentProps) {
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
  }

  addNotify(target:Object, {propertyName, indexes}:{propertyName:string, indexes:number[]}, receiver:IState) {
    // todo: ここに処理を追加
  }

  clearCache() {
  }

  directlyCallback(loopContext:any, callback:()=>Promise<void>) {
  }
}