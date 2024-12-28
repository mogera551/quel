
import { utils } from "../utils";
import { ClearBufferSymbol, CreateBufferSymbol, FlushBufferSymbol, GetBufferSymbol, SetBufferSymbol } from "../props/symbols";
import { IDialogComponent, Constructor, ICustomComponent, IComponentBase } from "./types";

type BaseComponent = HTMLElement & IComponentBase & ICustomComponent;

/**
 * コンポーネントをダイアログを簡単に表示できるように拡張する
 * 拡張内容は以下の通り
 * - dialogPromises: ダイアログ用Promise
 * - returnValue: 戻り値
 * - useBufferedBind: バッファードバインドを使用するかどうか
 * - asyncShowModal: モーダルダイアログ表示
 * - asyncShow: ダイアログ表示
 * - showModal: モーダルダイアログ表示
 * - show: ダイアログ表示
 * - close: ダイアログを閉じる
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
        if (this.useBufferedBind && typeof this.quelParentComponent !== "undefined") {
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

    async #show(props:{[key:string]:any}, modal = true) {
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
      if (this.useBufferedBind && typeof this.quelParentComponent !== "undefined") {
        this.returnValue = "";
        const buffer = this.quelProps[CreateBufferSymbol]();
        this.quelProps[SetBufferSymbol](buffer);
      }
      return HTMLDialogElement.prototype.showModal.apply(this);
    }

    quelShow() {
      if (!(this instanceof HTMLDialogElement)) {
        utils.raise("DialogComponent: show is only for HTMLDialogElement");
      }
      if (this.useBufferedBind && typeof this.quelParentComponent !== "undefined") {
        this.returnValue = "";
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

