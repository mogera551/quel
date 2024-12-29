
import { ClearBufferSymbol, CreateBufferSymbol, FlushBufferSymbol, GetBufferSymbol, SetBufferSymbol } from "../props/symbols";
import { NotifyForDependentPropsApiSymbol } from "../state/symbols";
import { IPopoverComponent, Constructor, IDialogComponent, ICustomComponent, IComponentBase } from "./types";
import { createPopoverInfo } from "../popover/createPopoverInfo";
import { IPopoverInfo } from "../popover/types";

type BaseComponent = HTMLElement & IComponentBase & ICustomComponent & IDialogComponent

/**
 * コンポーネントをポップオーバーできるように拡張します
 * 拡張内容は以下の通り
 * - popoverPromises: ポップオーバー用Promise
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
    get quelCanceled(): boolean {
      return this.#canceled;
    }
    set quelCanceled(value: boolean) {
      this.#canceled = value;
    }

    #popoverPromises?: PromiseWithResolvers<any>;
    get quelPopoverPromises(): PromiseWithResolvers<any>|undefined {
      return this.#popoverPromises;
    }

    #popoverInfo = createPopoverInfo();
    get quelPopoverInfo(): IPopoverInfo {
      return this.#popoverInfo;
    }
  
    constructor(...args:any[]) {
      super();
      this.addEventListener("hidden", () => {
        if (typeof this.quelPopoverPromises !== "undefined") {
          if (this.quelCanceled) {
            this.quelPopoverPromises.reject();
          } else {
            const buffer = this.quelProps[GetBufferSymbol]();
            this.quelProps[ClearBufferSymbol]();
            this.quelPopoverPromises.resolve(buffer);
          }
          this.#popoverPromises = undefined;
        }
        if (this.quelUseBufferedBind && typeof this.quelParentComponent !== "undefined") {
          if (!this.quelCanceled) {
            this.quelProps[FlushBufferSymbol]();
          }
        }
        this.quelCanceled = true;
        // remove loop context
        const id = this.id;
      });
      this.addEventListener("shown", () => {
        this.quelCanceled = true;
        if (this.quelUseBufferedBind && typeof this.quelParentComponent !== "undefined") {
          const buffer = this.quelProps[CreateBufferSymbol]();
          this.quelProps[SetBufferSymbol](buffer);
        }
        for(const key in this.quelProps) {
          this.quelState[NotifyForDependentPropsApiSymbol](key, undefined);
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

    quelShowPopover(): void {
      HTMLElement.prototype.showPopover.apply(this);
    }

    async quelAsyncShowPopover(props:{[key:string]:any}):Promise<any> {
      const popoverPromises = this.#popoverPromises = Promise.withResolvers();
      this.quelProps[SetBufferSymbol](props);
      HTMLElement.prototype.showPopover.apply(this);
      return popoverPromises.promise;
    }

    quelHidePopover() {
      this.quelCanceled = false;
      HTMLElement.prototype.hidePopover.apply(this);
    }

    quelCancelPopover() {
      HTMLElement.prototype.hidePopover.apply(this);
    }
  };
}