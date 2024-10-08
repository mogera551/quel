import { utils } from "../utils";
import { generateComponentClass } from "./generateComponentClass";
import { ComponentModule } from "./types";

/**
 * register component class with tag name, call customElements.define
 * generate component class from componentModule
 */
/**
 * コンポーネントモジュールをカスタムエレメント名を指定してカスタムコンポーネントとして登録します
 * @param customElementName カスタムエレメント名
 * @param componentModule コンポーネントモジュール
 * @returns {void}
 */
export function registerComponentModule(
  customElementName: string, 
  componentModule: ComponentModule
): void {
  const customElementKebabName = utils.toKebabCase(customElementName);
  const componentClass = generateComponentClass(componentModule);
  const extendsTag = componentModule.moduleConfig?.extends ?? componentModule.options?.extends;
  if (typeof extendsTag === "undefined") {
    customElements.define(customElementKebabName, componentClass);
  } else {
    customElements.define(customElementKebabName, componentClass, { extends:extendsTag });
  }
}
