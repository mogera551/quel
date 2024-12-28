import { utils } from "../utils";
import { IComponent, IUserComponent } from "./types";

function existsProperty(baseClass:Function, prop:PropertyKey):boolean {
  if (typeof baseClass.prototype === "undefined") return false;
  if (baseClass.prototype === Object.prototype) return false;
  if (typeof baseClass.prototype[prop] !== "undefined") return true;
  return existsProperty(Object.getPrototypeOf(baseClass), prop);
}

const permittedProps = new Set([
  "element", "addProcess", "quelViewRootElement ", "quelQueryRoot",
  "asyncShowModal", "asyncShow",
  "asyncShowPopover", "cancelPopover"
]);

class UserProxyHandler {
  get(target: IComponent, prop: string) {
    if (permittedProps.has(prop)) {
      return Reflect.get(target, prop);
    } else {
      if (existsProperty(target.quelBaseClass, prop)) {
        return Reflect.get(target, prop);
      } else {
        utils.raise(`property ${prop} is not found in ${target.quelBaseClass.name}`);
      }
    }
  }
}

/**
 * State内で使用するコンポーネントを生成する
 * アクセス制限をかけるためのProxyを生成する
 * @param component コンポーネントを元にProxyを生成する
 * @returns {IUserComponent} ユーザーコンポーネント
 */
export function createUserComponent(component: IComponent): IUserComponent {
  return new Proxy(component, new UserProxyHandler);
}
