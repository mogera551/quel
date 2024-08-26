
import { utils } from "../utils";
import { ClearBufferSymbol, CreateBufferSymbol, FlushBufferSymbol, GetBufferSymbol, SetBufferSymbol } from "../@symbols/component";
import { Constructor, IComponent, IDialogComponent } from "../@types/component";

export function DialogComponent<TBase extends Constructor>(Base: TBase) {
  return class extends Base implements IDialogComponent {
    #dialogPromises:PromiseWithResolvers<any>|undefined;
    get dialogPromises():PromiseWithResolvers<any>|undefined {
      return this.#dialogPromises;
    }
    set dialogPromises(value:PromiseWithResolvers<any>|undefined) {
      this.#dialogPromises = value;
    }

    #returnValue:string = "";
    get returnValue():string {
      return this.#returnValue;
    }
    set returnValue(value:string) {
      this.#returnValue = value;
    }

    get useBufferedBind() {
      const component = this.#component;
      return component.hasAttribute("buffered-bind");
    }
  
    get #component():IComponent {
      return this as unknown as IComponent;
    }
    constructor(...args:any[]) {
      super();
      const component = this.#component;
      component.addEventListener("closed", () => {
        if (typeof component.dialogPromises !== "undefined") {
          if (component.returnValue === "") {
            component.dialogPromises.reject();
          } else {
            const buffer = component.props[GetBufferSymbol]();
            component.props[ClearBufferSymbol]();
            component.dialogPromises.resolve(buffer);
          }
          component.dialogPromises = undefined;
        }
        if (component.useBufferedBind && typeof component.parentComponent !== "undefined") {
          if (component.returnValue !== "") {
            component.props[FlushBufferSymbol]();
          }
        }
      });
      component.addEventListener("close", () => {
        const closedEvent = new CustomEvent("closed");
        component.dispatchEvent(closedEvent);
      });
    }

    async #show(props:{[key:string]:any}, modal = true) {
      const component = this.#component;
      component.returnValue = "";
      component.dialogPromises = Promise.withResolvers();
      component.props[SetBufferSymbol](props);
      if (modal) {
        HTMLDialogElement.prototype.showModal.apply(component);
      } else {
        HTMLDialogElement.prototype.show.apply(component);
      }
      return component.dialogPromises.promise;
    }
  
    async asyncShowModal(props:{[key:string]:any}):Promise<void> {
      if (!(this instanceof HTMLDialogElement)) {
        utils.raise("DialogComponent: asyncShowModal is only for HTMLDialogElement");
      }
      return this.#show(props, true);
    }

    async asyncShow(props:{[key:string]:any}):Promise<void> {
      if (!(this instanceof HTMLDialogElement)) {
        utils.raise("DialogComponent: asyncShow is only for HTMLDialogElement");
      }
      return this.#show(props, false);
    }
  
    showModal() {
      if (!(this instanceof HTMLDialogElement)) {
        utils.raise("DialogComponent: showModal is only for HTMLDialogElement");
      }
      const component = this.#component;
      if (component.useBufferedBind && typeof component.parentComponent !== "undefined") {
        component.returnValue = "";
        const buffer = component.props[CreateBufferSymbol]();
        component.props[SetBufferSymbol](buffer);
      }
      return HTMLDialogElement.prototype.showModal.apply(component);
    }

    show() {
      if (!(this instanceof HTMLDialogElement)) {
        utils.raise("DialogComponent: show is only for HTMLDialogElement");
      }
      const component = this.#component;
      if (component.useBufferedBind && typeof component.parentComponent !== "undefined") {
        component.returnValue = "";
        const buffer = component.props[CreateBufferSymbol]();
        component.props[SetBufferSymbol](buffer);
      }
      return HTMLDialogElement.prototype.show.apply(component);
    }

    close(returnValue:string = "") {
      if (!(this instanceof HTMLDialogElement)) {
        utils.raise("DialogComponent: close is only for HTMLDialogElement");
      }
      const component = this.#component;
      return HTMLDialogElement.prototype.close.apply(component, [returnValue]);
    }
      
  };
}

