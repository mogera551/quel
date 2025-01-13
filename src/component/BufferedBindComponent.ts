import { FlushBufferSymbol } from "../props/symbols";
import { IBufferedBindComponent, IComponentBase, ICustomComponent, Constructor } from "./types";

type BaseComponent = HTMLElement & IComponentBase & ICustomComponent;

export function BufferedBindComponent<TBase extends Constructor<BaseComponent>>(Base: TBase): Constructor<BaseComponent & IBufferedBindComponent> {
  return class extends Base implements IBufferedBindComponent {
    get quelUseBufferedBind(): boolean {
      return this.hasAttribute("buffered-bind");
    }
    quelCommitBufferedBindProps(): void {
      if (this.quelUseBufferedBind) {
        this.quelProps[FlushBufferSymbol]();
      }
    }
  };
}
