import { registerSingleFileComponent } from "./registerSingleFileComponent";

export async function registerSingleFileComponents(pathToSingleFileComponentByCustomElementName:{[key:string]:string}) {
  for(const [customElementName, pathToSingleFileComponent] of Object.entries(pathToSingleFileComponentByCustomElementName ?? {})) {
    registerSingleFileComponent(customElementName, pathToSingleFileComponent);
  }
}
