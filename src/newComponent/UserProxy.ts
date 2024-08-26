import { IComponent } from "../@types/component";
import { utils } from "../utils";

function existsProperty(baseClass:Function, prop:PropertyKey):boolean {
  if (typeof baseClass.prototype[prop] !== "undefined") return true;
  if (baseClass.prototype === Object.prototype) return false;
  return existsProperty(Object.getPrototypeOf(baseClass), prop);
}

const permittedProps = new Set([
  "addProcess", "viewRootElement ", "queryRoot",
  "asyncShowModal", "asyncShow",
  "asyncShowPopover", "cancelPopover"
]);

class UserProxyHandler {
  get(target: IComponent, prop: string) {
    if (permittedProps.has(prop)) {
      return Reflect.get(target, prop);
    } else {
      if (existsProperty(target.baseClass, prop)) {
        return Reflect.get(target, prop);
      } else {
        utils.raise(`property ${prop} is not found in ${target.baseClass.name}`);
      }
    }
  }
}

export function createUserComponent(component: IComponent): IComponent {
  return new Proxy(component, new UserProxyHandler);
}
