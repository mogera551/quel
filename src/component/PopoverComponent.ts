
import { ClearBufferSymbol, CreateBufferSymbol, FlushBufferSymbol, GetBufferSymbol, SetBufferSymbol } from "../props/symbols";
import { NotifyForDependentPropsApiSymbol } from "../state/symbols";
import { IPopoverComponent, Constructor, IDialogComponent, ICustomComponent, IComponentBase, IBufferedBindComponent } from "./types";
import { createPopoverInfo } from "../popover/createPopoverInfo";
import { IPopoverInfo } from "../popover/types";
import { utils } from "../utils";

type BaseComponent = HTMLElement & IComponentBase & ICustomComponent & IDialogComponent & IBufferedBindComponent;

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
    #popoverPromises?: PromiseWithResolvers<{[key: string]: any}|undefined>;

    #popoverInfo = createPopoverInfo();
    get quelPopoverInfo(): IPopoverInfo {
      return this.#popoverInfo;
    }
  
    get isPopover(): boolean {
      return this.hasAttribute("popover");
    }

    constructor(...args:any[]) {
      super();
      if (this.isPopover) {
        this.addEventListener("hidden", () => {
          if (typeof this.#popoverPromises !== "undefined") {
            const buffer = this.quelProps[GetBufferSymbol]();
            this.#popoverPromises.resolve(buffer);
            this.#popoverPromises = undefined;
          }
        });
        this.addEventListener("shown", () => {
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
    }

    showPopover(props?:{[key:string]:any}, withAsync: boolean = false): PromiseWithResolvers<{[key: string]: any}|undefined>|void {
      !(this.isPopover) && utils.raise("This method can only be called from a popover element.");
      const popoverPromises = this.#popoverPromises = withAsync ? Promise.withResolvers() : undefined;
      if (props) this.quelProps[SetBufferSymbol](props);
      HTMLElement.prototype.showPopover.apply(this);
      if (popoverPromises) return popoverPromises;
    }

    hidePopover(): void {
      !(this.isPopover) && utils.raise("This method can only be called from a popover element.");
      HTMLElement.prototype.hidePopover.apply(this);
    }
 
 };
}