import { toKebabCase } from "./KebabCase";
import { CaseType, CaseTypeNames } from "../@types/loader";

export function getNameByCaseType(name:string):CaseTypeNames {
  const kebabName = toKebabCase(name) as string;
  const snakeName = kebabName.replaceAll("-", "_");
  const dottedName = kebabName.replaceAll("-", ".");
  const upperCamelName = kebabName.split("-").map((text, index) => {
    if (typeof text[0] !== "undefined") {
      text = text[0].toUpperCase() + text.slice(1);
    }
    return text;
  }).join("");
  const lowerCamelName = (upperCamelName.length > 0) ? upperCamelName[0].toLowerCase() + upperCamelName.slice(1) : upperCamelName;
  return {
    kebab: kebabName,
    snake: snakeName,
    upperCamel: upperCamelName,
    lowerCamel: lowerCamelName,
    dotted: dottedName,
  };
}
