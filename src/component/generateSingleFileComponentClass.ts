import { generateComponentClass } from "./generateComponentClass";
import { loadSingleFileComponent } from "./loadSingleFileComponent";

/**
 * 単一ファイルコンポーネントからコンポーネントクラスを生成します
 * @param pathToSingleFileComponent 単一ファイルコンポーネントのパス
 * @returns {Promise<typeof HTMLElement>} コンポーネントクラス
 */
export async function generateSingleFileComponentClass(pathToSingleFileComponent:string): Promise<typeof HTMLElement> {
  const componentModule = await loadSingleFileComponent(pathToSingleFileComponent);
  return generateComponentClass(componentModule);
}
