import { CaseType } from "./types";

const DEFAULT_NAME_TYPE:CaseType = "lowerCamel";
const DEAFULT_PATH:string = "./";

export class Config {
  /**
   * ファイル名に使用するデフォルトの名前の形式（kebab,snake,upperCamel,lowerCamel,dotted）
   */
  defaultNameType:CaseType = DEFAULT_NAME_TYPE;
  /**
   * プレフィックスに一致しない場合のパス名、undefinedの場合、ロードせずエラーとする
   */
  defaultPath:string = DEAFULT_PATH;
  /**
   * ロードする名前の一覧
   */
  loadNames:string[] = [];
  /**
   * プレフィックスのマップ、キー：名前、値：パス
   */
  prefixMap:{[key:string]:string}|undefined;
}
