import { registerSingleFileComponent } from "./registerSingleFileComponent";

/**
 * 単一ファイルコンポーネントをカスタムエレメント名を指定して登録します
 * @param pathToSingleFileComponentByCustomElementName 単一ファイルコンポーネントのパスのオブジェクト、カスタムエレメント名とパスのペア
 * @returns {Promise<void>}
 */
export async function registerSingleFileComponents(pathToSingleFileComponentByCustomElementName:{[key:string]:string}): Promise<void> {
  for(const [customElementName, pathToSingleFileComponent] of Object.entries(pathToSingleFileComponentByCustomElementName ?? {})) {
    await registerSingleFileComponent(customElementName, pathToSingleFileComponent);
  }
}
