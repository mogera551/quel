
import { ClearBufferSymbol, CreateBufferSymbol, FlushBufferSymbol, GetBufferSymbol, SetBufferSymbol } from "./symbols";
import { NotifyForDependentPropsApiSymbol } from "../state/symbols";
import { IPopoverComponent, Constructor, IDialogComponent, ICustomComponent, IComponentBase } from "./types";

type BaseComponent = HTMLElement & IComponentBase & ICustomComponent & IDialogComponent

/**
 * コンポーネントをポップオーバーできるように拡張します
 * 拡張内容は以下の通り
 * - popoverPromises: ポップオーバー用Promise
 * - popoverContextIndexesById: ポップオーバーコンテキストインデックス
 * - canceled: キャンセルフラグ
 * - asyncShowPopover: ポップオーバー表示
 * - hidePopover: ポップオーバーを閉じる
 * - cancelPopover: ポップオーバーをキャンセル
 * 
 * @param Base 元のコンポーネント
 * @returns {IPopoverComponent} 拡張されたコンポーネント
 */
export function PopoverComponent<TBase extends Constructor<BaseComponent>>(Base: TBase): Constructor<BaseComponent & IPopoverComponent> {
  return class extends Base implements IPopoverComponent {
    #canceled: boolean = false;
    get canceled(): boolean {
      return this.#canceled;
    }
    set canceled(value: boolean) {
      this.#canceled = value;
    }

    #popoverPromises?: PromiseWithResolvers<any>;
    get popoverPromises(): PromiseWithResolvers<any>|undefined {
      return this.#popoverPromises;
    }
    set popoverPromises(value:PromiseWithResolvers<any>|undefined) {
      this.#popoverPromises = value;
    }

    #popoverContextIndexesById?: Map<string,number[]>;
    get popoverContextIndexesById(): Map<string,number[]> {
      if (typeof this.#popoverContextIndexesById === "undefined") {
        this.#popoverContextIndexesById = new Map;
      }
      return this.#popoverContextIndexesById;
    }
  
    constructor(...args:any[]) {
      super();
      this.addEventListener("hidden", () => {
        if (typeof this.popoverPromises !== "undefined") {
          if (this.canceled) {
            this.popoverPromises.reject();
          } else {
            const buffer = this.props[GetBufferSymbol]();
            this.props[ClearBufferSymbol]();
            this.popoverPromises.resolve(buffer);
          }
          this.popoverPromises = undefined;
        }
        if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
          if (!this.canceled) {
            this.props[FlushBufferSymbol]();
          }
        }
        this.canceled = true;
        // remove loop context
        const id = this.id;
        if (typeof id !== "undefined") {
          this.popoverContextIndexesById.delete(id);
        }
      });
      this.addEventListener("shown", () => {
        this.canceled = true;
        if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
          const buffer = this.props[CreateBufferSymbol]();
          this.props[SetBufferSymbol](buffer);
        }
        for(const key in this.props) {
          this.states.current[NotifyForDependentPropsApiSymbol](key, []);
        }
      });
      this.addEventListener("toggle", (e:Event) => {
        const toggleEvent = e as ToggleEvent;
        if (toggleEvent.newState === "closed") {
          const hiddenEvent = new CustomEvent("hidden");
          this.dispatchEvent(hiddenEvent);
        } else if (toggleEvent.newState === "open") {
          const shownEvent = new CustomEvent("shown");
          this.dispatchEvent(shownEvent);
        }
      });
    }

    async asyncShowPopover(props:{[key:string]:any}):Promise<any> {
      this.popoverPromises = Promise.withResolvers();
      this.props[SetBufferSymbol](props);
      HTMLElement.prototype.showPopover.apply(this);
      return this.popoverPromises.promise;
    }

    hidePopover() {
      this.canceled = false;
      HTMLElement.prototype.hidePopover.apply(this);
    }

    cancelPopover() {
      HTMLElement.prototype.hidePopover.apply(this);
    }
  };
}