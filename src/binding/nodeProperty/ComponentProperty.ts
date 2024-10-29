import { utils } from "../../utils";
import { IFilterText } from "../../filter/types";
import { IsComponentSymbol } from "../../component/symbols";
import { NotifyForDependentPropsApiSymbol, UpdatedCallbackSymbol } from "../../state/symbols";
import { ElementBase } from "./ElementBase";
import { IBinding } from "../types";
import { IComponent } from "../../component/types";
import { IStatePropertyAccessor } from "../../state/types";
import { getPatternInfo } from "../../propertyInfo/getPatternInfo";
import { BindPropertySymbol } from "../../props/symbols";

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

  getValue():any {
    return super.getValue();
  }
  setValue(value:any) {
    try {
      this.thisComponent.states.current[NotifyForDependentPropsApiSymbol](this.propertyName, undefined);
    } catch(e) {
      console.log(e);
    }
  }
  /**
   * 初期化処理
   * コンポーネントプロパティのバインドを行う
   */
  initialize() {
    this.thisComponent.props[BindPropertySymbol](
      this.binding.stateProperty.name, 
      this.propertyName, 
      () => this.binding.parentContentBindings.currentLoopContext);
  }

  /**
   * 更新後処理
   */
  postUpdate(propertyAccessBystatePropertyKey:Map<string,IStatePropertyAccessor>):void {
    const statePropertyName = this.binding.stateProperty.name;
    for(const [key, propertyAccessor] of propertyAccessBystatePropertyKey.entries()) {
      const patternInfo = getPatternInfo(propertyAccessor.pattern);
      if (propertyAccessor.pattern === statePropertyName || 
        patternInfo.patternPaths.includes(statePropertyName)) {
        const remain = propertyAccessor.pattern.slice(statePropertyName.length);
        this.thisComponent.states.current[UpdatedCallbackSymbol]([{name:`${this.propertyName}${remain}`, indexes:propertyAccessor.loopIndexes?.values}]);
        this.thisComponent.states.current[NotifyForDependentPropsApiSymbol](`${this.propertyName}${remain}`, propertyAccessor.loopIndexes);
      }
    }
  }

  equals(value:any):boolean {
    return false;
  }

}