import { utils } from "../utils";
import { IComponent } from "./types";

const ADOPTED_VAR_NAME = '--adopted-css';

const styleSheetByName:Map<string,CSSStyleSheet> = new Map;

/**
 * copy style rules to adopted style sheet
 */
function copyStyleRules(fromStyleSheet:CSSStyleSheet, toStyleSheet:CSSStyleSheet) {
  Array.from(fromStyleSheet.cssRules).map(rule => {
    if (rule.constructor.name === "CSSImportRule") {
      const importRule = (rule as CSSImportRule);
      if (importRule.styleSheet) {
        copyStyleRules(importRule.styleSheet, toStyleSheet);
      } else {
        console.log(`import rule not found: ${importRule.href}`);
      }
    } else {
      toStyleSheet.insertRule(rule.cssText, toStyleSheet.cssRules.length);
    }
  });
}

/**
 * create adopted style sheet by name, and copy style rules from existing style sheet
 */
function createStyleSheet(name:string):CSSStyleSheet|undefined {
  const styleSheet = new CSSStyleSheet();
  const matchTitle = (sheet:CSSStyleSheet) => sheet.title === name;
  const fromStyleSheets = Array.from(document.styleSheets).filter(matchTitle);
  if (fromStyleSheets.length === 0) {
    console.log(`style sheet not found: ${name}`);
    return;
  }
  fromStyleSheets.forEach(fromStyleSheet => copyStyleRules(fromStyleSheet, styleSheet));
  styleSheetByName.set(name, styleSheet);
  return styleSheet;
}

const trim = (name:string):string => name.trim();

/**
 * exclude empty name
 */
const excludeEmptyName = (name:string):boolean => name.length > 0;

/**
 * 
 * @param {string} name 
 * @returns {CSSStyleSheet}
 */
const getStyleSheet = (name:string):CSSStyleSheet|undefined => styleSheetByName.get(name) ?? createStyleSheet(name);

/**
 * exclude empty style sheet
 */
const excludeEmptySheet = (styleSheet:CSSStyleSheet|undefined) => typeof styleSheet !== "undefined";

/**
 * get adopted css list by names
 */
export function getStyleSheetList(names:string[]):CSSStyleSheet[] {
    // find adopted style sheet from map, if not found, create adopted style sheet
    return names.map(getStyleSheet).filter(excludeEmptySheet);
}

/**
 * get name list from component style variable '--adopted-css'
 */
export function getNamesFromComponent(component:IComponent & Element):string[] {
  // get adopted css names from component style variable '--adopted-css'
  return getComputedStyle(component)?.getPropertyValue(ADOPTED_VAR_NAME)?.split(" ").map(trim).filter(excludeEmptyName) ?? [];
}
