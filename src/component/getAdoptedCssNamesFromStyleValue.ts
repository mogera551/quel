
const ADOPTED_VAR_NAME = '--adopted-css';

/**
 * trim
 */
const trim = (name: string): string => name.trim();

/**
 * exclude empty name
 */
const excludeEmptyName = (name: string): boolean => name.length > 0;

/**
 * get name list from component style variable '--adopted-css'
 */
/**
 * コンポーネントのスタイル属性の '--adopted-css' から名前リストを取得します
 * @param component コンポーネント
 * @returns {string[]} 名前リスト
 */
export function getAdoptedCssNamesFromStyleValue(component:Element): string[] {
  // get adopted css names from component style variable '--adopted-css'
  return getComputedStyle(component)?.getPropertyValue(ADOPTED_VAR_NAME)?.split(" ").map(trim).filter(excludeEmptyName) ?? [];
}
