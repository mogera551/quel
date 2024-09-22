import { registerComponentModule } from "./registerComponentModule";
import { ComponentModule } from "./types";

export function registerComponentModules(componentModules:{[key:string]:ComponentModule}): void {
  for(const [customElementName, userComponentModule] of Object.entries(componentModules)) {
    registerComponentModule(customElementName, userComponentModule);
  }
}
