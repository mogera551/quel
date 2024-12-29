
import { utils } from "../utils";
import { ClearBufferSymbol, CreateBufferSymbol, FlushBufferSymbol, GetBufferSymbol, SetBufferSymbol } from "../props/symbols";
import { IDialogComponent, Constructor, ICustomComponent, IComponentBase } from "./types";

type BaseComponent = HTMLElement & IComponentBase & ICustomComponent;

/**
 * コンポーネントをダイアログを簡単に表示できるように拡張する
 * 拡張内容は以下の通り
 * - quelDialogPromises: ダイアログ用Promise
 * - quelAsyncShowModal: モーダルダイアログ表示
 * - quelAsyncShow: ダイアログ表示
 * - quelShowModal: モーダルダイアログ表示
 * - quelShow: ダイアログ表示
 * - quelClose: ダイアログを閉じる
 * - show: override
 * - showModal: override
 * - close: override
 * - returnValue: override
 * @param Base 元のコンポーネント
 * @returns {IDialogComponent} 拡張されたコンポーネント
 */
export function DialogComponent<TBase extends Constructor<BaseComponent>>(Base: TBase): Constructor<BaseComponent & IDialogComponent> {
  return class extends Base implements IDialogComponent {
    #dialogPromises?: PromiseWithResolvers<any>;
    get quelDialogPromises(): PromiseWithResolvers<any> {
      return this.#dialogPromises ?? utils.raise("DialogComponent: quelDialogPromises is not defined");
    }

    #returnValue:string = "";
    get returnValue() {
      return this.#returnValue;
    }
    set returnValue(value:string) {
      this.#returnValue = value;
    }

    get quelUseBufferedBind() {
      return this.hasAttribute("buffered-bind");
    }
  
    constructor(...args:any[]) {
      super();
      this.addEventListener("closed", () => {
        if (typeof this.quelDialogPromises !== "undefined") {
          if (this.returnValue === "") {
            this.quelDialogPromises.reject();
          } else {
            const buffer = this.quelProps[GetBufferSymbol]();
            this.quelProps[ClearBufferSymbol]();
            this.quelDialogPromises.resolve(buffer);
          }
          this.#dialogPromises = undefined;
        }
        if (this.quelUseBufferedBind && typeof this.quelParentComponent !== "undefined") {
          if (this.returnValue !== "") {
            this.quelProps[FlushBufferSymbol]();
          }
        }
      });
      this.addEventListener("close", () => {
        const closedEvent = new CustomEvent("closed");
        this.dispatchEvent(closedEvent);
      });
    }

    async #asyncShow(props:{[key:string]:any}, modal = true) {
      this.returnValue = "";
      const dialogPromise = this.#dialogPromises = Promise.withResolvers();
      this.quelProps[SetBufferSymbol](props);
      if (modal) {
        HTMLDialogElement.prototype.showModal.apply(this);
      } else {
        HTMLDialogElement.prototype.show.apply(this);
      }
      return dialogPromise.promise;
    }
  
    async quelAsyncShowModal(props: {[key: string]: any}): Promise<void> {
      if (!(this instanceof HTMLDialogElement)) {
        utils.raise("DialogComponent: quelAsyncShowModal is only for HTMLDialogElement");
      }
      return this.#asyncShow(props, true);
    }

    async quelAsyncShow(props: {[key: string]: any}): Promise<void> {
      if (!(this instanceof HTMLDialogElement)) {
        utils.raise("DialogComponent: quelAsyncShow is only for HTMLDialogElement");
      }
      return this.#asyncShow(props, false);
    }
  
    quelShowModal() {
      if (!(this instanceof HTMLDialogElement)) {
        utils.raise("DialogComponent: quelShowModal is only for HTMLDialogElement");
      }
      if (this.quelUseBufferedBind && typeof this.quelParentComponent !== "undefined") {
        this.returnValue = "";
        const buffer = this.quelProps[CreateBufferSymbol]();
        this.quelProps[SetBufferSymbol](buffer);
      }
      return HTMLDialogElement.prototype.showModal.apply(this);
    }

    showModal() {
      if (!(this instanceof HTMLDialogElement)) {
        utils.raise("DialogComponent: showModal is only for HTMLDialogElement");
      }
      return this.quelShowModal();
    }

    quelShow() {
      if (!(this instanceof HTMLDialogElement)) {
        utils.raise("DialogComponent: quelShow is only for HTMLDialogElement");
      }
      if (this.quelUseBufferedBind && typeof this.quelParentComponent !== "undefined") {
        this.returnValue = "";
        const buffer = this.quelProps[CreateBufferSymbol]();
        this.quelProps[SetBufferSymbol](buffer);
      }
      return HTMLDialogElement.prototype.show.apply(this);
    }

    show() {
      if (!(this instanceof HTMLDialogElement)) {
        utils.raise("DialogComponent: show is only for HTMLDialogElement");
      }
      return this.quelShow();
    }

    quelClose(returnValue:string = "") {
      if (!(this instanceof HTMLDialogElement)) {
        utils.raise("DialogComponent: close is only for HTMLDialogElement");
      }
      return HTMLDialogElement.prototype.close.apply(this, [returnValue]);
    }

    close(returnValue:string = "") {
      if (!(this instanceof HTMLDialogElement)) {
        utils.raise("DialogComponent: close is only for HTMLDialogElement");
      }
      return this.quelClose(returnValue);
    }
      
  };
}

