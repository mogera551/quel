
import { utils } from "../utils";
import { ClearBufferSymbol, CreateBufferSymbol, FlushBufferSymbol, GetBufferSymbol, SetBufferSymbol } from "../props/symbols";
import { IDialogComponent, Constructor, ICustomComponent, IComponentBase, IBufferedBindComponent } from "./types";
import { NotifyForDependentPropsApiSymbol } from "../state/symbols";
import { createInvokerCommandsInfo } from "../invokerCommands/createInvokerCommandsInfo";
import { IInvokerCommandsInfo } from "../invokerCommands/types";

type BaseComponent = HTMLElement & IComponentBase & ICustomComponent & IBufferedBindComponent;

/**
 * コンポーネントをダイアログを簡単に表示できるように拡張する
 * 拡張内容は以下の通り
 * - show: override
 * - showModal: override
 * - close: override
 * - returnValue: override
 * @param Base 元のコンポーネント
 * @returns {IDialogComponent} 拡張されたコンポーネント
 */
export function DialogComponent<TBase extends Constructor<BaseComponent>>(Base: TBase): Constructor<BaseComponent & IDialogComponent> {
  return class extends Base implements IDialogComponent {
    #dialogPromises?: PromiseWithResolvers<{[key: string]: any}|undefined>;

    #invokerCommandsInfo = createInvokerCommandsInfo();
    get quelInvokerCommandsInfo(): IInvokerCommandsInfo {
      return this.#invokerCommandsInfo;
    }
    constructor(...args:any[]) {
      super();
      if (this instanceof HTMLDialogElement) {
        this.addEventListener("close", (event) => {
          if (typeof this.#dialogPromises !== "undefined") {
            if (this.returnValue === "") {
              this.#dialogPromises.resolve(undefined);
            } else {
              const buffer = this.quelProps[GetBufferSymbol]();
              this.#dialogPromises.resolve(buffer);
            }
            this.#dialogPromises = undefined;
          }
          if (this.quelUseBufferedBind && typeof this.quelParentComponent !== "undefined") {
            if (this.returnValue !== "") {
              this.quelCommitBufferedBindProps();              
            }
          }
          this.quelProps[ClearBufferSymbol]();
        });
      }
    }

    #setBuffer() {
      if (this.quelUseBufferedBind && typeof this.quelParentComponent !== "undefined") {
        const buffer = this.quelProps[CreateBufferSymbol]();
        this.quelProps[SetBufferSymbol](buffer);
      }
      for(const key in this.quelProps) {
        this.quelState[NotifyForDependentPropsApiSymbol](key, undefined);
      }
    }
    show(props:{[key:string]:any}|undefined = undefined, withAsync:boolean = false): PromiseWithResolvers<{[key: string]: any}|undefined>|void {
      !(this instanceof HTMLDialogElement) && utils.raise("This method can only be called from a dialog element.");
      const dialogPromise = this.#dialogPromises = withAsync ? Promise.withResolvers() : undefined;
      if (props) this.quelProps[SetBufferSymbol](props);
      this.#setBuffer();
      HTMLDialogElement.prototype.show.apply(this);
      if (dialogPromise) return dialogPromise;
    }

    showModal(props:{[key:string]:any}|undefined = undefined, withAsync:boolean = false): PromiseWithResolvers<{[key: string]: any}|undefined>|void {
      !(this instanceof HTMLDialogElement) && utils.raise("This method can only be called from a dialog element.");
      const dialogPromise = this.#dialogPromises = withAsync ? Promise.withResolvers() : undefined;
      if (props) this.quelProps[SetBufferSymbol](props);
      this.#setBuffer();
      HTMLDialogElement.prototype.showModal.apply(this);
      if (dialogPromise) return dialogPromise;
    }

    close(returnValue:string = ""): void {
      !(this instanceof HTMLDialogElement) && utils.raise("This method can only be called from a dialog element.");
      HTMLDialogElement.prototype.close.apply(this, [returnValue]);
    }
  };
}

