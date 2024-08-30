import { utils } from "../utils";
import { INewComponent, INewUserComponent } from "../@types/component";

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
  get(target: INewComponent, prop: string) {
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

export function createUserComponent(component: INewComponent): INewUserComponent {
  return new Proxy(component, new UserProxyHandler);
}
