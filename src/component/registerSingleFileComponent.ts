import { registerComponentModule } from "./registerComponentModule";
import { loadSingleFileComponent } from "./loadSingleFileComponent";

export async function registerSingleFileComponent(customElementName:string, pathToSingleFileComponent:string) {
  const componentModule = await loadSingleFileComponent(pathToSingleFileComponent);
  registerComponentModule(customElementName, componentModule);
}
