import { registerComponentModule } from "./registerComponentModule";
import { loadSingleFileComponent } from "./loadSingleFileComponent";

/**
 * 単一ファイルコンポーネントをカスタムエレメント名を指定して登録します
 * @param customElementName カスタムエレメント名
 * @param pathToSingleFileComponent 単一ファイルコンポーネントのパス
 * @returns {Promise<void>}
 */
export async function registerSingleFileComponent(
  customElementName:string, 
  pathToSingleFileComponent:string
): Promise<void> {
  const componentModule = await loadSingleFileComponent(pathToSingleFileComponent);
  registerComponentModule(customElementName, componentModule);
}
