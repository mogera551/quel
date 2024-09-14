import { utils } from "../../utils";
import { IFilterText } from "../../filter/types";
import { BindPropertySymbol, IsComponentSymbol } from "../../component/symbols";
import { NotifyForDependentPropsApiSymbol, UpdatedCallbackSymbol } from "../../state/symbols";
import { ElementBase } from "./ElementBase";
import { PropertyAccess } from "../PropertyAccess";
import { IBinding, IBindingPropertyAccess, IPropertyAccess, IStateProperty } from "../types";
import { ILoopContext } from "../../loopContext/types";
import { IComponent } from "../../component/types";

export class BindingPropertyAccess implements IBindingPropertyAccess{
  #stateProperty:IStateProperty;

  get name():string {
    return this.#stateProperty.name;
  }

  get indexes():number[] {
    return this.#stateProperty.indexes;
  }

  get loopContext():ILoopContext | undefined {
    return this.#stateProperty.binding.parentContentBindings.currentLoopContext;
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

  constructor(binding:IBinding, node:Node, name:string, filters:IFilterText[]) {
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
  postUpdate(propertyAccessBystatePropertyKey:Map<string,IPropertyAccess>):void {
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