export { generateComponentClass } from "./component/Component.js";
export { Main as default } from "./main.js";
export { loader } from "./loader/QuelLoader.js";

import { Main } from "./main.js";
export function registComponentModules(components) {
  Main.componentModules(components);
}

export function registConfig(config) {
  Main.config(config);
}
