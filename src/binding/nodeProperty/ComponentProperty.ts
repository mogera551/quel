import { Symbols } from "../../Symbols.js";
import { utils } from "../../utils";
import { ElementBase } from "./ElementBase";
import { IBinding, IPropertyAccess, IStateProperty } from "../../@types/binding";
import { IFilterInfo } from "../../@types/filter.js";
import { ILoopContext } from "../../@types/loopContext.js";
import { IComponent } from "../../@types/component.js";
import { IsComponentSymbol } from "../../component/Const.js";
import { NotifyForDependentPropsApiSymbol, UpdatedCallbackSymbol } from "../../state/Const.js";
import { PropertyAccess } from "../PropertyAccess.js";

export class BindingPropertyAccess {
  #stateProperty:IStateProperty;

  get name():string {
    return this.#stateProperty.name;
  }

  get indexes():number[] {
    return this.#stateProperty.indexes;
  }

  get loopContext():ILoopContext {
    return this.#stateProperty.binding.loopContext;
  }

  constructor(stateProperty:IStateProperty) {
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

  get thisComponent():IComponent {
    return this.node as IComponent;
  }

  constructor(binding:IBinding, node:Node, name:string, filters:IFilterInfo[]) {
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
      this.thisComponent.baseState[UpdatedCallbackSymbol]([ new PropertyAccess(`${this.propertyName}`, [])]); 
      this.thisComponent.baseState[NotifyForDependentPropsApiSymbol](this.propertyName, []);
    } catch(e) {
      console.log(e);
    }
  }
  /**
   * 初期化処理
   * コンポーネントプロパティのバインドを行う
   */
  initialize() {
    this.thisComponent.props[Symbols.bindProperty](this.propName, new BindingPropertyAccess(this.binding.stateProperty));
  }

  /**
   * 更新後処理
   */
  postUpdate(propertyAccessBystatePropertyKey:Map<string,IPropertyAccess>):void {
    const statePropertyName = this.binding.stateProperty.name;
    for(const [key, propertyAccess] of propertyAccessBystatePropertyKey.entries()) {
      if (propertyAccess.patternName === statePropertyName || 
        propertyAccess.patternNameInfo.setOfParentPaths.has(statePropertyName)) {
        const remain = propertyAccess.patternName.slice(statePropertyName.length);
//        console.log(`componentProperty:postUpdate(${propName}${remain})`);
        this.thisComponent.baseState[UpdatedCallbackSymbol]([new PropertyAccess(`${this.propertyName}${remain}`, propertyAccess.indexes)]);
        this.thisComponent.baseState[NotifyForDependentPropsApiSymbol](`${this.propertyName}${remain}`, propertyAccess.indexes);
      }
    }
  }

  isSameValue(value:any):boolean {
    return false;
  }

}