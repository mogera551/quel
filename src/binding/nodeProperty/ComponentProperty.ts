import { utils } from "../../utils";
import { IFilterInfo } from "../../@types/filter.js";
import { BindPropertySymbol, IsComponentSymbol } from "../../@symbols/component.js";
import { NotifyForDependentPropsApiSymbol, UpdatedCallbackSymbol } from "../../@symbols/state";
import { ElementBase } from "./ElementBase";
import { PropertyAccess } from "../PropertyAccess";
import { INewBinding, INewBindingPropertyAccess, INewPropertyAccess, INewStateProperty } from "../../@types/binding";
import { INewLoopContext } from "../../loopContext/types";
import { INewComponent } from "../../@types/types";

export class BindingPropertyAccess implements INewBindingPropertyAccess{
  #stateProperty:INewStateProperty;

  get name():string {
    return this.#stateProperty.name;
  }

  get indexes():number[] {
    return this.#stateProperty.indexes;
  }

  get loopContext():INewLoopContext | undefined {
    return this.#stateProperty.binding.parentContentBindings.currentLoopContext;
  }

  constructor(stateProperty:INewStateProperty) {
    this.#stateProperty = stateProperty;
  }
}

export class ComponentProperty extends ElementBase {
  get propertyName():string {
    return this.nameElements[1];
  }

  get applicable():boolean {
    return true;
  }

  get thisComponent():INewComponent {
    return this.node as INewComponent;
  }

  constructor(binding:INewBinding, node:Node, name:string, filters:IFilterInfo[]) {
    if (Reflect.get(node, IsComponentSymbol) !== true) utils.raise("ComponentProperty: not Quel Component");
    // todo: バインドするプロパティ名のチェック
    // 「*」を含まないようにする
    super(binding, node, name, filters);
  }

  get value():any {
    return super.value;
  }
  set value(value) {
    try {
      // this.thisComponent.currentState[UpdatedCallbackSymbol]([ new PropertyAccess(`${this.propertyName}`, [])]); 
      this.thisComponent.states.current[NotifyForDependentPropsApiSymbol](this.propertyName, []);
    } catch(e) {
      console.log(e);
    }
  }
  /**
   * 初期化処理
   * コンポーネントプロパティのバインドを行う
   */
  initialize() {
    this.thisComponent.props[BindPropertySymbol](this.propertyName, new BindingPropertyAccess(this.binding.stateProperty));
  }

  /**
   * 更新後処理
   */
  postUpdate(propertyAccessBystatePropertyKey:Map<string,INewPropertyAccess>):void {
    const statePropertyName = this.binding.stateProperty.name;
    for(const [key, propertyAccess] of propertyAccessBystatePropertyKey.entries()) {
      if (propertyAccess.pattern === statePropertyName || 
        propertyAccess.propInfo.patternPaths.includes(statePropertyName)) {
        const remain = propertyAccess.pattern.slice(statePropertyName.length);
//        console.log(`componentProperty:postUpdate(${propName}${remain})`);
        this.thisComponent.states.current[UpdatedCallbackSymbol]([new PropertyAccess(`${this.propertyName}${remain}`, propertyAccess.indexes)]);
        this.thisComponent.states.current[NotifyForDependentPropsApiSymbol](`${this.propertyName}${remain}`, propertyAccess.indexes);
      }
    }
  }

  equals(value:any):boolean {
    return false;
  }

}