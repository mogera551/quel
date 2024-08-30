import { CaseType, CaseTypeNames }  from "../@types/types";
import { getNameByCaseType } from "./NameType";

const REPLACE_PREFIX = "prefix-name";
const REPLACE_SUB = "sub-name";

const replacePrefixNames = getNameByCaseType(REPLACE_PREFIX);
const replaceSubNames = getNameByCaseType(REPLACE_SUB);

export function getPathInfo(path:string, prefixName:string, subName:string, defaultNameType:CaseType):{filePath:string, exportName:string} {
  const [ filePath, exportName ] = path.split("#");
  let replaceFilePath = filePath;
  let replaceExportName = exportName;
  const prefixNames = getNameByCaseType(prefixName);
  const subNames = getNameByCaseType(subName);

  replaceFilePath = replaceFilePath.replaceAll(`{${replacePrefixNames["kebab"]}}`, prefixNames["kebab"]);
  replaceFilePath = replaceFilePath.replaceAll(`{${replacePrefixNames["snake"]}}`, prefixNames["snake"]);
  replaceFilePath = replaceFilePath.replaceAll(`{${replacePrefixNames["lowerCamel"]}}`, prefixNames["lowerCamel"]);
  replaceFilePath = replaceFilePath.replaceAll(`{${replacePrefixNames["upperCamel"]}}`, prefixNames["upperCamel"]);
  replaceFilePath = replaceFilePath.replaceAll(`{${replacePrefixNames["dotted"]}}`, prefixNames["dotted"]);

  replaceFilePath = replaceFilePath.replaceAll(`{${replaceSubNames["kebab"]}}`, subNames["kebab"]);
  replaceFilePath = replaceFilePath.replaceAll(`{${replaceSubNames["snake"]}}`, subNames["snake"]);
  replaceFilePath = replaceFilePath.replaceAll(`{${replaceSubNames["lowerCamel"]}}`, subNames["lowerCamel"]);
  replaceFilePath = replaceFilePath.replaceAll(`{${replaceSubNames["upperCamel"]}}`, subNames["upperCamel"]);
  replaceFilePath = replaceFilePath.replaceAll(`{${replaceSubNames["dotted"]}}`, subNames["dotted"]);

  if (filePath === replaceFilePath && replaceFilePath.slice(-3) !== ".js") {
    // 変換されなかった場合、パスにファイル名を付加する
    replaceFilePath = replaceFilePath + (path.slice(-1) !== "/" ? "/" : "") + subNames[defaultNameType] + ".js";
  }

  if (replaceExportName) {
    replaceExportName = replaceExportName.replaceAll(`{${replaceSubNames["kebab"]}}`, subNames["kebab"]);
    replaceExportName = replaceExportName.replaceAll(`{${replaceSubNames["snake"]}}`, subNames["snake"]);
    replaceExportName = replaceExportName.replaceAll(`{${replaceSubNames["lowerCamel"]}}`, subNames["lowerCamel"]);
    replaceExportName = replaceExportName.replaceAll(`{${replaceSubNames["upperCamel"]}}`, subNames["upperCamel"]);
    replaceExportName = replaceExportName.replaceAll(`{${replaceSubNames["dotted"]}}`, subNames["dotted"]);
  }
  return {
    filePath: replaceFilePath,
    exportName: replaceExportName
  };

}
