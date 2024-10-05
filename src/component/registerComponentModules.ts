import { registerComponentModule } from "./registerComponentModule";
import { ComponentModule } from "./types";

/**
 * コンポーネントモジュールをカスタムエレメント名を指定してカスタムコンポーネントとして登録します
 * @param componentModules コンポーネントモジュールのオブジェクト、名前とモジュールのペア
 * @returns {void}
 */
export function registerComponentModules(componentModules:{[key:string]:ComponentModule}): void {
  for(const [customElementName, userComponentModule] of Object.entries(componentModules)) {
    registerComponentModule(customElementName, userComponentModule);
  }
}
