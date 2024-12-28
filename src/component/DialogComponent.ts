
import { utils } from "../utils";
import { ClearBufferSymbol, CreateBufferSymbol, FlushBufferSymbol, GetBufferSymbol, SetBufferSymbol } from "../props/symbols";
import { IDialogComponent, Constructor, ICustomComponent, IComponentBase } from "./types";

type BaseComponent = HTMLElement & IComponentBase & ICustomComponent;

/**
 * コンポーネントをダイアログを簡単に表示できるように拡張する
 * 拡張内容は以下の通り
 * - quelDialogPromises: ダイアログ用Promise
 * - quelReturnValue: 戻り値
 * - quelAsyncShowModal: モーダルダイアログ表示
 * - quelAsyncShow: ダイアログ表示
 * - quelShowModal: モーダルダイアログ表示
 * - quelShow: ダイアログ表示
 * - quelClose: ダイアログを閉じる
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
    get quelReturnValue():string {
      return this.#returnValue;
    }
    set quelReturnValue(value:string) {
      this.#returnValue = value;
    }

    get quelUseBufferedBind() {
      return this.hasAttribute("buffered-bind");
    }
  
    constructor(...args:any[]) {
      super();
      this.addEventListener("closed", () => {
        if (typeof this.quelDialogPromises !== "undefined") {
          if (this.quelReturnValue === "") {
            this.quelDialogPromises.reject();
          } else {
            const buffer = this.quelProps[GetBufferSymbol]();
            this.quelProps[ClearBufferSymbol]();
            this.quelDialogPromises.resolve(buffer);
          }
          this.#dialogPromises = undefined;
        }
        if (this.quelUseBufferedBind && typeof this.quelParentComponent !== "undefined") {
          if (this.quelReturnValue !== "") {
            this.quelProps[FlushBufferSymbol]();
          }
        }
      });
      this.addEventListener("close", () => {
        const closedEvent = new CustomEvent("closed");
        this.dispatchEvent(closedEvent);
      });
    }

    async #show(props:{[key:string]:any}, modal = true) {
      this.quelReturnValue = "";
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
        utils.raise("DialogComponent: asyncShowModal is only for HTMLDialogElement");
      }
      return this.#show(props, true);
    }

    async quelAsyncShow(props: {[key: string]: any}): Promise<void> {
      if (!(this instanceof HTMLDialogElement)) {
        utils.raise("DialogComponent: asyncShow is only for HTMLDialogElement");
      }
      return this.#show(props, false);
    }
  
    quelShowModal() {
      if (!(this instanceof HTMLDialogElement)) {
        utils.raise("DialogComponent: showModal is only for HTMLDialogElement");
      }
      if (this.quelUseBufferedBind && typeof this.quelParentComponent !== "undefined") {
        this.quelReturnValue = "";
        const buffer = this.quelProps[CreateBufferSymbol]();
        this.quelProps[SetBufferSymbol](buffer);
      }
      return HTMLDialogElement.prototype.showModal.apply(this);
    }

    quelShow() {
      if (!(this instanceof HTMLDialogElement)) {
        utils.raise("DialogComponent: show is only for HTMLDialogElement");
      }
      if (this.quelUseBufferedBind && typeof this.quelParentComponent !== "undefined") {
        this.quelReturnValue = "";
        const buffer = this.quelProps[CreateBufferSymbol]();
        this.quelProps[SetBufferSymbol](buffer);
      }
      return HTMLDialogElement.prototype.show.apply(this);
    }

    quelClose(returnValue:string = "") {
      if (!(this instanceof HTMLDialogElement)) {
        utils.raise("DialogComponent: close is only for HTMLDialogElement");
      }
      return HTMLDialogElement.prototype.close.apply(this, [returnValue]);
    }
      
  };
}

