
import { utils } from "../utils";
import { ClearBufferSymbol, CreateBufferSymbol, FlushBufferSymbol, GetBufferSymbol, SetBufferSymbol } from "../@symbols/component";
import { INewComponent, INewDialogComponent, Constructor, INewCustomComponent, INewComponentBase } from "../@types/types";

export function DialogComponent<TBase extends Constructor<HTMLElement & INewComponentBase & INewCustomComponent>>(Base: TBase) {
  return class extends Base implements INewDialogComponent {
    #dialogPromises?: PromiseWithResolvers<any>;
    get dialogPromises(): PromiseWithResolvers<any>|undefined {
      return this.#dialogPromises;
    }
    set dialogPromises(value: PromiseWithResolvers<any>|undefined) {
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
      return this.hasAttribute("buffered-bind");
    }
  
    constructor(...args:any[]) {
      super();
      this.addEventListener("closed", () => {
        if (typeof this.dialogPromises !== "undefined") {
          if (this.returnValue === "") {
            this.dialogPromises.reject();
          } else {
            const buffer = this.props[GetBufferSymbol]();
            this.props[ClearBufferSymbol]();
            this.dialogPromises.resolve(buffer);
          }
          this.dialogPromises = undefined;
        }
        if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
          if (this.returnValue !== "") {
            this.props[FlushBufferSymbol]();
          }
        }
      });
      this.addEventListener("close", () => {
        const closedEvent = new CustomEvent("closed");
        this.dispatchEvent(closedEvent);
      });
    }

    async #show(props:{[key:string]:any}, modal = true) {
      this.returnValue = "";
      this.dialogPromises = Promise.withResolvers();
      this.props[SetBufferSymbol](props);
      if (modal) {
        HTMLDialogElement.prototype.showModal.apply(this);
      } else {
        HTMLDialogElement.prototype.show.apply(this);
      }
      return this.dialogPromises.promise;
    }
  
    async asyncShowModal(props: {[key: string]: any}): Promise<void> {
      if (!(this instanceof HTMLDialogElement)) {
        utils.raise("DialogComponent: asyncShowModal is only for HTMLDialogElement");
      }
      return this.#show(props, true);
    }

    async asyncShow(props: {[key: string]: any}): Promise<void> {
      if (!(this instanceof HTMLDialogElement)) {
        utils.raise("DialogComponent: asyncShow is only for HTMLDialogElement");
      }
      return this.#show(props, false);
    }
  
    showModal() {
      if (!(this instanceof HTMLDialogElement)) {
        utils.raise("DialogComponent: showModal is only for HTMLDialogElement");
      }
      if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
        this.returnValue = "";
        const buffer = this.props[CreateBufferSymbol]();
        this.props[SetBufferSymbol](buffer);
      }
      return HTMLDialogElement.prototype.showModal.apply(this);
    }

    show() {
      if (!(this instanceof HTMLDialogElement)) {
        utils.raise("DialogComponent: show is only for HTMLDialogElement");
      }
      if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
        this.returnValue = "";
        const buffer = this.props[CreateBufferSymbol]();
        this.props[SetBufferSymbol](buffer);
      }
      return HTMLDialogElement.prototype.show.apply(this);
    }

    close(returnValue:string = "") {
      if (!(this instanceof HTMLDialogElement)) {
        utils.raise("DialogComponent: close is only for HTMLDialogElement");
      }
      return HTMLDialogElement.prototype.close.apply(this, [returnValue]);
    }
      
  };
}

