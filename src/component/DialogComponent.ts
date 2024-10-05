
import { utils } from "../utils";
import { ClearBufferSymbol, CreateBufferSymbol, FlushBufferSymbol, GetBufferSymbol, SetBufferSymbol } from "./symbols";
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

