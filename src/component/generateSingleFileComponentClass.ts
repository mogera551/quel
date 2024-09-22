import { generateComponentClass } from "./generateComponentClass";
import { loadSingleFileComponent } from "./loadSingleFileComponent";

export async function generateSingleFileComponentClass(pathToSingleFileComponent:string) {
  const componentModule = await loadSingleFileComponent(pathToSingleFileComponent);
  return generateComponentClass(componentModule);
}
