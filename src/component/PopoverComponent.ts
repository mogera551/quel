
import { ClearBufferSymbol, CreateBufferSymbol, FlushBufferSymbol, GetBufferSymbol, SetBufferSymbol } from "../@symbols/component";
import { Constructor, IComponent } from "../@types/component";
import { IPopoverComponent } from "../@types/component";
import { NotifyForDependentPropsApiSymbol } from "../state/Const";

function PopoverComponent<TBase extends Constructor>(Base: TBase) {
  return class extends Base implements IPopoverComponent {
    #canceled:boolean = false;
    get canceled():boolean {
      return this.#canceled;
    }
    set canceled(value:boolean) {
      this.#canceled = value;
    }

    #popoverPromises:PromiseWithResolvers<any>|undefined;
    get popoverPromises():PromiseWithResolvers<any>|undefined {
      return this.#popoverPromises;
    }
    set popoverPromises(value:PromiseWithResolvers<any>|undefined) {
      this.#popoverPromises = value;
    }

    #popoverContextIndexesById:Map<string,number[]>|undefined;
    get popoverContextIndexesById():Map<string,number[]> {
      if (typeof this.#popoverContextIndexesById === "undefined") {
        this.#popoverContextIndexesById = new Map;
      }
      return this.#popoverContextIndexesById;
    }
  
    get #component():IComponent {
      return this as unknown as IComponent;
    }
    constructor(...args:any[]) {
      super();
      const component = this.#component;
      component.addEventListener("hidden", () => {
        if (typeof component.popoverPromises !== "undefined") {
          if (component.canceled) {
            component.popoverPromises.reject();
          } else {
            const buffer = component.props[GetBufferSymbol]();
            component.props[ClearBufferSymbol]();
            component.popoverPromises.resolve(buffer);
          }
          component.popoverPromises = undefined;
        }
        if (component.useBufferedBind && typeof component.parentComponent !== "undefined") {
          if (!component.canceled) {
            component.props[FlushBufferSymbol]();
          }
        }
        component.canceled = true;
        // remove loop context
        const id = component.id;
        if (typeof id !== "undefined") {
          component.popoverContextIndexesById.delete(id);
        }
      });
      component.addEventListener("shown", () => {
        component.canceled = true;
        if (component.useBufferedBind && typeof component.parentComponent !== "undefined") {
          const buffer = component.props[CreateBufferSymbol]();
          component.props[SetBufferSymbol](buffer);
        }
        for(const key in component.props) {
          component.currentState[NotifyForDependentPropsApiSymbol](key, []);
        }
      });
      component.addEventListener("toggle", (e:Event) => {
        const toggleEvent = e as ToggleEvent;
        if (toggleEvent.newState === "closed") {
          const hiddenEvent = new CustomEvent("hidden");
          component.dispatchEvent(hiddenEvent);
        } else if (toggleEvent.newState === "open") {
          const shownEvent = new CustomEvent("shown");
          component.dispatchEvent(shownEvent);
        }
      });
    }

    async asyncShowPopover(props:{[key:string]:any}):Promise<any> {
      const component = this.#component;
      component.popoverPromises = Promise.withResolvers();
      component.props[SetBufferSymbol](props);
      HTMLElement.prototype.showPopover.apply(component);
      return component.popoverPromises.promise;
    }

    hidePopover() {
      const component = this.#component;
      component.canceled = false;
      HTMLElement.prototype.hidePopover.apply(component);
    }

    cancelPopover() {
      const component = this.#component;
      HTMLElement.prototype.hidePopover.apply(component);
    }
  };
}